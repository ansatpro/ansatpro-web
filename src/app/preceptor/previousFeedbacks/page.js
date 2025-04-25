'use client';

import { useEffect, useState } from 'react';
import { account, functions } from '@/app/appwrite'
import PreceptorLayout from "@/components/layout/preceptorLayout";
import { motion, AnimatePresence } from "framer-motion";
import { 
    User, 
    Calendar, 
    MessageSquare, 
    Hash, 
    GraduationCap, 
    Stethoscope, 
    Building2, 
    ClipboardList, 
    Users, 
    CheckCircle2, 
    XCircle 
} from 'lucide-react';
import LoadingScreen from '@/components/preceptorUI/LoadingScreen';

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
        return (
            <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <LoadingScreen />
            </motion.div>
        );
    }

    return (
        <PreceptorLayout>
            <div className="py-10 px-4">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-6 text-center"
                    >
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Previous Feedback</h1>
                        <div className="flex justify-center">
                            <motion.input
                                type="text"
                                placeholder="Search by student name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-80 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                whileFocus={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                            />
                        </div>
                    </motion.div>

                    {/* Feedback cards */}
                    <div className="space-y-4">
                        {filteredFeedbacks.map((fb, index) => {
                            const isOpen = expandedIndex === index;

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="bg-white border rounded-lg p-4 shadow hover:shadow-lg cursor-pointer"
                                    onClick={() => setExpandedIndex(isOpen ? null : index)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {/* Collapsed summary */}
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                        <Calendar className="w-4 h-4" />
                                        {fb.created_at ? new Date(fb.created_at).toLocaleDateString() : "Unknown date"}
                                    </div>

                                    <div className="flex items-center gap-2 text-base font-semibold text-gray-800">
                                        <User className="w-5 h-5" />
                                        {fb.first_name} {fb.last_name}
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1 truncate max-w-full">
                                        <MessageSquare className="w-4 h-4" />
                                        {fb.content ?? 'No feedback content.'}
                                    </div>

                                    {/* Expanded full details */}
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mt-4 text-sm space-y-3 text-gray-700">
                                                    <div className="flex items-center gap-2">
                                                        <Hash className="w-4 h-4" />
                                                        <span className="font-medium">Student ID:</span> {fb.student_id}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <GraduationCap className="w-4 h-4" />
                                                        <span className="font-medium">University:</span> {fb.university_id ?? 'N/A'}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Stethoscope className="w-4 h-4" />
                                                        <span className="font-medium">Health Service:</span> {fb.health_service_id ?? 'N/A'}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="w-4 h-4" />
                                                        <span className="font-medium">Clinical Area:</span> {fb.clinic_area_id ?? 'N/A'}
                                                    </div>

                                                    <div className="flex items-start gap-2">
                                                        <MessageSquare className="w-4 h-4 mt-1" />
                                                        <div>
                                                            <span className="font-medium">Original Feedback:</span>
                                                            <div className="mt-1 text-gray-800">{fb.content}</div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-2">
                                                        <ClipboardList className="w-4 h-4 mt-1" />
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
                                                    </div>

                                                    <div className="flex items-start gap-2">
                                                        <Users className="w-4 h-4 mt-1" />
                                                        <div>
                                                            <span className="font-medium">Discussion Flags:</span>
                                                            <ul className="ml-4 list-disc">
                                                                <li className="flex items-center gap-2">
                                                                    With Facilitator:{" "}
                                                                    {fb.flag_discuss_with_facilitator ? (
                                                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                                    ) : (
                                                                        <XCircle className="w-4 h-4 text-red-600" />
                                                                    )}
                                                                </li>
                                                                <li className="flex items-center gap-2">
                                                                    With Student:{" "}
                                                                    {fb.flag_discussed_with_student ? (
                                                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                                    ) : (
                                                                        <XCircle className="w-4 h-4 text-red-600" />
                                                                    )}
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </PreceptorLayout>
    );
}
