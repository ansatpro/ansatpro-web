import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // set in your .env
});

const standards = [
  { id: "1.1", description: "Complies and practices according to relevant legislation and local policy" },
  { id: "1.2", description: "Uses an ethical framework to guide decision making and practice" },
  { id: "1.3", description: "Demonstrates respect for individual and cultural (including Aboriginal and Torres Strait Islander) preference and differences" },
  { id: "1.4", description: "Sources and critically evaluates relevant literature and research evidence to deliver quality practice" },
  { id: "1.5", description: "Maintains the use of clear and accurate documentation" },

  { id: "2.1", description: "Communicates effectively to maintain personal and professional boundaries" },
  { id: "2.2", description: "Collaborates with the health care team and others to share knowledge that promotes person-centred care" },
  { id: "2.3", description: "Participates as an active member of the healthcare team to achieve optimum health outcomes" },
  { id: "2.4", description: "Demonstrates respect for a person’s rights and wishes and advocates on their behalf" },

  { id: "3.1", description: "Demonstrates commitment to life-long learning of self and others" },
  { id: "3.2", description: "Reflects on practice and responds to feedback for continuing professional development" },
  { id: "3.3", description: "Demonstrates skills in health education to enable people to make decisions and take action about their health" },
  { id: "3.4", description: "Recognises and responds appropriately when own or other's capability for practice is impaired" },
  { id: "3.5", description: "Demonstrates accountability for decisions and actions appropriate to their role" },

  { id: "4.1", description: "Completes comprehensive and systematic assessments using appropriate and available sources" },
  { id: "4.2", description: "Accurately analyses and interprets assessment data to inform practices" },

  { id: "5.1", description: "Collaboratively constructs a plan informed by the patient/client assessment" },
  { id: "5.2", description: "Plans care in partnership with individuals/significant others/health care team to achieve expected outcomes" },

  { id: "6.1", description: "Delivers safe and effective care within their scope of practice to meet outcomes" },
  { id: "6.2", description: "Provides effective supervision and delegates care safely within their role and scope of practice" },
  { id: "6.3", description: "Recognises and responds to practice that may be below expected organisational, legal or regulatory standards" },

  { id: "7.1", description: "Monitors progress toward expected goals and health outcomes" },
  { id: "7.2", description: "Modifies plan according to evaluation of goals and outcomes in consultation with the health care team and others" },
];


export default async ({ req, res }) => {
  const { text } = req.bodyJson || {};


  if (!text) {
    return res.json({ error: "Missing 'text' in request body" }, 400);
  }

  try {
    const prompt = `
You are an assistant that identifies which nursing standards match a feedback statement.
Here are the standards (with IDs):

${standards.map((s) => `${s.id}. ${s.description}`).join("\n")}

Feedback: "${text}"

Only return a JSON array of matched standard IDs like this:
{ "matched_ids": [1.2, 5.1, 7.1] }
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

    // Try parsing the JSON returned
    const parsed = JSON.parse(output);

    return res.json(parsed);
  } catch (err) {
    console.error("Groq Error:", err);
    return res.json({ error: "Failed to process request." }, 500);
  }
};
