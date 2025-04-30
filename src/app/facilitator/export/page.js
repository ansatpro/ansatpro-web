"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search, X, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { GetAllStudentsWithDetails } from "../../../../lib/HowToConnectToFunction";

export default function ExportPage() {
  const router = useRouter();
  const searchRef = useRef(null);

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Get all students created by the facilitator
        const response = await GetAllStudentsWithDetails();
        console.log(response);

        // Convert to sampleFeedbacks format
        const sampleFeedbacks = [];

        response.forEach((student) => {
          const {
            $id: student_DocId,
            student_id: studentId,
            first_name,
            last_name,
            university_id: university,
            health_service_id: healthService,
            clinic_area_id: clinicArea,
            start_date: startDate,
            end_date: endDate,
            preceptorFeedbackList,
          } = student;

          // Sort preceptorFeedbackList by date
          const sortedFeedbackList = [...preceptorFeedbackList].sort(
            (a, b) => new Date(a.$createdAt) - new Date(b.$createdAt)
          );

          // Add feedback index for sequential naming
          sortedFeedbackList.forEach((feedback, index) => {
            const {
              $id: preceptorFeedback_DocId,
              $createdAt: preceptorFeedback_date,
              preceptor_id,
              preceptor_name: preceptor,
              content,
              flag_discussed_with_student: preceptor_flag_discussed_with_student,
              discussion_date: preceptor_discussion_date,
              review: is_marked,
              ai_feedback_items,
            } = feedback;

            // Extract AI feedback descriptions
            const aiFeedbackDescriptions = ai_feedback_items.map((item) => ({
              item_id: item.item_id,
              description: item.item_details.description,
              is_positive: item.is_positive,
            }));

            // Extract review scores and comments if review exists
            const reviewComment = is_marked?.comment || null;
            const reviewScore =
              is_marked?.review_scores.map((score) => ({
                item_id: score.item_id,
                score: score.score,
              })) || [];
            
            const flag_discussed_with_student = 
              is_marked?.flag_discussed_with_student ?? false;
            const discussion_date = is_marked?.discussion_date || null;
            const reviewDate = is_marked?.$createdAt || null;

            // Push transformed feedback to sampleFeedbacks
            sampleFeedbacks.push({
              student_DocId,
              preceptorFeedback_DocId,
              preceptorFeedback_date,
              studentId,
              studentName: `${first_name} ${last_name}`,
              university,
              healthService,
              clinicArea,
              startDate,
              endDate,
              preceptor_id,
              preceptor,
              content,
              preceptor_flag_discussed_with_student,
              preceptor_discussion_date,
              is_marked: !!is_marked,
              reviewComment,
              reviewScore,
              aiFeedbackDescriptions,
              flag_discussed_with_student,
              discussion_date,
              reviewDate,
              feedbackIndex: index + 1, // 1-based index for feedback numbering
              feedbackName: `Feedback ${index + 1}`, // Name as "Feedback 1", "Feedback 2", etc.
              totalFeedbacks: preceptorFeedbackList.length,
            });
          });
        });

        console.log(sampleFeedbacks);

        // convert sampleFeedbacks to sampleStudents
        const sampleStudents = [];
        const studentFeedbackMap = new Map();

        // Group feedbacks by student ID
        sampleFeedbacks.forEach((feedback) => {
          if (!studentFeedbackMap.has(feedback.studentId)) {
            studentFeedbackMap.set(feedback.studentId, []);
          }
          studentFeedbackMap.get(feedback.studentId).push(feedback);
        });

        // Create student entries with all their feedbacks
        studentFeedbackMap.forEach((feedbacks, studentId) => {
          if (feedbacks.length > 0) {
            const firstFeedback = feedbacks[0];
            sampleStudents.push({
              docId: firstFeedback.student_DocId,
              studentId: firstFeedback.studentId,
              studentName: firstFeedback.studentName,
              studentUniversity: firstFeedback.university,
              healthService: firstFeedback.healthService,
              clinicArea: firstFeedback.clinicArea,
              startDate: firstFeedback.startDate,
              endDate: firstFeedback.endDate,
              feedbacks: feedbacks, // Store all feedbacks for this student
              totalFeedbacks: feedbacks.length,
            });
          }
        });

        console.log(sampleStudents);

        // Store in localStorage
        localStorage.setItem(
          "ansatpro_students",
          JSON.stringify(sampleStudents)
        );

        setStudents(sampleStudents);
      } catch (err) {
        console.error("Error initializing data:", err);
        // If an error occurs, still try to use sample data
        setStudents([]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();

    // Add event to close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    // Ensure students array exists and has content
    if (!students || students.length === 0) {
      return;
    }

    // Search by student ID or name
    const lowercaseValue = value.toLowerCase();
    const results = students.filter((student) => {
      const studentIdMatch =
        student.studentId &&
        student.studentId.toLowerCase().includes(lowercaseValue);
      const studentNameMatch =
        student.studentName &&
        student.studentName.toLowerCase().includes(lowercaseValue);
      return studentIdMatch || studentNameMatch;
    });

    setSearchResults(results);
    setShowDropdown(true);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setShowDropdown(false);
    setSelectedStudent(null);
  };

  // Select student
  const selectStudent = (student) => {
    if (!student || !student.docId) {
      console.error("Invalid student data:", student);
      return;
    }

    setSelectedStudent(student);
    setSearchTerm(student.studentName || "");
    setShowDropdown(false);

    // Store selected student in localStorage
    localStorage.setItem("ansatpro_selected_student", JSON.stringify(student));

    // Navigate to student detail page - using docId as route parameter
    router.push(`/facilitator/export/${student.docId}/studentDetail`);
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <h1 className="text-3xl font-bold">Export Data</h1>

      {isLoading ? (
        <div className="py-6">
          <p className="text-muted-foreground">Loading student data...</p>
        </div>
      ) : (
        <>
          <br />
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold">Search for a Student</h2>
              <p className="text-sm text-muted-foreground">
                To generate reports, start by searching for a student by name or ID
              </p>
            </CardHeader>
            <CardContent>
              <div className="relative" ref={searchRef}>
                <div className="flex gap-2 mb-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search by student name or ID"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="pl-10 pr-10"
                    />
                    {searchTerm && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute w-full bg-white mt-1 rounded-md border shadow-lg z-10 max-h-80 overflow-y-auto">
                    {searchResults.map((student) => (
                      <div
                        key={student.docId}
                        className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                        onClick={() => selectStudent(student)}
                      >
                        <div className="font-medium">{student.studentName}</div>
                        <div className="text-sm text-gray-500 flex justify-between">
                          <span>ID: {student.studentId}</span>
                          <span>{student.studentUniversity}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {student.totalFeedbacks} feedback(s) available
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showDropdown && searchTerm && searchResults.length === 0 && (
                  <div className="absolute w-full bg-white mt-1 rounded-md border shadow-lg z-10">
                    <div className="p-3 text-center text-gray-500">
                      No students found matching "{searchTerm}"
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedStudent && (
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">
                      {selectedStudent.studentName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      ID: {selectedStudent.studentId}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedStudent.studentUniversity}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedStudent.totalFeedbacks} feedback(s) available
                    </p>
                  </div>
                  <Button
                    onClick={() =>
                      router.push(
                        `/facilitator/export/${selectedStudent.docId}/studentDetail`
                      )
                    }
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!searchTerm && (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium mb-2">
                Ready to Generate Reports
              </h3>
              <p className="text-gray-500 mb-4">
                Search for a student above to view their details and generate
                reports
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
