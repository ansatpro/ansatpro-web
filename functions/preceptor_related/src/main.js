import { Client, Account, Databases, Query, ID } from 'node-appwrite';
import Groq from "groq-sdk";

/**
 * @fileoverview Appwrite cloud function for managing preceptor feedback in a nursing assessment platform.
 * 
 * Provides role-based access for authenticated preceptors to:
 * - Retrieve feedback entries with associated student and AI information.
 * - Add new feedback entries and corresponding AI assessment items.
 * - Perform fuzzy name-based student search.
 * - Analyze free-text feedback using Groq AI to match nursing competency standards.
 * 
 * Requires valid JWT for user identity verification and API key for administrative access.
 * 
 * Author: Haozhi Lian
 * Student ID: 24155751
 */

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Main handler for preceptor-related feedback operations.
 * Accepts requests with specific `action` types and routes them accordingly.
 *
 * @async
 * @function
 * @param {Object} param0
 * @param {import('node-appwrite').Models.FunctionRequest} param0.req - Incoming HTTP request containing JWT, action type, and optional payload.
 * @param {import('node-appwrite').Models.FunctionResponse} param0.res - HTTP response object used to send JSON responses.
 * @param {Function} param0.log - Logging utility for diagnostics.
 * 
 * @returns {Promise<void>} JSON response containing result data or error message.
 */

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
    /**
     * Retrieves all feedback submitted by the current preceptor,
     * enriched with corresponding student data and AI-generated feedback item descriptions.
     */
    if (action === 'getPreceptorFeedbackWithStudent') {
      const feedbacks = await adminDatabase.listDocuments(
        process.env.DB_ID,
        process.env.PRECEPTOR_FEEDBACK_COLLECTION_ID,
        [Query.equal('preceptor_id', [user.$id]), Query.orderDesc('$createdAt')],
        100
      );

      const enrichedFeedbacks = await Promise.all(
        feedbacks.documents.map(async (fb) => {
          // 1. Get student info
          let student = {};
          try {
            const studentDoc = await adminDatabase.getDocument(
              process.env.DB_ID,
              process.env.STUDENTS_COLLECTION_ID,
              fb.student_document_id
            );
            student = {
              student_id: studentDoc.student_id,
              first_name: studentDoc.first_name,
              last_name: studentDoc.last_name,
              university_id: studentDoc.university_id,
              health_service_id: studentDoc.health_service_id,
              clinic_area_id: studentDoc.clinic_area_id
            };
          } catch {
            student = {
              student_id: fb.student_document_id,
              first_name: "Unknown",
              last_name: ""
            };
          }

          // 2. Get AI feedback items
          let aiItems = [];
          try {
            const aiResult = await adminDatabase.listDocuments(
              process.env.DB_ID,
              process.env.PRECEPTOR_AI_FEEDBACK_ITEMS_COLLECTION_ID,
              [Query.equal('feedback_id', [fb.$id])]
            );
            aiItems = aiResult.documents;
          } catch {
            aiItems = [];
          }

          // 3. For each item_id, get its description from assessment_items
          const aiItemMap = {};
          await Promise.all(aiItems.map(async (item) => {
            try {
              const itemId = String(item.item_id); // Force string type
              const result = await adminDatabase.listDocuments(
                process.env.DB_ID,
                process.env.ASSESSMENT_ITEMS_ID,
                [Query.equal('item_id', [itemId])]
              );

              const description = result.documents.length > 0
                ? result.documents[0].description
                : "Description not found";

              aiItemMap[itemId] = {
                description,
                is_positive: item.is_positive
              };
            } catch (err) {
              console.error("Failed to fetch description for", item.item_id, err.message);
              aiItemMap[item.item_id] = {
                description: "Description not found",
                is_positive: item.is_positive
              };
            }
          }));
          // 4. Build final return object
          return {
            // 🧠 Student info
            student_id: student.student_id,
            first_name: student.first_name,
            last_name: student.last_name,
            university_id: student.university_id,
            health_service_id: student.health_service_id,
            clinic_area_id: student.clinic_area_id,

            // 📋 Feedback content
            content: fb.content,
            flag_discuss_with_facilitator: fb.flag_discuss_with_facilitator,
            flag_discussed_with_student: fb.flag_discussed_with_student,
            discussion_date: fb.discussion_date,
            created_at: fb.$createdAt,

            // 🤖 AI items
            ai_items: aiItemMap
          };

        })
      );

      return res.json({
        status: 'success',
        data: enrichedFeedbacks
      });
    }

    /**
     * Creates a new preceptor feedback entry in the database.
     * Also creates related AI feedback items and generates a notification for the facilitator if flagged.
     */
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

      // 3. ✅ Generate notification if flagged for facilitator discussion
      if (feedbackPayload.flag_discuss_with_facilitator === true) {
        try {
          const student = await adminDatabase.getDocument(
            process.env.DB_ID,
            process.env.STUDENTS_COLLECTION_ID,
            feedbackPayload.student_document_id
          );

          const facilitatorId = student.created_by;
          const message = `Preceptor ${user.name} has submitted feedback for student ${student.first_name} ${student.last_name} (Student ID: ${student.student_id} Student school: ${student.university_id} ) and flagged it for discussion.`;

          await adminDatabase.createDocument(
            process.env.DB_ID,
            process.env.NOTIFICATIONS_COLLECTION_ID,
            ID.unique(),
            {
              recipient_id: facilitatorId,
              message,
              is_read: false
            }
          );
        } catch (err) {
          log("⚠️ Failed to create notification:", err.message);
        }
      }

      return res.json({ status: 'success', data: feedbackDoc });
    }

    /**
     * Searches student records using a case-insensitive fuzzy match on the student's full name.
     * Limited to 10 results for performance and clarity.
     */
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

    /**
     * Uses Groq's LLM to analyze the submitted feedback text
     * and identify nursing standards that clearly match its content.
     */
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