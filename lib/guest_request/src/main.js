import { Client, Databases } from 'node-appwrite';

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

    return res.json({ status: "error", message: "Unknown action" });
  } catch (err) {
    console.error("❌ Failed to fetch data:", err);
    return res.json(
      { error: "Unable to fetch data" },
      500
    );
  }
};
