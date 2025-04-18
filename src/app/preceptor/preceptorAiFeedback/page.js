"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bell, User, LayoutDashboard } from "lucide-react";
import AnsatItemsReview from "@/components/AnsatItemsReview";
import { account, functions } from "@/app/appwrite";

export default function PreceptorAiFeedback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [aiResults, setAiResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const analyzeText = async () => {
            const feedbackText = searchParams.get('text');
            if (!feedbackText) {
                setError('No feedback text provided');
                setIsLoading(false);
                return;
            }

            try {
                // Get JWT token
                const jwt = (await account.createJWT()).jwt;

                // Call AI analysis function
                const execution = await functions.createExecution(
                    "function_jwt_require",
                    JSON.stringify({
                        jwt,
                        action: "getAiFeedbackPreceptor",
                        payload: { text: feedbackText }
                    })
                );

                // Parse result
                const result = JSON.parse(execution.responseBody);
                setAiResults(result.matched_ids || []);
            } catch (err) {
                console.error("❌ AI analysis error:", err);
                setError("Failed to analyze feedback");
            } finally {
                setIsLoading(false);
            }
        };

        // 从localStorage获取学生信息
        const storedStudent = localStorage.getItem('selectedStudent');
        if (storedStudent) {
            setSelectedStudent(JSON.parse(storedStudent));
        }

        analyzeText();
    }, [searchParams]);

    const handleConfirm = (selectedItems) => {
        // TODO: 处理确认逻辑
        console.log('Selected items:', selectedItems);
        // 可以跳转到下一步或保存结果
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Top Bar */}
            <header className="fixed top-0 left-0 right-0 h-14 bg-white z-50 border-b">
                <div className="h-full px-6 flex justify-between items-center">
                    <Link href="/preceptor/home" className="flex items-center">
                        <LayoutDashboard className="h-8 w-8 text-[#3A6784]" />
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link href="/preceptor/notifications" className="hover:bg-gray-50 p-2 rounded-full transition-colors">
                            <Bell className="h-5 w-5 text-gray-600" />
                        </Link>
                        <Link href="/preceptor/settings" className="hover:bg-gray-50 p-2 rounded-full transition-colors">
                            <User className="h-5 w-5 text-gray-600" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-20 px-6 max-w-4xl mx-auto pb-16">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">FEEDBACK ANALYSIS</h1>
                    {selectedStudent && (
                        <p className="text-gray-600">
                            Analyzing feedback for {selectedStudent.first_name} {selectedStudent.last_name}
                        </p>
                    )}
                </div>

                {selectedStudent ? (
                    <div className="space-y-6">
                        {/* Student Information Card */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold mb-4">Student Information</h2>
                            <div className="space-y-2 text-gray-600">
                                <p>Student ID: {selectedStudent.student_id}</p>
                                <p>Institution: {selectedStudent.institution || 'Not assigned'}</p>
                                <p>Clinic Area: {selectedStudent.clinic_area || 'Not assigned'}</p>
                                <p>Start Date: {selectedStudent.start_date ? new Date(selectedStudent.start_date).toLocaleDateString() : 'Not set'}</p>
                                <p>End Date: {selectedStudent.end_date ? new Date(selectedStudent.end_date).toLocaleDateString() : 'Not set'}</p>
                            </div>
                        </div>

                        {/* AI Analysis Results */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold mb-4">AI Analysis Results</h2>
                            {isLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                    <p className="mt-4 text-gray-600">Analyzing feedback...</p>
                                </div>
                            ) : error ? (
                                <div className="bg-red-50 text-red-600 p-4 rounded-md">
                                    {error}
                                </div>
                            ) : (
                                <>
                                    <p className="text-gray-600 mb-4">
                                        Based on the provided feedback, the following ANSAT items have been identified:
                                    </p>
                                    <div className="space-y-2 mb-6">
                                        {aiResults.map((code) => (
                                            <p key={code} className="text-blue-600">Item {code}</p>
                                        ))}
                                    </div>
                                    
                                    {/* ANSAT Items Review Component */}
                                    <AnsatItemsReview
                                        aiResults={aiResults}
                                        onConfirm={handleConfirm}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-600">
                        <p>No student selected. Please select a student first.</p>
                        <Button
                            className="mt-4"
                            onClick={() => router.back()}
                        >
                            Go Back
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
} 