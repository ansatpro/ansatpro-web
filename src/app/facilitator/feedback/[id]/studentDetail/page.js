"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import DuplicateContentDetector from "@/components/DuplicateContentDetector";

export default function StudentDetail() {
  const router = useRouter();
  const params = useParams();
  const feedbackId = params.id;
  
  const [confirmed, setConfirmed] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackData, setFeedbackData] = useState(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportType, setExportType] = useState('');
  const [exportLoading, setExportLoading] = useState({
    'aiSummary': false,
    'Preceptor Feedback': false,
    'Facilitator Review': false
  });

  // Sample feedback data (fallback)
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
          try {
            const currentFeedback = JSON.parse(storedCurrentFeedback);
            
            // Check if this is the feedback we need
            if (currentFeedback && currentFeedback.id === feedbackId) {
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
          } catch (parseError) {
            console.error("Error parsing current feedback:", parseError);
          }
        }
        
        // If current feedback not found, try to get from all feedbacks list
        const storedFeedbacks = localStorage.getItem('ansatpro_feedbacks');
        
        if (storedFeedbacks) {
          try {
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
          } catch (parseError) {
            console.error("Error parsing feedbacks list:", parseError);
          }
        }
        
        // If no data in localStorage, fall back to sample data
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
      try {
        // Add logging for debugging
        console.log("Navigating to next page, feedbackId:", feedbackId);
        console.log("Feedback is_marked:", feedbackData.is_marked);
        
        // Determine next step based on feedback mark status
        if (feedbackData.is_marked) {
          // Marked, go to review page
          const reviewUrl = `/facilitator/feedback/${feedbackId}/studentDetail/reviewFeedback`;
          console.log("Navigating to review page:", reviewUrl);
          router.push(reviewUrl);
        } else {
          // Unmarked, go to create page
          const createUrl = `/facilitator/feedback/${feedbackId}/studentDetail/createFeedback`;
          console.log("Navigating to create page:", createUrl);
          
          // Use replace instead of push to avoid history stack issues
          router.replace(createUrl);
        }
      } catch (error) {
        console.error("Navigation error:", error);
        alert("There was an error navigating to the next page. Please try again.");
      }
    }
  };

  // Format date display
  const formatDate = (dateString) => {
    try {
      if (!dateString) return "N/A";
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString || "N/A";
    }
  };

  // New functions for export functionality
  const handleGenerateAISummary = () => {
    setExportLoading(prev => ({ ...prev, aiSummary: true }));
    
    // Simulate AI summary generation
    setTimeout(() => {
      // Create a temporary text file with AI summary
      const summaryText = `AI Summary for ${selectedStudent.name}
Student ID: ${selectedStudent.studentId}
University: ${selectedStudent.university}
Health Service: ${selectedStudent.healthService}
Clinic Area: ${selectedStudent.clinicArea}

This is a simulated AI summary of the student's feedback. In a production environment, 
this would contain an actual AI-generated analysis of the student's performance based on 
their feedback data and assessments.

Generated on: ${new Date().toLocaleDateString()}`;
      
      // Create a blob and download link
      const blob = new Blob([summaryText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedStudent.name.replace(/\s+/g, '_')}_AI_Summary.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setExportLoading(prev => ({ ...prev, aiSummary: false }));
    }, 2000);
  };

  const handleExport = (type) => {
    setExportType(type);
    setShowExportDialog(true);
  };

  const confirmExport = () => {
    setExportLoading(prev => ({ ...prev, [exportType]: true }));
    setShowExportDialog(false);
    
    // Simulate PDF generation and download
    setTimeout(() => {
      alert(`${exportType} for ${selectedStudent.name} has been generated. In a production environment, this would download a PDF file.`);
      setExportLoading(prev => ({ ...prev, [exportType]: false }));
    }, 2000);
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
    <div className="space-y-8">
      <DuplicateContentDetector />
      {/* Header with back button */}
      <header className="mb-8">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            className="mr-4 p-0 hover:bg-transparent" 
            onClick={() => router.push('/facilitator/feedback')}
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="ml-1">Back to Feedback</span>
          </Button>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Student Details</h1>
        </div>
        
        <p className="text-lg text-muted-foreground mb-6">
          View the student's feedback: <span className="font-medium">{feedbackData.is_marked ? "Marked" : "Unmarked"}</span>
        </p>
      </header>
      
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
      
      {/* Confirmation */}
      <div className="pt-6 border-t max-w-3xl">
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
      
      {/* Export confirmation dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export {exportType}</DialogTitle>
            <DialogDescription>
              You are about to export {exportType} for {selectedStudent?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-2">Export Details:</p>
            <ul className="space-y-1 mb-4">
              <li className="flex items-start">
                <span className="font-medium mr-2">Student:</span> 
                <span>{selectedStudent?.name}</span>
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
