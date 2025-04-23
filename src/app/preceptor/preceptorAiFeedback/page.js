"use client"

import { useEffect, useState } from 'react';
import { account, functions } from "../../appwrite";
import PreceptorLayout from "@/components/layout/preceptorLayout";

export default function PreceptorAiFeedbackPage() {
    const [payload, setPayload] = useState(null);
    const [assessmentItems, setAssessmentItems] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [matchedIds, setMatchedIds] = useState([]);
    const [itemPositivity, setItemPositivity] = useState({});

    useEffect(() => {
        const stored = localStorage.getItem("preceptorPayload");

        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setPayload(parsed);

                const fetchData = async () => {
                    try {
                        // 1. Get assessment items
                        const res = await functions.createExecution(
                            'guest_request',
                            JSON.stringify({ action: 'getAssessmentItems' })
                        );
                        const result = JSON.parse(res.responseBody);
                        setAssessmentItems(result.standardItems || []);

                        // 2. Get JWT
                        const jwt = localStorage.getItem("jwt");

                        // 3. AI analysis based on payload.content
                        const aiExecution = await functions.createExecution(
                            '67ffd00400174f76be85',
                            JSON.stringify({
                                jwt,
                                action: "getAiFeedbackPreceptor",
                                payload: { text: parsed.content }
                            })
                        );

                        console.log("AI Execution Result:", aiExecution);

                        const aiResult = JSON.parse(aiExecution.responseBody);
                        const matched = aiResult.matched_ids || [];

                        setMatchedIds(matched);
                        setSelectedIds(matched); // ✅ Auto-select matched checkboxes

                    } catch (err) {
                        console.error("❌ Error in fetching data:", err);
                    }
                };

                fetchData();

            } catch (err) {
                console.error("❌ Failed to parse stored payload:", err);
            }
        }
    }, []);

    const toggleSelection = (itemId) => {
        setSelectedIds((prev) => {
            const isSelected = prev.includes(itemId);
            const newSelected = isSelected
                ? prev.filter((id) => id !== itemId)
                : [...prev, itemId];

            // If adding item, set default is_positive to true
            setItemPositivity((prevPositivity) => {
                const updated = { ...prevPositivity };
                if (!isSelected) {
                    updated[itemId] = true; // default to true
                } else {
                    delete updated[itemId]; // clean up if unselected
                }
                return updated;
            });

            return newSelected;
        });
    };

    const handleSubmit = async () => {
        if (!payload) return;

        try {
            const jwt = localStorage.getItem("jwt");

            const fullPayload = {
                ...payload,
                ai_item_list: itemPositivity
            };

            const res = await functions.createExecution(
                '67ffd00400174f76be85',
                JSON.stringify({
                    jwt,
                    action: "addPreceptorFeedback",
                    payload: fullPayload
                })
            );

            const result = JSON.parse(res.responseBody);
            if (result.status === 'success') {
                alert("✅ Feedback submitted successfully!");
                localStorage.removeItem("preceptorPayload");
                // optional: router.push("/preceptor/success");
            } else {
                alert("❌ Submission failed: " + result.message);
            }

        } catch (err) {
            console.error("❌ Submission error:", err);
            alert("Something went wrong while submitting.");
        }
    };

    return (
        <PreceptorLayout>
            <main className="p-8">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-lg font-semibold mb-2">Select Assessment Items</h2>
                    <div className="space-y-2">
                        {assessmentItems.map((item) => (
                            <label
                                key={item.item_id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border rounded-md p-3 shadow-sm hover:bg-gray-50 transition"
                            >
                                <div className="flex items-start space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(item.item_id)}
                                        onChange={() => toggleSelection(item.item_id)}
                                        className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                    <div>
                                        <span className="block font-medium text-gray-900">{item.item_id}</span>
                                        <span className="text-sm text-gray-600">{item.description}</span>
                                    </div>
                                </div>

                                {/* ✅ Show is_positive toggle if selected */}
                                {selectedIds.includes(item.item_id) && (
                                    <div className="mt-2 sm:mt-0 flex items-center space-x-2">
                                        <label htmlFor={`positive-${item.item_id}`} className="text-sm text-gray-700">
                                            Positive?
                                        </label>
                                        <input
                                            id={`positive-${item.item_id}`}
                                            type="checkbox"
                                            checked={itemPositivity[item.item_id] ?? true}
                                            onChange={(e) => {
                                                const value = e.target.checked;
                                                setItemPositivity((prev) => ({
                                                    ...prev,
                                                    [item.item_id]: value,
                                                }));
                                            }}
                                            className="h-4 w-4 text-green-600 border-gray-300 rounded"
                                        />
                                    </div>
                                )}
                            </label>
                        ))}
                    </div>
                    <div className="mt-6">
                        <button
                            onClick={handleSubmit}
                            className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition"
                        >
                            ✅ Submit Feedback
                        </button>
                    </div>
                </div>
            </main>
        </PreceptorLayout>
    );
}