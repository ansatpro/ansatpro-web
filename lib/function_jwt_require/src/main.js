import { Client, Account, Databases } from 'node-appwrite';

export default async ({ req, res, log }) => {
  const { jwt, action } = JSON.parse(req.body || '{}');

  if (!jwt || action !== 'getStudentsList') {
    return res.json({ status: "error", message: "Missing jwt or invalid action" });
  }

  // Step 1: Use JWT to verify the user is logged in
  const userClient = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.PROJECT_ID)
    .setJWT(jwt);

  const account = new Account(userClient);

  try {
    await account.get(); // This verifies the JWT is valid and user is logged in
  } catch (err) {
    return res.json({ status: "error", message: "User not logged in or invalid JWT" });
  }

  // Step 2: Use API Key to read the full students table (admin privileges)
  const adminClient = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(adminClient);

  try {
    const students = await databases.listDocuments(
      process.env.DB_ID,
      process.env.STUDENTS_COLLECTION_ID
    );

    return res.json({
      status: "success",
      data: {
        students: students.documents
      }
    });

  } catch (err) {
    return res.json({ status: "error", message: err.message });
  }
};
