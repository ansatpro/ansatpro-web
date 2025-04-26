'use client';

import { useEffect, useRef, useState } from 'react';
import { account, functions } from '@/app/appwrite';
import PreceptorLayout from "@/components/layout/preceptorLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Calendar as CalendarIcon,
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
import { CalendarPlus } from '@/components/ui/calendarplus'; // 你的新版 CalendarPlus

export default function PreceptorFeedbacksPage() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedIndex, setExpandedIndex] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [universityFilter, setUniversityFilter] = useState('');
    const [healthServiceFilter, setHealthServiceFilter] = useState('');
    const [clinicAreaFilter, setClinicAreaFilter] = useState('');

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);

    const calendarRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                calendarRef.current &&
                !calendarRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setShowCalendar(false);
            }
        }

        if (showCalendar) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showCalendar]);

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
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedbacks();
    }, []);

    const nameFilteredFeedbacks = feedbacks.filter((fb) => {
        const fullName = `${fb.first_name} ${fb.last_name}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
    });

    const universities = [...new Set(nameFilteredFeedbacks.map(fb => fb.university_id).filter(Boolean))];
    const healthServices = [...new Set(nameFilteredFeedbacks.map(fb => fb.health_service_id).filter(Boolean))];
    const clinicAreas = [...new Set(nameFilteredFeedbacks.map(fb => fb.clinic_area_id).filter(Boolean))];

    const filteredFeedbacks = nameFilteredFeedbacks.filter((fb) => {
        const matchUni = !universityFilter || fb.university_id === universityFilter;
        const matchHS = !healthServiceFilter || fb.health_service_id === healthServiceFilter;
        const matchCA = !clinicAreaFilter || fb.clinic_area_id === clinicAreaFilter;
        return matchUni && matchHS && matchCA;
    });

    const dateFilteredFeedbacks = filteredFeedbacks.filter((fb) => {
        if (!startDate && !endDate) return true;
        const feedbackDate = new Date(fb.created_at);
        if (startDate && feedbackDate < startDate) return false;
        if (endDate && feedbackDate > endDate) return false;
        return true;
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
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-6 text-center"
                    >
                        <h1 className="text-3xl font-semibold mb-6 font-['Roboto']">Previous Feedback</h1>

                        {/* 搜索栏 + 日期选择器一行 */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4 mb-4">
                            <motion.input
                                type="text"
                                placeholder="Search by student name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                                whileFocus={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                            />

                            <motion.button
                                ref={buttonRef}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setShowCalendar(prev => !prev)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg bg-white hover:bg-gray-100 transition"
                            >
                                <CalendarIcon className="w-4 h-4" />
                                {startDate && endDate
                                    ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                                    : startDate
                                    ? `${startDate.toLocaleDateString()}`
                                    : "Select Date or Range"}
                            </motion.button>

                            {(startDate || endDate) && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setStartDate(null);
                                        setEndDate(null);
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg bg-white hover:bg-gray-100 transition"
                                >
                                    Clear
                                </motion.button>
                            )}
                        </div>

                        {/* 弹出的 CalendarPlus */}
                        <AnimatePresence>
                            {showCalendar && (
                                <motion.div
                                    key="calendarplus"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex justify-center mb-6"
                                    ref={calendarRef}
                                >
                                    <CalendarPlus
                                        mode="range"
                                        value={{ start: startDate, end: endDate }}
                                        onChange={(range) => {
                                            setStartDate(range.start);
                                            setEndDate(range.end);
                                            setShowCalendar(false);
                                        }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 三个下拉筛选器 */}
                        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:justify-center">
                            <select value={universityFilter} onChange={e => setUniversityFilter(e.target.value)} onClick={e => e.stopPropagation()}
                                className="border rounded-full px-4 py-2 w-full max-w-[280px] text-base bg-white shadow-sm focus:ring-2 focus:ring-blue-200">
                                <option value="">All Universities</option>
                                {universities.map(uni => (
                                    <option key={uni} value={uni}>{uni}</option>
                                ))}
                            </select>
                            <select value={healthServiceFilter} onChange={e => setHealthServiceFilter(e.target.value)} onClick={e => e.stopPropagation()}
                                className="border rounded-full px-4 py-2 w-full max-w-[280px] text-base bg-white shadow-sm focus:ring-2 focus:ring-blue-200">
                                <option value="">All Health Services</option>
                                {healthServices.map(hs => (
                                    <option key={hs} value={hs}>{hs}</option>
                                ))}
                            </select>
                            <select value={clinicAreaFilter} onChange={e => setClinicAreaFilter(e.target.value)} onClick={e => e.stopPropagation()}
                                className="border rounded-full px-4 py-2 w-full max-w-[280px] text-base bg-white shadow-sm focus:ring-2 focus:ring-blue-200">
                                <option value="">All Clinic Areas</option>
                                {clinicAreas.map(ca => (
                                    <option key={ca} value={ca}>{ca}</option>
                                ))}
                            </select>
                        </div>
                    </motion.div>

                    {/* Feedback卡片 */}
                    <div className="space-y-4">
                        {dateFilteredFeedbacks.map((fb, index) => {
                            const isOpen = expandedIndex === index;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                    className="bg-white border rounded-lg p-4 shadow hover:shadow-lg cursor-pointer"
                                    onClick={() => setExpandedIndex(isOpen ? null : index)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                        <CalendarIcon className="w-4 h-4" />
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

                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
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
