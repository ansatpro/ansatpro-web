import { Client, Account, Databases, Query, ID } from 'node-appwrite';

export default async ({ req, res, log }) => {
  // Parse the request body
  const { jwt, action, payload } = JSON.parse(req.body || '{}');

  if (!jwt || !action) {
    return res.json({ status: "error", message: "Missing jwt or action" });
  }

  // Step 1: Verify user identity with JWT
  const userClient = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.PROJECT_ID)
    .setJWT(jwt);

  const account = new Account(userClient);
  let user;

  try {
    user = await account.get();
  } catch (err) {
    return res.json({ status: "error", message: "User not logged in or invalid JWT" });
  }

  // Step 2: Admin client for database access
  const adminClient = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(adminClient);

  try {
    // Action: Add student by facilitator
    if (action === 'addStudentByFacilitator') {
      // Step 1: Get user role
      const userMeta = await databases.getDocument(
        process.env.DB_ID,
        process.env.USERS_METADATA_COLLECTION_ID,
        user.$id
      );

      if (userMeta.role !== 'facilitator') {
        return res.json({
          status: 'error',
          message: 'Only facilitators are allowed to add students.'
        });
      }

      const studentData = {
        ...payload,
        created_by: user.$id // automatically attach the facilitator's ID
      };

      try {
        const created = await databases.createDocument(
          process.env.DB_ID,
          process.env.STUDENTS_COLLECTION_ID,
          ID.unique(),
          studentData
        );

        return res.json({
          status: 'success',
          data: created
        });
      } catch (err) {
        return res.json({
          status: 'error',
          message: err.message
        });
      }
    }

    // Action: Get preceptor feedback with student info for a specific preceptor
    if (action === 'getPreceptorFeedbackWithStudent') {
      const userMeta = await databases.getDocument(
        process.env.DB_ID,
        process.env.USERS_METADATA_COLLECTION_ID,
        user.$id
      );

      if (userMeta.role !== 'preceptor') {
        return res.json({ status: 'error', message: 'Only preceptors can access this feedback.' });
      }

      // Step 1: Get feedback entries for current preceptor
      const feedbacks = await databases.listDocuments(
        process.env.DB_ID,
        process.env.PRECEPTOR_FEEDBACK_COLLECTION_ID,
        [Query.equal('preceptor_id', [user.$id])],
        100 // optional: limit or paginate
      );

      // Step 2: Enrich each with student data
      const enrichedFeedbacks = await Promise.all(
        feedbacks.documents.map(async (fb) => {
          let studentInfo = null;

          try {
            studentInfo = await databases.getDocument(
              process.env.DB_ID,
              process.env.STUDENTS_COLLECTION_ID,
              fb.student_id
            );
          } catch (err) {
            // Handle missing student gracefully
            studentInfo = { error: 'Student not found', id: fb.student_id };
          }

          return {
            ...fb,
            student: studentInfo
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
      const userMeta = await databases.getDocument(
        process.env.DB_ID,
        process.env.USERS_METADATA_COLLECTION_ID,
        user.$id
      );

      if (userMeta.role !== 'preceptor') {
        return res.json({ status: 'error', message: 'Only preceptors can submit feedback' });
      }

      const result = await databases.createDocument(
        process.env.DB_ID,
        process.env.PRECEPTOR_FEEDBACK_COLLECTION_ID,
        ID.unique(),
        payload
      );

      return res.json({ status: 'success', data: result });
    }

    //search students by fuzzy search
    if (action === 'searchStudents') {
      const queryText = payload.query?.toLowerCase(); // e.g., "al"

      if (!queryText || queryText.length < 2) {
        return res.json({
          status: "error",
          message: "Query too short"
        });
      }

      // Optional: restrict based on user role
      const metadata = await databases.getDocument(
        process.env.DB_ID,
        process.env.USERS_METADATA_COLLECTION_ID,
        user.$id
      );

      const role = metadata.role;

      let filters = [Query.startsWith('full_name_lower', queryText)];

      // Restrict facilitator to only their students
      if (role === 'facilitator') {
        filters.push(Query.equal('created_by', [user.$id]));
      }

      const result = await databases.listDocuments(
        process.env.DB_ID,
        process.env.STUDENTS_COLLECTION_ID,
        filters,
        10 // Return top 10 matches
      );

      return res.json({
        status: "success",
        data: result.documents
      });
    }

    // Action: Get student list
    if (action === 'getStudentsList') {
      // Step 1: Get the user's metadata to determine role
      const metadataDoc = await databases.getDocument(
        process.env.DB_ID,
        process.env.USERS_METADATA_COLLECTION_ID,
        user.$id // We assume metadata is stored with documentId = user.$id
      );

      const role = metadataDoc.role;

      let students;

      // Step 2: Apply role-based filtering
      if (role === 'preceptor') {
        // Preceptors can see all students
        students = await databases.listDocuments(
          process.env.DB_ID,
          process.env.STUDENTS_COLLECTION_ID
        );
      } else if (role === 'facilitator') {
        // Facilitators can only see their own students
        students = await databases.listDocuments(
          process.env.DB_ID,
          process.env.STUDENTS_COLLECTION_ID,
          [Query.equal('created_by', [user.$id])]
        );
      } else {
        return res.json({
          status: 'error',
          message: `Unauthorized role: ${role}`
        });
      }

      return res.json({
        status: 'success',
        data: {
          students: students.documents
        }
      });
    }

    // Action: Add user metadata
    if (action === 'addMetadata') {
      try {
        let existingDoc;

        try {
          existingDoc = await databases.getDocument(
            process.env.DB_ID,
            process.env.USERS_METADATA_COLLECTION_ID,
            user.$id
          );
        } catch (err) {
          if (err.code !== 404) {
            throw err; // If it's not "not found", rethrow it
          }
        }

        if (existingDoc) {
          const updated = await databases.updateDocument(
            process.env.DB_ID,
            process.env.USERS_METADATA_COLLECTION_ID,
            user.$id,
            payload
          );

          return res.json({
            status: "success",
            message: "Metadata updated",
            data: updated
          });
        } else {
          const created = await databases.createDocument(
            process.env.DB_ID,
            process.env.USERS_METADATA_COLLECTION_ID,
            user.$id,
            payload
          );

          return res.json({
            status: "success",
            message: "Metadata created",
            data: created
          });
        }
      } catch (err) {
        return res.json({
          status: "error",
          message: "Add metadata failed: " + err.message
        });
      }
    }

    // Unknown action
    return res.json({ status: "error", message: "Unknown action: " + action });

  } catch (err) {
    return res.json({ status: "error", message: err.message });
  }
};
