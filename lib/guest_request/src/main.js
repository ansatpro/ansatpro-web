import { Client, Databases } from 'node-appwrite';

/**
 * Serverless function handler to retrieve different types of documents from the Appwrite database which don't require authentication.
 * 
 * Supported actions:
 * - 'getAffiliations': Fetches affiliation documents.
 * - 'getClinicAreas': Fetches clinic area documents.
 * - 'getAssessmentItems': Fetches assessment item documents.
 * 
 * @param {Object} context - The context object containing the HTTP request and response.
 * @param {Object} context.req - The HTTP request object.
 * @param {Object} context.res - The HTTP response object.
 * 
 * @returns {Promise<void>} Returns a JSON response based on the requested action.
 */
export default async ({ req, res }) => {
  const { action } = JSON.parse(req.body || '{}');

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.PROJECT_ID);

  const databases = new Databases(client);
  const databaseId = process.env.DB_ID;

  try {
    if (action === 'getAffiliations') {
      const result = await databases.listDocuments(databaseId, process.env.AFFILIATIONS_ID);
      return res.json({ affiliations: result.documents });
    }

    if (action === 'getClinicAreas') {
      const result = await databases.listDocuments(databaseId, process.env.CLINIC_AREA_ID);
      return res.json({ clinicAreas: result.documents });
    }

    if (action === 'getAssessmentItems') {
      const result = await databases.listDocuments(databaseId, process.env.ASSESSMENT_ITEMS_ID);
      return res.json({ standardItems: result.documents });
    }

    return res.json({ status: "error", message: "Unknown action" });
  } catch (err) {
    console.error("❌ Failed to fetch data:", err);
    return res.json(
      { error: "Unable to fetch data" },
      500
    );
  }
};
