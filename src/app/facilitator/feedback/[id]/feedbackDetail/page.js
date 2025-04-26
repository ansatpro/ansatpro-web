"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function FeedbackDetail() {
  const router = useRouter();
  const params = useParams();
  const feedbackId = params?.id || "unknown";
  
  // State management
  const [loading, setLoading] = useState(true);
  const [feedbackData, setFeedbackData] = useState(null);
  const [error, setError] = useState("");
  
  // Fetch feedback data
  useEffect(() => {
    const fetchFeedbackData = async () => {
      try {
        setLoading(true);
        
        // First try to get current feedback data from localStorage
        const storedCurrentFeedback = localStorage.getItem('ansatpro_current_feedback');
        
        if (storedCurrentFeedback) {
          try {
            const currentFeedback = JSON.parse(storedCurrentFeedback);
            
            // Check if ID matches
            if (currentFeedback.id === feedbackId) {
              setFeedbackData({
                id: currentFeedback.id,
                date: currentFeedback.date || "Unknown date",
                studentName: currentFeedback.studentName || "Unknown Student",
                originalFeedback: currentFeedback.content || "No feedback content available",
                is_marked: !!currentFeedback.is_marked,
                reviewComment: currentFeedback.reviewComment || "",
                reviewScore: currentFeedback.reviewScore || [],
                discussedWithStudent: currentFeedback.discussedWithStudent || false,
                discussionDate: currentFeedback.discussionDate || "",
                aiFeedbackItems: currentFeedback.aiFeedbackDescriptions || []
              });
              
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error("Error parsing current feedback:", e);
          }
        }
        
        // If current feedback doesn't exist or ID doesn't match, search in feedback list
        const storedFeedbacks = localStorage.getItem('ansatpro_feedbacks');
        
        if (storedFeedbacks) {
          try {
            const feedbacks = JSON.parse(storedFeedbacks);
            const feedback = feedbacks.find(f => f.id === feedbackId);
            
            if (feedback) {
              setFeedbackData({
                id: feedback.id,
                date: feedback.date || "Unknown date",
                studentName: feedback.studentName || "Unknown Student",
                originalFeedback: feedback.content || "No feedback content available",
                is_marked: !!feedback.is_marked,
                reviewComment: feedback.reviewComment || "",
                reviewScore: feedback.reviewScore || [],
                discussedWithStudent: feedback.discussedWithStudent || false,
                discussionDate: feedback.discussionDate || "",
                aiFeedbackItems: feedback.aiFeedbackDescriptions || []
              });
              
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error("Error parsing feedback list:", e);
          }
        }
        
        // If not found in localStorage, use fallback data
        setError("Feedback data not found. Using fallback data.");
        console.warn("Feedback data not found. Using fallback data.");
        
        setFeedbackData({
          id: feedbackId,
          date: "Unknown date",
          studentName: "Unknown Student",
          originalFeedback: "No feedback content available",
          is_marked: false,
          reviewComment: "",
          reviewScore: [],
          discussedWithStudent: false,
          discussionDate: "",
          aiFeedbackItems: []
        });
        
      } catch (error) {
        console.error("Error fetching feedback data:", error);
        setError("Error loading feedback data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeedbackData();
  }, [feedbackId]);
  
  // Navigate back to feedback page
  const handleBackClick = () => {
    router.push("/facilitator/feedback");
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return dateString;
    }
  };

  // Get the rating label based on score
  const getRatingLabel = (score) => {
    if (!score) return "Not Assessed";
    
    if (score === "N/A") return "Not Assessed";
    
    const scoreNum = parseInt(score);
    if (isNaN(scoreNum)) return score;
    
    switch (scoreNum) {
      case 1: return "1 - Does not meet expectations";
      case 2: return "2 - Below satisfactory standards";
      case 3: return "3 - Meets satisfactory standards";
      case 4: return "4 - Exceeds expectations";
      case 5: return "5 - Outstanding performance";
      default: return score;
    }
  };
  
  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading feedback data...</p>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      {/* Page title with back button */}
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
          <h1 className="text-3xl font-bold">Feedback Detail</h1>
        </div>
      </header>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      {/* Student information card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Student Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Date and Time</p>
              <p className="font-medium">{formatDate(feedbackData.date)}</p>
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
          <div className="p-4 border rounded-md">
            <p className="text-muted-foreground">
              {feedbackData.originalFeedback}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Assessment Comments */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-md">
            {feedbackData.reviewComment ? (
              <p>{feedbackData.reviewComment}</p>
            ) : (
              <p className="text-muted-foreground">No comments provided</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assessment Items and Marks */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Assessment Items</CardTitle>
        </CardHeader>
        <CardContent>
          {(feedbackData.reviewScore && feedbackData.reviewScore.length > 0) || 
           (feedbackData.aiFeedbackItems && feedbackData.aiFeedbackItems.length > 0) ? (
            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-100 p-3 border-b">
                <div className="col-span-2 font-medium">Item ID</div>
                <div className="col-span-6 font-medium">Description</div>
                <div className="col-span-2 font-medium">Type</div>
                <div className="col-span-2 font-medium">Rating</div>
              </div>
              <div className="divide-y">
                {/* AI identified items */}
                {feedbackData.aiFeedbackItems && feedbackData.aiFeedbackItems.map((item, index) => {
                  // Find if there's a corresponding rating for this AI item
                  const matchingRating = feedbackData.reviewScore?.find(
                    scoreItem => scoreItem.item_id === item.item_id
                  );
                  
                  return (
                    <div key={`ai-${index}`} className="grid grid-cols-12 p-3">
                      <div className="col-span-2">{item.item_id || `AI-${index + 1}`}</div>
                      <div className="col-span-6">{item.description || "No description available"}</div>
                      <div className="col-span-2">
                        <span className={item.is_positive ? "text-green-600" : "text-amber-600"}>
                          {item.is_positive ? "Strength" : "Improvement"}
                        </span>
                      </div>
                      <div className="col-span-2">
                        {matchingRating ? getRatingLabel(matchingRating.score) : "-"}
                      </div>
                    </div>
                  );
                })}
                
                {/* Any remaining manual assessment items that don't match AI items */}
                {feedbackData.reviewScore && feedbackData.reviewScore
                  .filter(scoreItem => !feedbackData.aiFeedbackItems?.some(
                    aiItem => aiItem.item_id === scoreItem.item_id
                  ))
                  .map((item, index) => (
                    <div key={`score-${index}`} className="grid grid-cols-12 p-3">
                      <div className="col-span-2">{item.item_id || `M-${index + 1}`}</div>
                      <div className="col-span-6">-</div>
                      <div className="col-span-2">-</div>
                      <div className="col-span-2">
                        {getRatingLabel(item.score)}
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          ) : (
            <div className="p-4 border rounded-md">
              <p className="text-muted-foreground">No assessment items available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student discussion section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Student Discussion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`p-4 border rounded-md ${feedbackData.discussedWithStudent ? 'bg-green-50' : 'bg-amber-50'}`}>
            {feedbackData.discussedWithStudent ? (
              <p className="text-green-700">
                This feedback has been discussed with the student on {formatDate(feedbackData.discussionDate)}.
              </p>
            ) : (
              <p className="text-amber-700">
                This feedback has not been discussed with the student.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Back button at bottom */}
      <div className="mt-8 flex justify-start">
        <Button 
          variant="outline"
          onClick={handleBackClick}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Feedback List
        </Button>
      </div>
    </div>
  );
} 