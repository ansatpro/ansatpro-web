import { Client, Databases } from 'node-appwrite';

/**
 * Appwrite function to retrieve documents that don't require authentication.
 * And may add other actions in the future.
 * @param {object} res - Response object used to send the JSON response.
 * @returns {Promise<void>}
 */
export default async ({ res }) => {
  /**
   * Initialize Appwrite client (project-scoped, no authentication).
   */
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.PROJECT_ID);

  const databases = new Databases(client);

  const databaseId = process.env.DB_ID;
  const collectionId = process.env.AFFILIATIONS_ID;

  try {
    /**
     * Fetch all documents from the affiliations collection.
     */
    const result = await databases.listDocuments(databaseId, collectionId);

    return res.json({
      affiliations: result.documents
    });
  } catch (err) {
    console.error("❌ Failed to fetch affiliations:", err);
    return res.json(
      { error: "Unable to fetch affiliations" },
      500
    );
  }
};
