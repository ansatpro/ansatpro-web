import { Client, Account, Databases } from 'node-appwrite';

/**
 * Appwrite cloud function to add user metadata into users_metadata collection.
 *
 * @param {object} req - Request object containing JWT and payload in the body, for the future may also contain action.
 * @param {object} res - Response object used to send the result.
 * @returns {Promise<void>}
 */
export default async ({ req, res }) => {
  const { jwt, payload } = JSON.parse(req.body || '{}');

  if (!jwt || !payload) {
    return res.json({ status: "error", message: "Missing jwt or payload" });
  }

  /**
   * Client authenticated as the current user.
   * Used to validate JWT and retrieve user info.
   */
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

  /**
   * Admin client with API key permission to read/write metadata collection.
   */
  const adminClient = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.PROJECT_ID)
    .setKey(process.env.API_KEY);

  const adminDatabase = new Databases(adminClient);


  try {
    let existingDoc = null;

    /**
     * Attempt to retrieve existing metadata document.
     * If not found (404), continue to create a new one.
     */
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

    /**
     * Payload containing metadata fields to be stored. And this is just designed to avoid input fields not in the schema.
     * @type {{
     *   first_name: string,
     *   last_name: string,
     *   email: string,
     *   role: enum,
     *   affiliation_id: string,
     *   nmba_confirmed: boolean
     * }}
     * @property {enum} role - User's role, can only be 'preceptor' or 'facilitator'
     * @property {string} affiliation_id - ID of the user's university or health service id.
     = @property {boolean} nmba_confirmed - Whether the user has confirmed the declaration.. 
     */
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
  } catch (err) {
    return res.json({
      status: "error",
      message: "Add metadata failed: " + err.message
    });
  }
};
