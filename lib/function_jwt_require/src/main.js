import { Client, Account, Databases } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  log('Function started');
  log('Request body:', req.body);

  const { jwt, action, payload } = JSON.parse(req.body || '{}');
  log('Parsed data:', { jwt, action, payload });

  if (!jwt || !action) {
    log('Missing required fields');
    return res.json({
      status: "error",
      message: "Missing required fields: jwt or action"
    });
  }

  // ✅ Step 1: Initialize Appwrite Client with JWT
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.PROJECT_ID)
    .setJWT(jwt);

  const account = new Account(client);
  const databases = new Databases(client);

  try {
    // ✅ Step 2: Verify JWT — get current user
    const user = await account.get();
    log('User verified:', user.$id);

    // ✅ Step 3: Handle action
    if (action === 'getStudentsList') {
      const students = await databases.listDocuments(
        process.env.DB_ID,            // e.g., 'my_database'
        process.env.STUDENTS_COLLECTION_ID // e.g., 'students'
      );

      log('Fetched students:', students.documents.length);

      return res.json({
        status: "success",
        data: {
          students: students.documents
        }
      });
    }

    // ❓ Unknown action
    return res.json({
      status: "error",
      message: "Unknown action: " + action
    });

  } catch (err) {
    log('Error occurred:', err.message);
    return res.json({
      status: "error",
      message: err.message
    });
  }
};
