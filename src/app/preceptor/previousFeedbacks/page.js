// 'use client' directive is required for client-side rendering
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
import { CalendarPlus } from '@/components/ui/calendarplus'; 

/**
 * PreceptorFeedbacksPage displays a list of feedbacks provided by Preceptors.
 * Users can filter feedbacks by student name, university, health service, clinic area, and date range.
 * Each feedback can be expanded to view full details including selected ANSAT items.
 */
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

  // Detect clicks outside of calendar component to close it
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

  // Fetch feedback data on component mount
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
          {/* Feedback list */}
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
                  {/* Feedback meta info */}
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
                          {/* Detailed info section */}
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

                          {/* Updated: AI-selected ANSAT items (sorted and unique) */}
                          <div className="flex items-start gap-2">
                            <ClipboardList className="w-4 h-4 mt-1" />
                            <div>
                              <span className="font-medium">Selected ANSAT ITEMS:</span>
                              <ul className="ml-4 list-disc">
                                {Object.entries(fb.ai_items || {})
                                  .filter(([itemId], index, self) =>
                                    self.findIndex(([id]) => id === itemId) === index
                                  )
                                  .sort(([aId], [bId]) => {
                                    const [aMajor, aMinor] = aId.split('.').map(Number);
                                    const [bMajor, bMinor] = bId.split('.').map(Number);
                                    return aMajor !== bMajor ? aMajor - bMajor : aMinor - bMinor;
                                  })
                                  .map(([itemId, { description, is_positive }]) => (
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

                          {/* Flags section */}
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
