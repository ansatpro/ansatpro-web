'use client';

import { useEffect, useState } from 'react';
import { account, functions } from '@/app/appwrite'
import PreceptorLayout from "@/components/layout/preceptorLayout";

export default function PreceptorFeedbacksPage() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');



    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const jwt = localStorage.getItem("jwt");

                const execution = await functions.createExecution(
                    process.env.NEXT_PUBLIC_FN_PRECEPTOR_RELATED,
                    JSON.stringify({
                        jwt,
                        action: 'getPreceptorFeedbackWithStudent'
                    })
                );

                const result = JSON.parse(execution.responseBody);

                if (result.status === 'success') {
                    setFeedbacks(result.data);
                } else {
                    console.error('❌ Failed to fetch:', result.message);
                }
            } catch (err) {
                console.error('❌ Error during fetch:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFeedbacks();
    }, []);

    const filteredFeedbacks = feedbacks.filter((fb) => {
        const fullName = `${fb.first_name} ${fb.last_name}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
    });

    if (loading) {
        return <div className="p-4">Loading...</div>;
    }

    return (
        <PreceptorLayout>
            <div className="py-10 px-4">
                <div className="max-w-3xl mx-auto">
                    {/* Header (space for future search) */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Previous Feedback</h1>
                        <input
                            type="text"
                            placeholder="Search by student name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-80 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    {/* Feedback cards */}
                    <div className="space-y-4">
                        {filteredFeedbacks.map((fb, index) => {
                            const isOpen = expandedIndex === index;

                            return (
                                <div
                                    key={index}
                                    className="bg-white border rounded-lg p-4 shadow hover:shadow-md transition cursor-pointer"
                                    onClick={() => setExpandedIndex(isOpen ? null : index)}
                                >
                                    {/* Collapsed summary */}
                                    <div className="text-sm text-gray-500 mb-1">
                                        {fb.created_at ? new Date(fb.created_at).toLocaleDateString() : "Unknown date"}
                                    </div>

                                    <div className="text-base font-semibold text-gray-800">
                                        {fb.first_name} {fb.last_name}
                                    </div>

                                    <div className="text-sm text-gray-600 mt-1 truncate max-w-full">
                                        {fb.content ?? 'No feedback content.'}
                                    </div>

                                    {/* Expanded full details */}
                                    {isOpen && (
                                        <div className="mt-4 text-sm space-y-2 text-gray-700">
                                            <div>
                                                <span className="font-medium">Student ID:</span> {fb.student_id}
                                            </div>
                                            <div>
                                                <span className="font-medium">University:</span> {fb.university_id ?? 'N/A'}
                                            </div>
                                            <div>
                                                <span className="font-medium">Health Service:</span> {fb.health_service_id ?? 'N/A'}
                                            </div>
                                            <div>
                                                <span className="font-medium">Clinical Area:</span> {fb.clinic_area_id ?? 'N/A'}
                                            </div>

                                            <div>
                                                <span className="font-medium">Original Feedback:</span>
                                                <div className="mt-1 text-gray-800">{fb.content}</div>
                                            </div>

                                            <div>
                                                <span className="font-medium">Selected ANSAT ITEMS:</span>
                                                <ul className="ml-4 list-disc">
                                                    {Object.entries(fb.ai_items || {}).map(([itemId, { description, is_positive }]) => (
                                                        <li key={itemId}>
                                                            {itemId}{description ? `: ${description}` : ''}
                                                            {!is_positive && (
                                                                <span className="text-red-500 font-medium ml-2">(Negative)</span>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div>
                                                <span className="font-medium">Discussion Flags:</span>
                                                <ul className="ml-4 list-disc">
                                                    <li>
                                                        With Facilitator:{" "}
                                                        {fb.flag_discuss_with_facilitator ? (
                                                            <span className="text-green-600 font-semibold">Yes</span>
                                                        ) : (
                                                            <span className="text-red-600 font-semibold">No</span>
                                                        )}
                                                    </li>
                                                    <li>
                                                        With Student:{" "}
                                                        {fb.flag_discussed_with_student ? (
                                                            <span className="text-green-600 font-semibold">Yes</span>
                                                        ) : (
                                                            <span className="text-red-600 font-semibold">No</span>
                                                        )}
                                                    </li>
                                                </ul>
                                            </div>

                                            <div className="text-sm text-gray-400 mt-2">
                                                {fb.created_at ? new Date(fb.created_at).toLocaleDateString() : ""}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </PreceptorLayout>
    );
}
