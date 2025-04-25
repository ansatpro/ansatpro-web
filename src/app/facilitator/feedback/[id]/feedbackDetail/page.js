"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  ChevronDown,
  ChevronLeft
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import DuplicateContentDetector from "@/components/DuplicateContentDetector";
import { format } from "date-fns";

export default function FeedbackDetail() {
  const router = useRouter();
  const params = useParams();
  const feedbackId = params?.id || "unknown";
  
  // State management
  const [loading, setLoading] = useState(true);
  const [feedbackData, setFeedbackData] = useState(null);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
  
  // Fetch feedback data
  useEffect(() => {
    const fetchFeedbackData = async () => {
      try {
        console.log("Fetching feedback data for ID:", feedbackId);
        
        // First try to get current feedback data from localStorage
        const storedCurrentFeedback = localStorage.getItem('ansatpro_current_feedback');
        
        if (storedCurrentFeedback) {
          try {
            const currentFeedback = JSON.parse(storedCurrentFeedback);
            console.log("Found current feedback:", currentFeedback);
            
            // Check if ID matches
            if (currentFeedback.id === feedbackId) {
              console.log("Using current feedback data");
              
              // Check if the feedback has been discussed with the student
              const discussionStatus = currentFeedback.reviewData?.discussedWithStudent === "yes"
                ? `This feedback has been discussed with the student, discussion date: ${
                    currentFeedback.reviewData?.discussionDate || currentFeedback.date || "Unknown date"
                  }`
                : "This feedback has not been discussed with the student";
              
              setFeedbackData({
                id: currentFeedback.id,
                date: currentFeedback.date || "No date available",
                studentName: currentFeedback.studentName || "Unknown Student",
                originalFeedback: currentFeedback.content || "No feedback content available",
                mappedItems: currentFeedback.aiFeedbackDescriptions ? 
                  currentFeedback.aiFeedbackDescriptions.map(item => ({
                    text: item.description || "No description",
                    status: item.is_positive ? "strength" : "improvement"
                  })) : 
                  [
                    { text: "clinical skills", status: "strength" },
                    { text: "documentation", status: "improvement" }
                  ],
                assessmentItems: currentFeedback.reviewData?.ratedItems?.map(item => 
                  `${item.itemId}: ${item.rating}`
                ) || ["No assessment items available"],
                comments: currentFeedback.reviewData?.comment || "No comments provided",
                discussionStatus: discussionStatus
              });
              
              setLoading(false);
              return;
            } else {
              console.log("Current feedback ID doesn't match:", currentFeedback.id, feedbackId);
            }
          } catch (error) {
            console.error("Error parsing current feedback:", error);
          }
        } else {
          console.log("No current feedback found in localStorage");
        }
        
        // If current feedback doesn't exist or ID doesn't match, search in feedback list
        const storedFeedbacks = localStorage.getItem('ansatpro_feedbacks');
        
        if (storedFeedbacks) {
          try {
            const feedbacks = JSON.parse(storedFeedbacks);
            const feedback = feedbacks.find(f => f.id === feedbackId);
            
            if (feedback) {
              console.log("Found feedback in list:", feedback);
              
              // Check if the feedback has been discussed with the student
              const discussionStatus = feedback.reviewData?.discussedWithStudent === "yes"
                ? `This feedback has been discussed with the student, discussion date: ${
                    feedback.reviewData?.discussionDate || feedback.date || "Unknown date"
                  }`
                : "This feedback has not been discussed with the student";
              
              setFeedbackData({
                id: feedback.id,
                date: feedback.date || "No date available",
                studentName: feedback.studentName || "Unknown Student",
                originalFeedback: feedback.content || "No feedback content available",
                mappedItems: feedback.aiFeedbackDescriptions ? 
                  feedback.aiFeedbackDescriptions.map(item => ({
                    text: item.description || "No description",
                    status: item.is_positive ? "strength" : "improvement"
                  })) : 
                  [
                    { text: "clinical skills", status: "strength" },
                    { text: "documentation", status: "improvement" }
                  ],
                assessmentItems: feedback.reviewData?.ratedItems?.map(item => 
                  `${item.itemId}: ${item.rating}`
                ) || ["No assessment items available"],
                comments: feedback.reviewData?.comment || "No comments provided",
                discussionStatus: discussionStatus
              });
              
              setLoading(false);
              return;
            } else {
              console.log("Feedback not found in list for ID:", feedbackId);
            }
          } catch (error) {
            console.error("Error parsing feedbacks list:", error);
          }
        } else {
          console.log("No feedbacks found in localStorage");
        }
        
        // If not found in localStorage, use fallback data
        console.log("Using fallback data");
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setFeedbackData({
          id: feedbackId,
          date: "2023-05-15 14:30",
          studentName: "John Smith",
          originalFeedback: "Student showed good clinical reasoning but needs to improve documentation.",
          mappedItems: [
            { text: "clinical reasoning", status: "strength" },
            { text: "documentation", status: "improvement" }
          ],
          assessmentItems: ["Item 1: 4", "Item 2: 3", "Item 3: 5"],
          comments: "Student is showing good progress in clinical skills but needs to work on documentation and time management.",
          discussionStatus: "This feedback has not been discussed with the student"
        });
        
      } catch (error) {
        console.error("Error fetching feedback data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeedbackData();
  }, [feedbackId]);
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <DuplicateContentDetector />
      
      {/* Back navigation */}
      <div className="mb-4">
        <Button 
          variant="ghost" 
          className="p-0 hover:bg-transparent flex items-center" 
          onClick={() => router.push('/facilitator/feedback')}
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="ml-1">Back to Feedback List</span>
        </Button>
      </div>
      
      {/* Page title */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Feedback Detail</h1>
        <p className="text-muted-foreground mt-2">
          Review for {feedbackData.studentName}
        </p>
      </header>

      {/* Student information card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Student Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Date and Time</p>
              <p className="font-medium">{feedbackData.date}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Student Name</p>
              <p className="font-medium">{feedbackData.studentName}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Original feedback */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Original Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            "{feedbackData.originalFeedback}"
          </p>
        </CardContent>
      </Card>
      
      {/* Assessment section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mapped items */}
          <div className="space-y-3">
            <h3 className="text-md font-medium">Items</h3>
            <ul className="space-y-2">
              {feedbackData.mappedItems.map((item, index) => (
                <li key={index} className="flex items-center gap-2 border rounded-md p-3">
                  <div className={`h-2 w-2 rounded-full ${item.status === 'strength' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                  <span>{item.text} - {item.status === 'strength' ? 'Strength' : 'Area for improvement'}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Assessment items */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="text-md font-medium">Marks</h3>
            <div className="space-y-2">
              {feedbackData.assessmentItems.map((item, index) => (
                <div key={index} className="border rounded-md p-3">
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Comments section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {feedbackData.comments}
          </p>
        </CardContent>
      </Card>
      
      {/* Student discussion section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Student Discussion</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`${feedbackData.discussionStatus.includes("not") ? "text-amber-600" : "text-green-600"}`}>
            {feedbackData.discussionStatus}
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 