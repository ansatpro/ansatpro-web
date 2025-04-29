import Groq from "groq-sdk";
import { Client, Databases } from 'node-appwrite';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Set up Appwrite client
const client = new Client();
client.setEndpoint(process.env.APPWRITE_ENDPOINT); // Or your endpoint
client.setProject(process.env.PROJECT_ID); // Set in .env
const databases = new Databases(client);

// DB info
const databaseId = process.env.DB_ID;
const collectionId = process.env.ASSESSMENT_ITEMS_ID;

export default async ({ req, res }) => {
  const { text } = req.bodyJson || {};
  if (!text) {
    return res.json({ error: "Missing 'text' in request body" }, 400);
  }

  try {
    // ✅ Fetch standards from DB
    const responseDocs = await databases.listDocuments(databaseId, collectionId, []);
    const standards = responseDocs.documents.map(doc => ({
      id: doc.item_id,
      description: doc.description
    }));

    // ✅ Construct dynamic prompt
    const prompt = `
You are a nursing standards evaluator. Your task is to analyze short pieces of feedback text and determine which of the following 23 nursing standards (each with an ID) are clearly matched by the content.

Each standard is formatted as: "<id>. <description>"

Here is the full list of standards:
${standards.map((s) => `${s.id}. ${s.description}`).join("\n")}

Now, given the following feedback:
"${text}"

Please identify ONLY the standards that are **explicitly or strongly implied** by the text. Be conservative — do not include standards unless there's a clear match in behavior, context, or keywords.

Respond ONLY with a single valid JSON object using this format:
{ "matched_ids": ["1.4", "2.1", "6.3"] }

Do NOT include any explanation or extra text.
`;

    const response = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      stream: false,
      messages: [
        { role: "system", content: "You are an AI that identifies matching standards from a nursing competency list." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_completion_tokens: 512,
    });

    const output = response.choices[0].message.content;
    const parsed = JSON.parse(output);

    return res.json(parsed);
  } catch (err) {
    console.error("Function error:", err);
    return res.json({ error: err.message || "Failed to process request." }, 500);
  }
};
