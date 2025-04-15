import { Client, Databases } from "appwrite";

export default async ({ res }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.PROJECT_ID);

  const databases = new Databases(client);

  const databaseId = process.env.DB_ID;
  const collectionId = process.env.AFFILIATIONS_ID;

  try {
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
