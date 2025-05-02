"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  Sparkles,
  Download
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { format } from "date-fns";
// Import react-pdf libraries
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font
} from "@react-pdf/renderer";
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { GetAllStudentsWithDetails } from "../../../../../../functions/HowToConnectToFunction";

// Register fonts
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' }
  ]
});

// Define PDF styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Roboto'
  },
  header: {
    textAlign: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 15
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    padding: 15,
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
    paddingBottom: 8,
    marginBottom: 12
  },
  infoTable: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%'
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5
  },
  tableLabel: {
    width: '35%',
    fontWeight: 'bold'
  },
  tableValue: {
    width: '65%'
  },
  contentContainer: {
    marginBottom: 20
  },
  contentBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#dddddd',
    padding: 15,
    marginBottom: 10
  },
  feedbackItem: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee'
  },
  feedbackMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  feedbackDate: {
    fontSize: 10,
    color: '#666666'
  },
  feedbackText: {
    fontSize: 12,
    color: '#333333'
  },
  paragraph: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 1.5
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 5
  },
  bulletPoint: {
    width: 15,
    fontSize: 12
  },
  listItemText: {
    flex: 1,
    fontSize: 12
  },
  footer: {
    marginTop: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#dddddd',
    fontSize: 10,
    color: '#666666',
    textAlign: 'center'
  },
  infoRow: {
    marginBottom: 8,
  },
  assessmentHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
    paddingBottom: 5,
    marginBottom: 5,
  },
  assessmentRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eeeeee',
  },
  assessmentCell: {
    fontSize: 10,
    padding: 2,
  },
});

// Custom toast implementation for notifications
const toast = {
  success: (message) => {
    console.log("Success:", message);
    // Create a temporary element to display toast if DOM is available
    if (typeof document !== 'undefined') {
      const toastEl = document.createElement('div');
      toastEl.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded shadow-lg z-50';
      toastEl.textContent = message;
      document.body.appendChild(toastEl);
      setTimeout(() => {
        toastEl.remove();
      }, 3000);
    }
  },
  error: (message) => {
    console.error("Error:", message);
    // Create a temporary element to display toast if DOM is available
    if (typeof document !== 'undefined') {
      const toastEl = document.createElement('div');
      toastEl.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded shadow-lg z-50';
      toastEl.textContent = message;
      document.body.appendChild(toastEl);
      setTimeout(() => {
        toastEl.remove();
      }, 3000);
    }
  }
};

// Helper function to format date as YYYY-MM-DD
const formatDateToYMD = (dateString) => {
  if (!dateString) return "Not Available";

  try {
    // Handle ISO date format from API (split at T to get just the date part)
    if (typeof dateString === 'string' && dateString.includes('T')) {
      dateString = dateString.split('T')[0];
      // If we now have a valid YYYY-MM-DD format, return it
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
    }

    // Try to parse the date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // If invalid date but still a string with something, return it
      return typeof dateString === 'string' && dateString.trim() ? dateString : "Not Available";
    }

    // Format date to YYYY-MM-DD
    return format(date, "yyyy-MM-dd");
  } catch (e) {
    console.error("Date formatting error:", e, "for date:", dateString);
    // Return original if processing fails
    return typeof dateString === 'string' ? dateString : "Not Available";
  }
};

// PDF document component for reports
const ReportPDF = ({ student, reportType, reportContent }) => {
  // Format date consistently for PDF - with time for main date
  const formatPdfDate = (dateString, includeTime = false) => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      if (includeTime) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      }

      return `${year}-${month}-${day}`;
    } catch (e) {
      return dateString || "Not Available";
    }
  };

  // Get feedbacks in chronological order
  const getFeedbacksInOrder = () => {
    // Ensure student object has feedbacks array
    if (!student.feedbacks || !Array.isArray(student.feedbacks)) {
      console.warn("No feedbacks available for student", student.studentName);
      return [];
    }

    // Sort feedbacks by date
    return [...student.feedbacks].sort(
      (a, b) => new Date(a.preceptorFeedback_date) - new Date(b.preceptorFeedback_date)
    );
  };

  // Get all feedbacks in chronological order
  const orderedFeedbacks = getFeedbacksInOrder();

  // Group feedbacks for Preceptor Report (2 per page)
  const groupedFeedbacks = [];
  for (let i = 0; i < orderedFeedbacks.length; i += 2) {
    groupedFeedbacks.push(orderedFeedbacks.slice(i, i + 2));
  }

  // Create a document with multiple pages
  return (
    <Document>
      {/* First page: Student Information */}
      <Page size="A4" style={styles.page}>
        {/* Document title */}
        <View style={styles.header}>
          <Text style={styles.title}>{reportType} Report</Text>
          <Text style={styles.subtitle}>Generated on {format(new Date(), "MMMM d, yyyy")}</Text>
        </View>

        {/* Student information section */}
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Student Information</Text>
          <View style={styles.infoTable}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Student ID:</Text>
              <Text style={styles.tableValue}>{student.studentId}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Student Name:</Text>
              <Text style={styles.tableValue}>{student.studentName}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>University:</Text>
              <Text style={styles.tableValue}>{student.university || student.studentUniversity}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Health Service:</Text>
              <Text style={styles.tableValue}>{student.healthService || "Not Available"}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Clinic Area:</Text>
              <Text style={styles.tableValue}>{student.clinicArea || "Not Available"}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Placement Period:</Text>
              <Text style={styles.tableValue}>
                {formatPdfDate(student.startDate)} to {formatPdfDate(student.endDate)}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>ANSAT Pro - Confidential Document - {formatPdfDate(new Date())}</Text>
        </View>
      </Page>

      {/* Feedback content pages based on report type */}
      {reportType === "Preceptor Feedback" ? (
        // For Preceptor Feedback: two feedbacks per page
        groupedFeedbacks.map((group, groupIndex) => (
          <Page key={`group-${groupIndex}`} size="A4" style={styles.page}>
            <View style={styles.contentContainer}>
              <Text style={styles.sectionTitle}>{reportType} Content</Text>

              {group.map((feedback, index) => (
                <View key={`feedback-${feedback.preceptorFeedback_DocId || index}`} style={{ marginBottom: 20 }}>
                  <View style={{ textAlign: 'center', marginBottom: 10 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                      Feedback {groupIndex * 2 + index + 1} - {formatPdfDate(feedback.preceptorFeedback_date)}
                    </Text>
                  </View>

                  <View style={styles.contentBox}>
                    {/* Feedback Information */}
                    <View style={styles.feedbackItem}>
                      <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Feedback Information:</Text>
                      <Text style={styles.feedbackText}>
                        Date: {formatPdfDate(feedback.preceptorFeedback_date, true)} | Preceptor: {feedback.preceptor} | Student: {feedback.studentName}
                      </Text>
                    </View>

                    {/* Preceptor Feedback Content */}
                    <View style={styles.feedbackItem}>
                      <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Preceptor Feedback:</Text>
                      <Text style={styles.feedbackText}>{feedback.content}</Text>
                    </View>

                    {/* Student Discussion (Preceptor) */}
                    <View style={styles.feedbackItem}>
                      <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Student Discussion (Preceptor):</Text>
                      {feedback.preceptor_flag_discussed_with_student ? (
                        feedback.preceptor_discussion_date ? (
                          <Text style={styles.feedbackText}>
                            This feedback has been discussed with the student on {formatPdfDate(feedback.preceptor_discussion_date)}.
                          </Text>
                        ) : (
                          <Text style={styles.feedbackText}>
                            This feedback has been discussed with the student.
                          </Text>
                        )
                      ) : (
                        <Text style={styles.feedbackText}>
                          This feedback has not been discussed with the student.
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </Page>
        ))
      ) : (
        // For Facilitator Review and All Feedback: one feedback per page
        orderedFeedbacks.map((feedback, index) => (
          <Page key={`feedback-page-${feedback.preceptorFeedback_DocId || index}`} size="A4" style={styles.page}>
            <View style={styles.contentContainer}>
              <Text style={styles.sectionTitle}>{reportType} Content</Text>

              <View style={{ textAlign: 'center', marginBottom: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                  Feedback {index + 1} - {formatPdfDate(feedback.preceptorFeedback_date)}
                </Text>
              </View>

              <View style={styles.contentBox}>
                {reportType === "Facilitator Review" ? (
                  // Content for Facilitator Review report - all in one card
                  <View>
                    {/* Only show review details if the feedback has been marked */}
                    {feedback.is_marked ? (
                      <>
                        {/* Feedback Information */}
                        <View style={styles.feedbackItem}>
                          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Feedback Information:</Text>
                          <Text style={styles.feedbackText}>
                            Date: {formatPdfDate(feedback.preceptorFeedback_date, true)} | Preceptor: {feedback.preceptor} | Student: {feedback.studentName}
                          </Text>
                        </View>

                        {/* Facilitator Review Comments */}
                        <View style={styles.feedbackItem}>
                          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Facilitator Review:</Text>
                          {feedback.reviewComment ? (
                            <Text style={styles.feedbackText}>{feedback.reviewComment}</Text>
                          ) : (
                            <Text style={styles.feedbackText}>No comments provided</Text>
                          )}
                        </View>

                        {/* Assessment Items */}
                        <View style={styles.feedbackItem}>
                          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Assessment Items:</Text>
                          {feedback.reviewScore && feedback.reviewScore.length > 0 ? (
                            <View>
                              {/* Header for the assessment items table */}
                              <View style={styles.assessmentHeader}>
                                <Text style={[styles.assessmentCell, { width: '15%', fontWeight: 'bold' }]}>Item ID</Text>
                                <Text style={[styles.assessmentCell, { width: '55%', fontWeight: 'bold' }]}>Description</Text>
                                <Text style={[styles.assessmentCell, { width: '15%', fontWeight: 'bold' }]}>Type</Text>
                                <Text style={[styles.assessmentCell, { width: '15%', fontWeight: 'bold' }]}>Rating</Text>
                              </View>

                              {(() => {
                                const itemsMap = new Map();

                                if (feedback.aiFeedbackDescriptions && Array.isArray(feedback.aiFeedbackDescriptions)) {
                                  feedback.aiFeedbackDescriptions.forEach(item => {
                                    itemsMap.set(item.item_id, {
                                      itemId: item.item_id,
                                      description: item.description || "",
                                      isPositive: item.is_positive,
                                      rating: null
                                    });
                                  });
                                }

                                feedback.reviewScore.forEach(score => {
                                  const itemId = score.item_id;
                                  if (itemsMap.has(itemId)) {
                                    const item = itemsMap.get(itemId);
                                    item.rating = score.score;
                                    itemsMap.set(itemId, item);
                                  } else {
                                    itemsMap.set(itemId, {
                                      itemId: itemId,
                                      description: "",
                                      isPositive: null,
                                      rating: score.score
                                    });
                                  }
                                });

                                return Array.from(itemsMap.values()).map((item, idx) => (
                                  <View key={idx} style={styles.assessmentRow}>
                                    <Text style={[styles.assessmentCell, { width: '15%' }]}>{item.itemId}</Text>
                                    <Text style={[styles.assessmentCell, { width: '55%' }]}>{item.description || "-"}</Text>
                                    <Text style={[styles.assessmentCell, { width: '15%' }]}>
                                      {item.isPositive !== null ? (
                                        item.isPositive ? "Strength" : "Improvement"
                                      ) : "-"}
                                    </Text>
                                    <Text style={[styles.assessmentCell, { width: '15%' }]}>{item.rating || "-"}</Text>
                                  </View>
                                ));
                              })()}
                            </View>
                          ) : (
                            <Text style={styles.feedbackText}>No assessment items available</Text>
                          )}
                        </View>

                        {/* Student Discussion (Facilitator) */}
                        <View style={styles.feedbackItem}>
                          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Student Discussion (Facilitator):</Text>
                          {feedback.flag_discussed_with_student ? (
                            feedback.discussion_date ? (
                              <Text style={styles.feedbackText}>
                                This feedback has been discussed with the student on {formatPdfDate(feedback.discussion_date)}.
                              </Text>
                            ) : (
                              <Text style={styles.feedbackText}>
                                This feedback has been discussed with the student.
                              </Text>
                            )
                          ) : (
                            <Text style={styles.feedbackText}>
                              This feedback has not been discussed with the student.
                            </Text>
                          )}
                        </View>
                      </>
                    ) : (
                      <View style={styles.feedbackItem}>
                        <Text style={styles.feedbackText}>
                          This feedback has not been reviewed by a facilitator yet.
                        </Text>
                      </View>
                    )}
                  </View>
                ) : (
                  // Content for complete feedback report (all details)
                  <View>
                    {/* Feedback Information */}
                    <View style={styles.feedbackItem}>
                      <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Feedback Information:</Text>
                      <Text style={styles.feedbackText}>
                        Date: {formatPdfDate(feedback.preceptorFeedback_date, true)} | Preceptor: {feedback.preceptor} | Student: {feedback.studentName}
                      </Text>
                    </View>

                    {/* Preceptor Feedback */}
                    <View style={styles.feedbackItem}>
                      <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Preceptor Feedback:</Text>
                      <Text style={styles.feedbackText}>{feedback.content}</Text>
                    </View>

                    {/* Student Discussion (Preceptor) */}
                    <View style={styles.feedbackItem}>
                      <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Student Discussion (Preceptor):</Text>
                      {feedback.preceptor_flag_discussed_with_student ? (
                        feedback.preceptor_discussion_date ? (
                          <Text style={styles.feedbackText}>
                            This feedback has been discussed with the student on {formatPdfDate(feedback.preceptor_discussion_date)}.
                          </Text>
                        ) : (
                          <Text style={styles.feedbackText}>
                            This feedback has been discussed with the student.
                          </Text>
                        )
                      ) : (
                        <Text style={styles.feedbackText}>
                          This feedback has not been discussed with the student.
                        </Text>
                      )}
                    </View>

                    {/* Display Facilitator Review content only if marked */}
                    {feedback.is_marked && (
                      <>
                        {/* Facilitator Review */}
                        <View style={styles.feedbackItem}>
                          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Facilitator Review:</Text>
                          {feedback.reviewComment ? (
                            <Text style={styles.feedbackText}>{feedback.reviewComment}</Text>
                          ) : (
                            <Text style={styles.feedbackText}>No comments provided</Text>
                          )}
                        </View>

                        {/* Assessment Items */}
                        <View style={styles.feedbackItem}>
                          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Assessment Items:</Text>
                          {feedback.reviewScore && feedback.reviewScore.length > 0 ? (
                            <View>
                              {/* Header for the assessment items table */}
                              <View style={styles.assessmentHeader}>
                                <Text style={[styles.assessmentCell, { width: '15%', fontWeight: 'bold' }]}>Item ID</Text>
                                <Text style={[styles.assessmentCell, { width: '55%', fontWeight: 'bold' }]}>Description</Text>
                                <Text style={[styles.assessmentCell, { width: '15%', fontWeight: 'bold' }]}>Type</Text>
                                <Text style={[styles.assessmentCell, { width: '15%', fontWeight: 'bold' }]}>Rating</Text>
                              </View>

                              {(() => {
                                const itemsMap = new Map();

                                if (feedback.aiFeedbackDescriptions && Array.isArray(feedback.aiFeedbackDescriptions)) {
                                  feedback.aiFeedbackDescriptions.forEach(item => {
                                    itemsMap.set(item.item_id, {
                                      itemId: item.item_id,
                                      description: item.description || "",
                                      isPositive: item.is_positive,
                                      rating: null
                                    });
                                  });
                                }

                                feedback.reviewScore.forEach(score => {
                                  const itemId = score.item_id;
                                  if (itemsMap.has(itemId)) {
                                    const item = itemsMap.get(itemId);
                                    item.rating = score.score;
                                    itemsMap.set(itemId, item);
                                  } else {
                                    itemsMap.set(itemId, {
                                      itemId: itemId,
                                      description: "",
                                      isPositive: null,
                                      rating: score.score
                                    });
                                  }
                                });

                                return Array.from(itemsMap.values()).map((item, idx) => (
                                  <View key={idx} style={styles.assessmentRow}>
                                    <Text style={[styles.assessmentCell, { width: '15%' }]}>{item.itemId}</Text>
                                    <Text style={[styles.assessmentCell, { width: '55%' }]}>{item.description || "-"}</Text>
                                    <Text style={[styles.assessmentCell, { width: '15%' }]}>
                                      {item.isPositive !== null ? (
                                        item.isPositive ? "Strength" : "Improvement"
                                      ) : "-"}
                                    </Text>
                                    <Text style={[styles.assessmentCell, { width: '15%' }]}>{item.rating || "-"}</Text>
                                  </View>
                                ));
                              })()}
                            </View>
                          ) : (
                            <Text style={styles.feedbackText}>No assessment items available</Text>
                          )}
                        </View>

                        {/* Student Discussion (Facilitator) */}
                        <View style={styles.feedbackItem}>
                          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Student Discussion (Facilitator):</Text>
                          {feedback.flag_discussed_with_student ? (
                            feedback.discussion_date ? (
                              <Text style={styles.feedbackText}>
                                This feedback has been discussed with the student on {formatPdfDate(feedback.discussion_date)}.
                              </Text>
                            ) : (
                              <Text style={styles.feedbackText}>
                                This feedback has been discussed with the student.
                              </Text>
                            )
                          ) : (
                            <Text style={styles.feedbackText}>
                              This feedback has not been discussed with the student.
                            </Text>
                          )}
                        </View>
                      </>
                    )}
                  </View>
                )}
              </View>
            </View>
          </Page>
        ))
      )}

      {/* Special case for no feedback data */}
      {orderedFeedbacks.length === 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>{reportType} Content</Text>
            <View style={styles.contentBox}>
              <Text style={styles.paragraph}>
                No {reportType.toLowerCase()} data available for this student.
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text>ANSAT Pro - Confidential Document - {formatPdfDate(new Date())}</Text>
          </View>
        </Page>
      )}
    </Document>
  );
};

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const docId = params.id; // Document ID from dynamic route

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState({});
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [error, setError] = useState("");
  const [exportType, setExportType] = useState("");

  // Load student data
  useEffect(() => {
    const loadStudentData = async () => {
      try {
        if (!docId) {
          setError("Invalid document ID");
          setLoading(false);
          return;
        }

        // First try to load selected student from localStorage
        const selectedStudentJson = localStorage.getItem('ansatpro_selected_student');

        if (selectedStudentJson) {
          try {
            const selectedStudent = JSON.parse(selectedStudentJson);
            if (selectedStudent.docId === docId) {
              console.log("Found matching student in localStorage:", selectedStudent);

              // Try to get additional student data from API
              const enrichedStudent = await enrichStudentData(selectedStudent);
              setStudent(enrichedStudent);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error("Error parsing student data from localStorage:", e);
          }
        }

        // If no matching student is found, search in the student list
        const studentsJson = localStorage.getItem('ansatpro_students');
        if (studentsJson) {
          try {
            const students = JSON.parse(studentsJson);
            if (Array.isArray(students)) {
              const foundStudent = students.find(s => s.docId === docId);

              if (foundStudent) {
                console.log("Found matching student in student list:", foundStudent);

                // Try to get additional student data from API
                const enrichedStudent = await enrichStudentData(foundStudent);
                setStudent(enrichedStudent);
                setLoading(false);
                return;
              }
            } else {
              console.error("Student data format is incorrect, not an array:", typeof students);
            }
          } catch (e) {
            console.error("Error parsing student list from localStorage:", e);
          }
        } else {
          console.error("No student list data in localStorage");
        }

        // If still not found, try to fetch from API
        try {
          const response = await GetAllStudentsWithDetails();
          console.log("API Response:", response);

          if (response && Array.isArray(response)) {
            const foundStudent = response.find(s =>
              s.$id === docId ||
              s.student_id === docId
            );

            if (foundStudent) {
              console.log("Found student from API:", foundStudent);

              // Extract and format dates 
              const startDate = foundStudent.start_date ? foundStudent.start_date : null;
              const endDate = foundStudent.end_date ? foundStudent.end_date : null;

              const mappedStudent = {
                docId: foundStudent.$id || docId,
                studentId: foundStudent.student_id,
                studentName: `${foundStudent.first_name} ${foundStudent.last_name}`,
                university: foundStudent.university_id,
                studentUniversity: foundStudent.university_id, // For backward compatibility
                healthService: foundStudent.health_service_id,
                clinicArea: foundStudent.clinic_area_id,
                startDate: startDate,
                endDate: endDate,
                courses: [], // Default empty courses array
                feedbacks: [] // Default empty feedbacks array
              };

              setStudent(mappedStudent);
              setLoading(false);
              return;
            }
          }
        } catch (apiError) {
          console.error("Error fetching student data from API:", apiError);
        }

        // If still not found, use mock data
        console.log("No matching student found, using mock data");
        setStudent({
          docId: docId,
          studentId: "S1000",
          studentName: "Unknown Student",
          university: "Unknown University",
          studentUniversity: "Unknown University",
          healthService: "General Hospital",
          clinicArea: "General Practice",
          startDate: "2023-01-15",
          endDate: "2023-06-30",
          courses: [
            { code: "MED101", name: "Introduction to Medicine", year: "2023" },
            { code: "BIO240", name: "Human Anatomy", year: "2023" }
          ],
          feedbacks: []
        });
        setLoading(false);
      } catch (error) {
        console.error("Error loading student data:", error);
        setError(`Error loading student data: ${error.message}`);
        setLoading(false);
      }
    };

    loadStudentData();
  }, [docId]);

  // Helper function to ensure student data has all required fields
  const enrichStudentData = async (studentData) => {
    console.log("Enriching student data:", studentData);

    // Try to get missing data from the API, especially for dates and other fields
    if (!studentData.healthService || !studentData.clinicArea ||
      !studentData.startDate || !studentData.endDate) {
      try {
        console.log("Trying to get additional data from API for student:", studentData.studentId);
        const response = await GetAllStudentsWithDetails();

        if (response && Array.isArray(response)) {
          const foundStudent = response.find(s =>
            s.$id === studentData.docId ||
            s.student_id === studentData.studentId
          );

          if (foundStudent) {
            console.log("Found student in API:", foundStudent);

            // Update student data with API data if available
            studentData = {
              ...studentData,
              healthService: studentData.healthService || foundStudent.health_service_id,
              clinicArea: studentData.clinicArea || foundStudent.clinic_area_id,
              startDate: studentData.startDate || foundStudent.start_date,
              endDate: studentData.endDate || foundStudent.end_date,
              university: studentData.university || foundStudent.university_id
            };
          }
        }
      } catch (error) {
        console.error("Error fetching data from API:", error);
      }
    }

    // Format dates consistently
    const formattedStudent = {
      ...studentData,
      startDate: formatDateToYMD(studentData.startDate),
      endDate: formatDateToYMD(studentData.endDate),
      university: studentData.university || studentData.studentUniversity
    };

    console.log("Formatted student data:", formattedStudent);

    return formattedStudent;
  };

  // Navigate back to search page
  const handleBackClick = () => {
    router.push("/facilitator/export");
  };

  // Handle generating AI summary
  const handleGenerateAISummary = async () => {
    setExportLoading(prev => ({ ...prev, aiSummary: true }));

    try {
      // Save current student data to localStorage for aiSummary page access
      if (student) {
        localStorage.setItem('ansatpro_current_student', JSON.stringify(student));
      }

      // Navigate to AI summary page
      router.push(`/facilitator/export/${docId}/studentDetail/aiSummary`);
    } catch (error) {
      console.error("AI Summary navigation error:", error);
      toast.error("There was an error navigating to the AI summary page. Please try again.");
    } finally {
      setExportLoading(prev => ({ ...prev, aiSummary: false }));
    }
  };

  // Handle export action
  const handleExport = (type) => {
    if (!student || !student.feedbacks) {
      toast.error(`Cannot export ${type}. Student data or feedbacks are missing.`);
      return;
    }

    setExportType(type);
    setShowExportDialog(true);
  };

  // Export confirmation dialog
  const confirmExport = async () => {
    if (!exportType) {
      toast.error("No export type selected");
      return;
    }

    if (!student) {
      toast.error("No student data available");
      return;
    }

    setExportLoading(prev => ({ ...prev, [exportType]: true }));

    try {
      // Create date string for filename
      const dateStr = format(new Date(), "yyyy-MM-dd");

      // Create filename
      const fileName = `${student.studentName}_${exportType.replace(/\s+/g, '_')}_${dateStr}.pdf`;

      // Generate PDF blob using react-pdf-renderer
      const pdfBlob = await pdf(
        <ReportPDF
          student={student}
          reportType={exportType}
        />
      ).toBlob();

      // Use file-saver to save the file
      saveAs(pdfBlob, fileName);

      toast.success(`${exportType} has been exported successfully.`);

      // Close dialog
      setShowExportDialog(false);

      // Navigate to success page after brief delay to ensure file download starts
      setTimeout(() => {
        router.push("/facilitator/export/success");
      }, 500);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`There was an error exporting the ${exportType}. Please try again.`);
    } finally {
      setExportLoading(prev => ({ ...prev, [exportType]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-full gap-4">
        <p className="text-lg text-red-500">{error}</p>
        <Button onClick={handleBackClick} variant="outline">Return to Search</Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="mb-8 flex items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBackClick}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-3xl font-bold">Student Details</h1>
        </div>
      </header>

      {/* Student info card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Student Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Student ID</p>
                <p className="font-medium">{student.studentId}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Student Name</p>
                <p className="font-medium">{student.studentName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">University</p>
                <p className="font-medium">{student.university || student.studentUniversity}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Document ID</p>
                <p className="font-medium">{student.docId}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Health Service</p>
                <p className="font-medium">{student.healthService || "Not Available"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Clinic Area</p>
                <p className="font-medium">{student.clinicArea || "Not Available"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">{formatDateToYMD(student.startDate)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-medium">{formatDateToYMD(student.endDate)}</p>
              </div>
            </div>


          </div>
        </CardContent>
      </Card>

      {/* Export Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Export Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">Choose an export option for {student.studentName}&apos;s reports:</p>

          <div className="flex flex-col md:flex-row gap-4 flex-wrap">
            {/* AI Summary Button - Different color */}
            <Button
              variant="default"
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleGenerateAISummary}
              disabled={exportLoading.aiSummary}
            >
              {exportLoading.aiSummary ? (
                "Navigating..."
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate AI Summary
                </>
              )}
            </Button>

            {/* Export Preceptor Feedback Button */}
            <Button
              variant="outline"
              onClick={() => handleExport("Preceptor Feedback")}
              disabled={exportLoading["Preceptor Feedback"]}
            >
              {exportLoading["Preceptor Feedback"] ? (
                "Exporting..."
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export All Preceptor Feedback
                </>
              )}
            </Button>

            {/* Export Facilitator Review Button */}
            <Button
              variant="outline"
              onClick={() => handleExport("Facilitator Review")}
              disabled={exportLoading["Facilitator Review"]}
            >
              {exportLoading["Facilitator Review"] ? (
                "Exporting..."
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export All Facilitator Review
                </>
              )}
            </Button>

            {/* Export All Feedback Button */}
            <Button
              variant="outline"
              onClick={() => handleExport("All Feedback")}
              disabled={exportLoading["All Feedback"]}
            >
              {exportLoading["All Feedback"] ? (
                "Exporting..."
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export All Feedback
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export confirmation dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export {exportType}</DialogTitle>
            <DialogDescription>
              You are about to export {exportType} for {student?.studentName}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-2">Export Details:</p>
            <ul className="space-y-1 mb-4">
              <li className="flex items-start">
                <span className="font-medium mr-2">Student:</span>
                <span>{student?.studentName}</span>
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">Export Type:</span>
                <span>{exportType}</span>
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">Format:</span>
                <span>PDF Document</span>
              </li>
            </ul>
            <p className="text-sm text-muted-foreground">
              This will generate and download a PDF report with all {exportType.toLowerCase()} data.
            </p>
          </div>
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={confirmExport}
              disabled={exportLoading[exportType]}
            >
              {exportLoading[exportType] ? "Exporting..." : "Download PDF"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
