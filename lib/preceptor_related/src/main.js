import { Client, Account, Databases, Query, ID } from 'node-appwrite';
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async ({ req, res, log }) => {
  const { jwt, action, payload } = JSON.parse(req.body || '{}');

  if (!jwt || !action) {
    return res.json({ status: "error", message: "Missing jwt or action" });
  }

  const userClient = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.PROJECT_ID)
    .setJWT(jwt);

  const account = new Account(userClient);
  let user;

  const userDatabase = new Databases(userClient);

  try {
    user = await account.get();
  } catch (err) {
    return res.json({ status: "error", message: "User not logged in or invalid JWT" });
  }

  const adminClient = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.PROJECT_ID)
    .setKey(process.env.API_KEY);

  const adminDatabase = new Databases(adminClient);

  // Global role check: only allow preceptors
  const userMeta = await adminDatabase.getDocument(
    process.env.DB_ID,
    process.env.USERS_METADATA_COLLECTION_ID,
    user.$id
  );

  if (userMeta.role !== 'preceptor') {
    return res.json({
      status: 'error',
      message: 'Only preceptors are allowed to perform this action.'
    });
  }

  try {
    // Action: Get preceptor feedback with student info for a specific preceptor
    if (action === 'getPreceptorFeedbackWithStudent') {
      const feedbacks = await adminDatabase.listDocuments(
        process.env.DB_ID,
        process.env.PRECEPTOR_FEEDBACK_COLLECTION_ID,
        [Query.equal('preceptor_id', [user.$id])],
        100
      );

      const enrichedFeedbacks = await Promise.all(
        feedbacks.documents.map(async (fb) => {
          // 1. Get student info
          let studentInfo = null;
          try {
            studentInfo = await adminDatabase.getDocument(
              process.env.DB_ID,
              process.env.STUDENTS_COLLECTION_ID,
              fb.student_id
            );
          } catch (err) {
            studentInfo = { error: 'Student not found', id: fb.student_id };
          }

          // 2. Get ai feedback items
          let aiItems = [];
          try {
            const aiResult = await adminDatabase.listDocuments(
              process.env.DB_ID,
              process.env.PRECEPTOR_AI_FEEDBACK_ITEMS_COLLECTION_ID,
              [Query.equal('feedback_id', [fb.$id])]
            );
            aiItems = aiResult.documents;
          } catch (err) {
            aiItems = [];
          }

          // 3. Return enriched object
          return {
            ...fb,
            student: studentInfo,
            ai_items: aiItems
          };
        })
      );

      return res.json({
        status: 'success',
        data: enrichedFeedbacks
      });
    }


    // Action: Add preceptor feedback
    if (action === 'addPreceptorFeedback') {
      const {
        ai_item_list, // Example: { '2.4': false, '3.1': true }
        ...feedbackPayload
      } = payload;

      // 1. Create the main feedback document (excluding ai_item_list)
      const feedbackDoc = await adminDatabase.createDocument(
        process.env.DB_ID,
        process.env.PRECEPTOR_FEEDBACK_COLLECTION_ID,
        ID.unique(),
        feedbackPayload
      );

      const feedbackId = feedbackDoc.$id;

      // 2. Extract ai_item_list entries and insert each into a separate document
      const aiEntries = Object.entries(ai_item_list || {}); // Handle undefined/null

      const insertPromises = aiEntries.map(([item_id, is_positive]) => {
        return adminDatabase.createDocument(
          process.env.DB_ID,
          process.env.PRECEPTOR_AI_FEEDBACK_ITEMS_COLLECTION_ID,
          ID.unique(),
          {
            feedback_id: feedbackId,
            item_id,
            is_positive,
          }
        );
      });

      await Promise.all(insertPromises); // Concurrent insertion

      return res.json({ status: 'success', data: feedbackDoc });
    }

    // Action: Search students by fuzzy search (simplified for preceptors only)
    if (action === 'searchStudents') {
      const queryText = payload.query?.toLowerCase();

      if (!queryText || queryText.length < 2) {
        return res.json({
          status: "error",
          message: "Query too short"
        });
      }

      const filters = [Query.startsWith('full_name_lower', queryText)];

      const result = await adminDatabase.listDocuments(
        process.env.DB_ID,
        process.env.STUDENTS_COLLECTION_ID,
        filters,
        10
      );

      return res.json({
        status: "success",
        data: result.documents
      });
    }

    // Action: Generate AI feedback analysis based on standards
    if (action === 'getAiFeedbackPreceptor') {
      const { text } = payload || {};

      if (!text) {
        return res.json({ error: "Missing 'text' in payload" }, 400);
      }

      // Fetch standards from DB
      const responseDocs = await adminDatabase.listDocuments(
        process.env.DB_ID,
        process.env.ASSESSMENT_ITEMS_ID,
        []
      );

      const standards = responseDocs.documents.map(doc => ({
        id: doc.item_id,
        description: doc.description
      }));

      const prompt = `
You are a nursing standards evaluator. Your task is to analyze short pieces of feedback text and determine which of the following 23 nursing standards (each with an ID) are clearly matched by the content.

Each standard is formatted as: "<id>. <description>"

Here is the full list of standards:
${standards.map((s) => `${s.id}. ${s.description}`).join("\n")}

Now, given the following feedback:
"${text}"

Please identify ONLY the standards that are **explicitly or strongly implied** by the text. Be conservative — do not include standards unless there's a clear match in behavior, context, or keywords.

Respond ONLY with a single valid JSON object using this format:
{ "matched_ids": ["1.4", "2.1", "6.3"] }

Do NOT include any explanation or extra text.
`;

      const response = await groq.chat.completions.create({
        model: "llama3-70b-8192",
        stream: false,
        messages: [
          { role: "system", content: "You are an AI that identifies matching standards from a nursing competency list." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_completion_tokens: 512,
      });

      const output = response.choices[0].message.content;
      const parsed = JSON.parse(output);

      return res.json(parsed);
    }

    return res.json({ status: "error", message: "Unknown action: " + action });

  } catch (err) {
    return res.json({ status: "error", message: err.message });
  }
};
