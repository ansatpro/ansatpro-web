import { Client, Account, Databases, Query, ID, Storage } from 'node-appwrite';
import Groq from "groq-sdk";

/**
 * Initialize Groq AI client with API key.
 */
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

/**
 * Main Appwrite function handler for preceptor-related actions.
 * Only preceptors can perform these actions.
 * Supports multiple actions for preceptors including:
 * - Feedback submission
 * - Feedback AI analysis
 * - Student search
 * - Fetching enriched feedback with student data
 *
 * @param {object} req - Incoming request object
 * @param {object} res - Response object to send JSON back
 *
 * @returns {Promise<void>}
 */
export default async ({ req, res, log, error }) => {
  try {
    const { jwt, action, payload } = JSON.parse(req.body || '{}');

    if (!jwt || !action) {
      return res.json({ status: "error", message: "Missing jwt or action" });
    }

    // Authenticate user using JWT to recognize the user and their role.
    const userClient = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.PROJECT_ID)
      .setJWT(jwt);

    const account = new Account(userClient);
    const userDatabase = new Databases(userClient);
    let user;

    try {
      user = await account.get();
    } catch (err) {
      return res.json({ status: "error", message: "User not logged in or invalid JWT" });
    }

    // Admin client with elevated privileges to read/write collections.
    const adminClient = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.PROJECT_ID)
      .setKey(process.env.API_KEY);

    const adminDatabase = new Databases(adminClient);
    const storage = new Storage(adminClient);

    // Check user role
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
       * Action: Return feedback + student details for current preceptor.
       * For future update: add AI related analysis of feedback.
       */
      if (action === 'getPreceptorFeedbackWithStudent') {
        const feedbacks = await adminDatabase.listDocuments(
          process.env.DB_ID,
          process.env.PRECEPTOR_FEEDBACK_COLLECTION_ID,
          [Query.equal('preceptor_id', [user.$id])],
          100
        );

        const enrichedFeedbacks = await Promise.all(
          feedbacks.documents.map(async (fb) => {
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
            return { ...fb, student: studentInfo };
          })
        );

        return res.json({
          status: 'success',
          data: enrichedFeedbacks
        });
      }

      /**
       * Action: Create new feedback entry from preceptor.
       */
      if (action === 'addPreceptorFeedback') {
        const result = await adminDatabase.createDocument(
          process.env.DB_ID,
          process.env.PRECEPTOR_FEEDBACK_COLLECTION_ID,
          ID.unique(),
          payload
        );

        return res.json({ status: 'success', data: result });
      }

      /**
       * Action: Search students by name (fuzzy search).
       * This action is used to find students based on the initial letters of their names. 
       * The search is case-insensitive and requires at least 2 characters.
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
       * Action: Get feedback preceptor settings (types and categories)
       */
      if (action === 'getFeedbackPreceptorSettings') {
        const typesResponse = await adminDatabase.listDocuments(
          process.env.DB_ID,
          process.env.FEEDBACK_TYPES_ID,
          [Query.orderAsc('sort_order')]
        );

        const categoriesResponse = await adminDatabase.listDocuments(
          process.env.DB_ID,
          process.env.FEEDBACK_CATEGORIES_ID,
          [Query.orderAsc('sort_order')]
        );

        return res.json({
          status: "success",
          data: {
            types: typesResponse.documents,
            categories: categoriesResponse.documents
          }
        });
      }

      /**
       * Action: Create feedback for a preceptor
       */
      if (action === 'createFeedbackPreceptor') {
        if (!payload) {
          return res.json({ status: "error", message: "No payload provided" }, 400);
        }

        const {
          facilitator_id,
          student_id,
          date,
          text,
          category_id,
          type_id,
          ai_suggestions,
          image_files = []
        } = payload;

        // Validate required fields
        if (!facilitator_id || !student_id || !date || !text || !category_id || !type_id) {
          return res.json({
            status: "error",
            message: "Missing required fields for feedback creation"
          }, 400);
        }

        // Create feedback document
        const feedbackDoc = await adminDatabase.createDocument(
          process.env.DB_ID,
          process.env.FEEDBACK_ID,
          ID.unique(),
          {
            facilitator_id,
            student_id,
            date,
            text,
            category_id,
            type_id,
            ai_suggestions,
            image_files: image_files || []
          }
        );

        return res.json({
          status: "success",
          data: feedbackDoc.$id
        });
      }

      /**
       * Action: Get feedback for a preceptor by student ID
       */
      if (action === 'getFeedbackByStudentId') {
        if (!payload || !payload.student_id) {
          return res.json({ status: "error", message: "No student_id provided" }, 400);
        }

        const { student_id, limit = 10 } = payload;

        // Get feedback for the student
        const result = await adminDatabase.listDocuments(
          process.env.DB_ID,
          process.env.FEEDBACK_ID,
          [
            Query.equal('student_id', student_id),
            Query.orderDesc('$createdAt'),
            Query.limit(limit)
          ]
        );

        return res.json({
          status: "success",
          data: result.documents
        });
      }

      /**
       * Action: Upload feedback image
       */
      if (action === 'uploadFeedbackImage') {
        if (!payload || !payload.file_data) {
          return res.json({ status: "error", message: "No file data provided" }, 400);
        }

        const { file_data, file_name } = payload;

        // Create file in storage
        const file = await storage.createFile(
          process.env.BUCKET_ID,
          ID.unique(),
          file_data,
          file_name
        );

        return res.json({
          status: "success",
          data: {
            file_id: file.$id,
            file_name: file.name
          }
        });
      }

      /**
       * Action: Get recent feedback entries for a facilitator
       */
      if (action === 'getRecentFeedback') {
        if (!payload || !payload.facilitator_id) {
          return res.json({ status: "error", message: "No facilitator_id provided" }, 400);
        }

        const { facilitator_id, limit = 10 } = payload;

        const result = await adminDatabase.listDocuments(
          process.env.DB_ID,
          process.env.FEEDBACK_ID,
          [
            Query.equal('facilitator_id', facilitator_id),
            Query.orderDesc('$createdAt'),
            Query.limit(limit)
          ]
        );

        return res.json({
          status: "success",
          data: result.documents
        });
      }

      /**
       * Action: Analyze feedback using Groq AI model to match 23 ANSAT standards.
       */
      if (action === 'getAiFeedbackPreceptor') {
        const { text } = payload || {};

        if (!text) {
          return res.json({ error: "Missing 'text' in payload" }, 400);
        }

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
        
        try {
          // 清理输出，确保它是有效的JSON
          const cleanedOutput = output.trim();
          const parsed = JSON.parse(cleanedOutput);
          
          // 验证解析后的结果有预期的结构
          if (!parsed.matched_ids || !Array.isArray(parsed.matched_ids)) {
            return res.json({ 
              status: "error", 
              message: "Invalid AI response structure", 
              matched_ids: [] 
            });
          }
          
          return res.json({
            status: "success",
            matched_ids: parsed.matched_ids
          });
        } catch (parseError) {
          log(`JSON parse error: ${parseError.message}`);
          log(`Raw output: ${output}`);
          
          // 返回空结果而不是错误
          return res.json({
            status: "warning",
            message: "Could not parse AI response",
            matched_ids: []
          });
        }
      }

      // Unknown action fallback
      return res.json({ status: "error", message: "Unknown action: " + action });

    } catch (err) {
      return res.json({ status: "error", message: err.message });
    }
  } catch (err) {
    return res.json({ status: "error", message: err.message });
  }
};
