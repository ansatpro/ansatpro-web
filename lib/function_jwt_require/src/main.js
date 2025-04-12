import { Client, Account, Databases } from 'node-appwrite';

export default async ({ req, res, log }) => {
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
          [Query.equal('created_by', user.$id)]
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
      const metadata = await databases.createDocument(
        process.env.DB_ID,
        process.env.USERS_METADATA_COLLECTION_ID,
        user.$id, // Use user's ID as document ID (1:1 mapping)
        {
          first_name: payload.first_name,
          last_name: payload.last_name,
          email: payload.email,
          role: payload.role,
          affiliation_id: payload.affiliation_id,
          nmba_confirmed: payload.nmba_confirmed
        }
      );

      return res.json({
        status: "success",
        data: {
          metadata
        }
      });
    }

    // Unknown action
    return res.json({ status: "error", message: "Unknown action: " + action });

  } catch (err) {
    return res.json({ status: "error", message: err.message });
  }
};
