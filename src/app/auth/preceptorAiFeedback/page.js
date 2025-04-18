"use client";

import { useState, useEffect } from "react";
import { account, functions } from "../../appwrite";
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, User, LayoutDashboard } from "lucide-react";
import Link from "next/link";

// ANSAT items data
const ansatItems = [
    { code: "1.1", text: "Accurately completes comprehensive & systematic assessments" },
    { code: "1.2", text: "Interprets client data accurately" },
    { code: "1.3", text: "Uses assessment data to determine nursing care requirements" },
    { code: "1.4", text: "Completes assessment in an organised & systematic way" },
    { code: "2.1", text: "Plans care in consultation with clients/ others" },
    { code: "2.2", text: "Develops a plan of care to achieve expected outcomes" },
    { code: "2.3", text: "Plans care that reflects best practice" },
    { code: "2.4", text: "Documents plan of care clearly" },
    { code: "3.1", text: "Provides planned care" },
    { code: "3.2", text: "Provides care consistent with educational preparation & practice standards" },
    { code: "3.3", text: "Provides evidence based care" },
    { code: "3.4", text: "Documents care accurately & timely" },
    { code: "4.1", text: "Responds to unexpected or rapidly changing situations" },
    { code: "4.2", text: "Manages clients with complex needs" },
    { code: "4.3", text: "Administers & monitors therapeutic interventions" },
    { code: "4.4", text: "Recognises & responds to deteriorating client" },
    { code: "5.1", text: "Evaluates & monitors care" },
    { code: "5.2", text: "Revises care based on evaluation" },
    { code: "6.1", text: "Protects the rights of individuals" },
    { code: "6.2", text: "Demonstrates ethical & professional conduct" },
    { code: "6.3", text: "Maintains effective relationships with the health care team" },
    { code: "7.1", text: "Participates in quality improvement activities" },
    { code: "7.2", text: "Uses & evaluates research" }
];

export default function FeedbackAnalyzer() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [result, setResult] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        // Load selected student from localStorage
        const storedStudent = localStorage.getItem('selectedStudent');
        if (storedStudent) {
            setSelectedStudent(JSON.parse(storedStudent));
        }

        const analyzeText = async () => {
            const encodedText = searchParams.get('text');
            if (!encodedText) {
                setError('No feedback text provided');
                setLoading(false);
                return;
            }

            try {
                const text = decodeURIComponent(encodedText);
                await account.get();
                const jwt = (await account.createJWT()).jwt;
                const execution = await functions.createExecution(
                    "67ffd00400174f76be85",
                    JSON.stringify({
                        jwt,
                        action: "getAiFeedbackPreceptor",
                        payload: { text }
                    })
                );

                const json_result = execution.responseBody;
                console.log("Raw AI response:", json_result);
                const parsed = typeof json_result === "string" ? JSON.parse(json_result) : json_result;
                console.log("Parsed AI result:", parsed);
                const matchedIds = parsed.matched_ids || [];
                setResult(matchedIds);
                setSelectedItems(matchedIds);
            } catch (err) {
                console.error("❌ AI match error:", err);
                setError("Failed to analyze feedback");
            } finally {
                setLoading(false);
            }
        };

        analyzeText();
    }, [searchParams]);

    const toggleItem = (code) => {
        setSelectedItems(prev =>
            prev.includes(code)
                ? prev.filter(c => c !== code)
                : [...prev, code]
        );
    };

    const handleConfirm = () => {
        if (selectedItems.length > 0) {
            // TODO: Save the selected items and proceed to the next step
            console.log('Selected items:', selectedItems);
            // Clear localStorage and redirect to home
            localStorage.removeItem('selectedStudent');
            router.push('/preceptor/home');
        }
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
            <main className="pt-20 px-6 max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">FEEDBACK ANALYSIS</h1>
                    {selectedStudent && (
                        <p className="text-gray-600">
                            Analyzing feedback for {selectedStudent.first_name} {selectedStudent.last_name}
                        </p>
                    )}
                </div>

                {/* Original Feedback */}
                <Card className="mb-8">
                    <CardContent className="pt-6">
                        <h2 className="text-xl font-semibold mb-4">Original Feedback</h2>
                        <p className="text-gray-700 whitespace-pre-wrap">
                            {searchParams.get('text')}
                        </p>
                    </CardContent>
                </Card>

                {/* ANSAT Items Selection */}
                <Card className="mb-8">
                    <CardContent className="pt-6">
                        <h2 className="text-xl font-semibold mb-4">ANSAT Items</h2>
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Analyzing feedback...</p>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 text-red-600 p-4 rounded-md">
                                {error}
                            </div>
                        ) : (
                            <div>
                                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                    <h3 className="font-semibold text-blue-800 mb-2">AI Analysis Results</h3>
                                    <p className="text-blue-600 mb-2">
                                        Based on your feedback, the AI has identified {result.length} relevant ANSAT items:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {result.map((code) => (
                                            <span key={code} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {code}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-6">
                                    Please review the AI suggestions below. You can adjust the selections as needed:
                                </p>
                                <div className="space-y-4">
                                    {ansatItems.map((item) => {
                                        const isAiSuggested = result.includes(item.code);
                                        return (
                                            <div key={item.code} 
                                                 className={`flex items-start space-x-3 p-3 rounded-lg transition-colors relative
                                                    ${selectedItems.includes(item.code) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                                <Checkbox
                                                    id={`item-${item.code}`}
                                                    checked={selectedItems.includes(item.code)}
                                                    onCheckedChange={() => toggleItem(item.code)}
                                                    className="mt-1"
                                                />
                                                <label
                                                    htmlFor={`item-${item.code}`}
                                                    className="text-sm leading-relaxed cursor-pointer flex-grow"
                                                >
                                                    <span className="font-medium">{item.code}</span> - {item.text}
                                                </label>
                                                {isAiSuggested && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        AI Suggested
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                <div className="mt-8 flex justify-end">
                                    <Button
                                        onClick={handleConfirm}
                                        disabled={selectedItems.length === 0}
                                        className="px-8 py-2 bg-[#3A6784] text-white hover:bg-[#2d5268]"
                                    >
                                        Confirm Selection
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
