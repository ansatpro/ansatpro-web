import { Client, Account, Databases, Storage } from 'node-appwrite';

export default async ({ req, res }) => {
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

  try {
    if (action === 'uploadAvatar') {
      const adminStorage = new Storage(adminClient);

      // Assume you receive a base64 or file ID in the payload
      const { file } = payload;

      if (!file) {
        return res.json({ status: "error", message: "No file provided" });
      }

      // Upload the file
      const uploadedFile = await adminStorage.createFile(
        process.env.STORAGE_BUCKET_ID, // you must create a Storage Bucket first
        user.$id,                      // use user id as file id (optional)
        file                            // file must be in correct format (File object or Buffer)
      );

      return res.json({
        status: "success",
        message: "Avatar uploaded",
        data: uploadedFile
      });
    }

    if (action === 'addMetadata') {
      let existingDoc = null;

      try {
        existingDoc = await adminDatabase.getDocument(
          process.env.DB_ID,
          process.env.USERS_METADATA_COLLECTION_ID,
          user.$id
        );
      } catch (err) {
        if (err.code !== 404) {
          throw new Error("getDocument failed: " + err.message);
        }
      }

      const metadataPayload = {
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        role: payload.role,
        affiliation_id: payload.affiliation_id,
        nmba_confirmed: payload.nmba_confirmed
      };

      if (existingDoc) {
        const updated = await adminDatabase.updateDocument(
          process.env.DB_ID,
          process.env.USERS_METADATA_COLLECTION_ID,
          user.$id,
          metadataPayload
        );
        return res.json({
          status: "success",
          message: "Metadata updated",
          data: updated
        });
      } else {
        const created = await adminDatabase.createDocument(
          process.env.DB_ID,
          process.env.USERS_METADATA_COLLECTION_ID,
          user.$id,
          metadataPayload
        );
        return res.json({
          status: "success",
          message: "Metadata created",
          data: created
        });
      }
    }

    if (action === 'getUserRole') {
      const metadata = await adminDatabase.getDocument(
        process.env.DB_ID,
        process.env.USERS_METADATA_COLLECTION_ID,
        user.$id
      );

      return res.json({
        status: "success",
        data: metadata
      });
    }

    return res.json({ status: "error", message: "Unknown action: " + action });

  } catch (err) {
    return res.json({
      status: "error",
      message: err.message
    });
  }
};