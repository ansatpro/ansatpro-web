"use client";

import { useState } from "react";
import { account, functions } from "../../appwrite";

export default function FeedbackAnalyzer() {
    const [input, setInput] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleAnalyze() {
        setLoading(true);
        setResult(null);

        try {
            // Step 1: ensure user is logged in
            await account.get();

            // Step 2: get JWT
            const jwt = (await account.createJWT()).jwt;

            // Step 3: call function with action
            const execution = await functions.createExecution(
                "67ffd00400174f76be85", // 👈 your unified function ID
                JSON.stringify({
                    jwt,
                    action: "getAiFeedbackPreceptor",
                    payload: { text: input }
                })
            );

            // Step 4: parse result
            const json_result = execution.responseBody;
            const parsed = typeof json_result === "string" ? JSON.parse(json_result) : json_result;

            setResult(parsed.matched_ids || ["No matches found"]);
        } catch (err) {
            console.error("❌ AI match error:", err);
            setResult(["Something went wrong"]);
        }

        setLoading(false);
    }

    return (
        <div className="p-6 max-w-xl mx-auto space-y-4">
            <h2 className="text-xl font-bold">Standard Match Analyzer</h2>

            <textarea
                className="w-full p-2 border rounded"
                rows={4}
                placeholder="Enter student feedback..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />

            <button
                onClick={handleAnalyze}
                className="bg-blue-600 text-white px-4 py-2 rounded"
                disabled={loading}
            >
                {loading ? "Analyzing..." : "Analyze"}
            </button>

            {result && (
                <div className="bg-gray-100 p-3 rounded mt-4">
                    <strong>Matched IDs:</strong>
                    <ul className="list-disc pl-6">
                        {result.map((id, idx) => (
                            <li key={idx}>{id}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
