"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default function StudentDetail() {
  const router = useRouter();
  const params = useParams();
  const feedbackId = params.id; // Get ID parameter from URL
  
  const [confirmed, setConfirmed] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackData, setFeedbackData] = useState(null);

  // Preset feedback data (used as fallback)
  const sampleFeedbacks = [
    {
      id: "F89012",
      studentName: "Olivia Martinez",
      ismarked: "Marked",
      is_marked: true,
      university: "Johns Hopkins University",
      healthService: "Community Clinic",
      clinicArea: "Family Medicine",
      date: "2023-07-10",
      content: "Olivia demonstrated excellent patient care skills and empathy. Her clinical notes were thorough and well-organized. Need to work on time management during busy clinic hours.",
      preceptor: "Dr. Johnson",
      studentId: "ST12345",
      startDate: "2023-05-01",
      endDate: "2023-08-30"
    },
    {
      id: "F89013",
      studentName: "Michael Brown",
      ismarked: "Unmarked",
      is_marked: false,
      university: "Stanford University",
      healthService: "Memorial Hospital",
      clinicArea: "Cardiology",
      date: "2023-08-05",
      content: "Michael shows promising clinical reasoning skills. He effectively communicates with patients and staff. Needs to improve documentation completeness and timeliness.",
      preceptor: "Dr. Williams",
      studentId: "ST67890",
      startDate: "2023-06-15",
      endDate: "2023-09-15"
    }
  ];

  // Fetch feedback and student data
  useEffect(() => {
    const fetchFeedbackData = async () => {
      try {
        // First try to get current feedback from localStorage
        const storedCurrentFeedback = localStorage.getItem('ansatpro_current_feedback');
        
        if (storedCurrentFeedback) {
          const currentFeedback = JSON.parse(storedCurrentFeedback);
          
          // Check if this is the feedback we need
          if (currentFeedback.id === feedbackId) {
            console.log("Using feedback data from localStorage");
            setFeedbackData(currentFeedback);
            
            // Create student details object
            const studentDetails = {
              name: currentFeedback.studentName,
              studentId: currentFeedback.studentId || `ID-${currentFeedback.id}`,
              university: currentFeedback.university,
              healthService: currentFeedback.healthService,
              clinicArea: currentFeedback.clinicArea,
              startDate: currentFeedback.startDate,
              endDate: currentFeedback.endDate
            };
            
            setSelectedStudent(studentDetails);
            setLoading(false);
            return;
          }
        }
        
        // If current feedback not found, try to get from all feedbacks list
        const storedFeedbacks = localStorage.getItem('ansatpro_feedbacks');
        
        if (storedFeedbacks) {
          const feedbacks = JSON.parse(storedFeedbacks);
          const feedback = feedbacks.find(f => f.id === feedbackId);
          
          if (feedback) {
            console.log("Using feedback data from stored feedbacks list");
            setFeedbackData(feedback);
            
            // Create student details object
            const studentDetails = {
              name: feedback.studentName,
              studentId: feedback.studentId || `ID-${feedback.id}`,
              university: feedback.university,
              healthService: feedback.healthService,
              clinicArea: feedback.clinicArea,
              startDate: feedback.startDate,
              endDate: feedback.endDate
            };
            
            setSelectedStudent(studentDetails);
            setLoading(false);
            return;
          }
        }
        
        // If no data in localStorage, fall back to mock data
        console.log("Using fallback data");
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Find feedback
        const feedback = sampleFeedbacks.find(f => f.id === feedbackId);
        
        if (feedback) {
          setFeedbackData(feedback);
          
          // Create student details object
          const studentDetails = {
            name: feedback.studentName,
            studentId: feedback.studentId || `ID-${feedback.id}`,
            university: feedback.university,
            healthService: feedback.healthService,
            clinicArea: feedback.clinicArea,
            startDate: feedback.startDate,
            endDate: feedback.endDate
          };
          
          setSelectedStudent(studentDetails);
        } else {
          console.error("Feedback not found with ID:", feedbackId);
        }
      } catch (error) {
        console.error("Error fetching feedback data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (feedbackId) {
      fetchFeedbackData();
    }
  }, [feedbackId]);

  // Handle checkbox state change
  const handleConfirmChange = (checked) => {
    setConfirmed(checked);
  };

  // Handle next button click
  const handleNextClick = () => {
    if (confirmed && feedbackData) {
      // Decide where to go next based on feedback status
      if (feedbackData.is_marked) {
        // Already marked, go to review page
        router.push(`/facilitator/feedback/${feedbackId}/studentDetail/reviewFeedback`);
      } else {
        // Not marked, go to create page
        router.push(`/facilitator/feedback/${feedbackId}/studentDetail/createFeedback`);
      }
    }
  };

  // Handle back navigation
  const handleBackClick = () => {
    router.push("/facilitator/feedback");
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString || "N/A";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  // If feedback data not found
  if (!feedbackData || !selectedStudent) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Feedback Not Found</h2>
          <p className="text-muted-foreground mb-6">Unable to find feedback with ID: {feedbackId}</p>
          <Button onClick={() => router.push('/facilitator/feedback')}>
            Return to Feedback List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Main content */}
      <main className="flex-1 p-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
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
          
          <p className="text-lg text-muted-foreground mb-6">
            View the student's feedback: <span className="font-medium">{feedbackData.is_marked ? "Marked" : "Unmarked"}</span>
          </p>
        </header>
        
        <div className="space-y-8">
          
          
          {/* Student Card */}
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle className="text-2xl">{selectedStudent.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Student ID</p>
                  <p className="font-medium">{selectedStudent.studentId}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">University</p>
                  <p className="font-medium">{selectedStudent.university}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Assigned Health Service</p>
                  <p className="font-medium">{selectedStudent.healthService}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Assigned Clinic Area</p>
                  <p className="font-medium">{selectedStudent.clinicArea}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Placement Start Date</p>
                  <p className="font-medium">{formatDate(selectedStudent.startDate)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Placement End Date</p>
                  <p className="font-medium">{formatDate(selectedStudent.endDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Student discussion section (Preceptor) */}
          <Card className="mb-6 max-w-3xl">
            <CardHeader>
              <CardTitle className="text-xl">Student Discussion (Preceptor)</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                // 明确检查数据类型和值
                const wasDiscussed = 
                  feedbackData.preceptor_flag_discussed_with_student === true || 
                  feedbackData.preceptor_flag_discussed_with_student === "true" || 
                  feedbackData.preceptor_flag_discussed_with_student === "yes";
                
                const discussionDate = feedbackData.preceptor_discussion_date;
                
                return (
                  <div className={`p-4 border rounded-md ${wasDiscussed ? 'bg-green-50' : 'bg-amber-50'}`}>
                    {wasDiscussed && discussionDate ? (
                      <p className="text-green-700">
                        This feedback has been discussed with the student on {formatDate(discussionDate)}.
                      </p>
                    ) : wasDiscussed ? (
                      <p className="text-green-700">
                        This feedback has been discussed with the student.
                      </p>
                    ) : (
                      <p className="text-amber-700">
                        This feedback has not been discussed with the student.
                      </p>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
          
          {/* Confirmation */}
          <div className="pt-6 border-t">
            <div className="flex items-center space-x-2 mb-6">
              <Checkbox 
                id="confirmation" 
                checked={confirmed} 
                onCheckedChange={handleConfirmChange}
              />
              <Label 
                htmlFor="confirmation" 
                className="text-sm"
              >
                I have reviewed the student's details above and confirm I am reviewing the feedback and determining the ANSAT scoring for the correct student.
              </Label>
            </div>
            
            {confirmed && (
              <Button onClick={handleNextClick} className="mt-4">
                {feedbackData.is_marked ? "Review Feedback" : "Create Feedback"}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
