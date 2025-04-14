"use client";

import { useState } from "react";
import { account, client, functions } from "../../appwrite";

export default function FeedbackAnalyzer() {
    const [input, setInput] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleAnalyze() {
        setLoading(true);
        setResult(null);
        try {
            const execution = await functions.createExecution(
                "preceptor_ai_feedback",
                JSON.stringify({ text: input })
            );

            console.log("Execution:", execution); // ✅ this should contain `$id`
            const json_result = execution.responseBody
            const parsed = typeof json_result === "string" ? JSON.parse(json_result) : json_result;

            setResult(parsed.matched_ids);

        } catch (err) {
            console.error(err);
            setResult({ error: "Something went wrong" });
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

            {result}
        </div>
    );
}
