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
              // Extract data directly with correct field names
              setFeedbackData({
                id: currentFeedback.id,
                date: currentFeedback.date || "Unknown date",
                studentName: currentFeedback.studentName || "Unknown Student",
                originalFeedback: currentFeedback.content || "No feedback content available",
                is_marked: !!currentFeedback.is_marked,
                reviewComment: currentFeedback.reviewComment || "",
                reviewScore: currentFeedback.reviewScore || [],
                preceptor: currentFeedback.preceptor || "Unknown Preceptor",
                university: currentFeedback.university || "Unknown University",
                healthService: currentFeedback.healthService || "Unknown Health Service",
                clinicArea: currentFeedback.clinicArea || "Unknown Clinic Area",
                startDate: currentFeedback.startDate || "Unknown Start Date",
                endDate: currentFeedback.endDate || "Unknown End Date",
                flag_discussed_with_student: (() => {
                  // 确保从各种可能的位置和格式正确获取讨论状态
                  if (currentFeedback.flag_discussed_with_student !== undefined) {
                    return currentFeedback.flag_discussed_with_student;
                  }
                  if (currentFeedback.reviewData?.discussedWithStudent !== undefined) {
                    return currentFeedback.reviewData.discussedWithStudent === "yes";
                  }
                  return false;
                })(),
                discussion_date: (() => {
                  // 确保从各种可能的位置正确获取讨论日期
                  if (currentFeedback.discussion_date) {
                    return currentFeedback.discussion_date;
                  }
                  if (currentFeedback.reviewData?.discussionDate) {
                    return currentFeedback.reviewData.discussionDate;
                  }
                  return "";
                })(),
                // 直接从 currentFeedback 获取 preceptor 讨论相关的字段
                preceptor_flag_discussed_with_student: currentFeedback.preceptor_flag_discussed_with_student,
                preceptor_discussion_date: currentFeedback.preceptor_discussion_date,
                aiFeedbackItems: currentFeedback.aiFeedbackDescriptions || []
              });
              
              // Get all available items from both sources
              console.log("Loaded feedback data from current_feedback localStorage:", {
                preceptor_flag_discussed_with_student: currentFeedback.preceptor_flag_discussed_with_student,
                preceptor_discussion_date: currentFeedback.preceptor_discussion_date
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
              // Extract data directly with correct field names
              setFeedbackData({
                id: feedback.id,
                date: feedback.date || "Unknown date",
                studentName: feedback.studentName || "Unknown Student",
                originalFeedback: feedback.content || "No feedback content available",
                is_marked: !!feedback.is_marked,
                reviewComment: feedback.reviewComment || "",
                reviewScore: feedback.reviewScore || [],
                preceptor: feedback.preceptor || "Unknown Preceptor",
                university: feedback.university || "Unknown University",
                healthService: feedback.healthService || "Unknown Health Service",
                clinicArea: feedback.clinicArea || "Unknown Clinic Area",
                startDate: feedback.startDate || "Unknown Start Date",
                endDate: feedback.endDate || "Unknown End Date",
                flag_discussed_with_student: (() => {
                  // 确保从各种可能的位置和格式正确获取讨论状态
                  if (feedback.flag_discussed_with_student !== undefined) {
                    return feedback.flag_discussed_with_student;
                  }
                  if (feedback.reviewData?.discussedWithStudent !== undefined) {
                    return feedback.reviewData.discussedWithStudent === "yes";
                  }
                  return false;
                })(),
                discussion_date: (() => {
                  // 确保从各种可能的位置正确获取讨论日期
                  if (feedback.discussion_date) {
                    return feedback.discussion_date;
                  }
                  if (feedback.reviewData?.discussionDate) {
                    return feedback.reviewData.discussionDate;
                  }
                  return "";
                })(),
                // 从 feedback 列表中获取 preceptor 讨论相关字段
                preceptor_flag_discussed_with_student: feedback.preceptor_flag_discussed_with_student,
                preceptor_discussion_date: feedback.preceptor_discussion_date,
                aiFeedbackItems: feedback.aiFeedbackDescriptions || []
              });
              
              console.log("Loaded feedback data from feedbacks list localStorage:", {
                preceptor_flag_discussed_with_student: feedback.preceptor_flag_discussed_with_student,
                preceptor_discussion_date: feedback.preceptor_discussion_date
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
          preceptor: "Unknown Preceptor",
          university: "Unknown University",
          healthService: "Unknown Health Service",
          clinicArea: "Unknown Clinic Area",
          startDate: "Unknown Start Date",
          endDate: "Unknown End Date",
          flag_discussed_with_student: false,
          discussion_date: "",
          preceptor_flag_discussed_with_student: false,
          preceptor_discussion_date: "",
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
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); 
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
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

      {/* Single card containing all information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Feedback Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Student Information Section */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Date and Time</p>
                <p className="font-medium">{formatDate(feedbackData.date)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Student Name</p>
                <p className="font-medium">{feedbackData.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Preceptor</p>
                <p className="font-medium">{feedbackData.preceptor}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">University</p>
                <p className="font-medium">{feedbackData.university}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Health Service</p>
                <p className="font-medium">{feedbackData.healthService}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clinic Area</p>
                <p className="font-medium">{feedbackData.clinicArea}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">{formatDate(feedbackData.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-medium">{formatDate(feedbackData.endDate)}</p>
              </div>
            </div>
          </div>
          
          {/* Original Feedback Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">Preceptor Feedback</h3>
            <div className="p-4 border rounded-md mb-6">
              <p className="text-muted-foreground">
                {feedbackData.originalFeedback}
              </p>
            </div>
          </div>

          {/* Student Discussion (Preceptor) Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">Student Discussion (Preceptor)</h3>
            <div>
              {console.log("Debug discussion data:", {
                preceptor_flag_discussed_with_student: feedbackData.preceptor_flag_discussed_with_student,
                preceptor_discussion_date: feedbackData.preceptor_discussion_date
              })}
              {(() => {
                // 明确检查数据类型和值
                const wasDiscussed = 
                  feedbackData.preceptor_flag_discussed_with_student === true || 
                  feedbackData.preceptor_flag_discussed_with_student === "true" || 
                  feedbackData.preceptor_flag_discussed_with_student === "yes";
                
                const discussionDate = feedbackData.preceptor_discussion_date;
                
                return (
                  <div className={`p-4 border rounded-md mb-6 ${wasDiscussed ? 'bg-green-50' : 'bg-amber-50'}`}>
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
            </div>
          </div>
          
          {/* Assessment Comments Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">Facilitator Review</h3>
            <div className="p-4 border rounded-md mb-6">
              {feedbackData.reviewComment ? (
                <p>{feedbackData.reviewComment}</p>
              ) : (
                <p className="text-muted-foreground">No comments provided</p>
              )}
            </div>
          </div>

          {/* Assessment Items and Marks Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">Assessment Items</h3>
            {(() => {
              // Combine AI items and review scores for comprehensive item listing
              const allItems = new Map();
              
              // Add AI feedback items to the map
              if (feedbackData.aiFeedbackItems && feedbackData.aiFeedbackItems.length > 0) {
                feedbackData.aiFeedbackItems.forEach(item => {
                  allItems.set(item.item_id, {
                    itemId: item.item_id,
                    description: item.description || "",
                    isPositive: item.is_positive,
                    rating: null
                  });
                });
              }
              
              // Add or update with review scores
              if (feedbackData.reviewScore && feedbackData.reviewScore.length > 0) {
                feedbackData.reviewScore.forEach(item => {
                  if (allItems.has(item.item_id)) {
                    // Update existing item with rating
                    const existingItem = allItems.get(item.item_id);
                    existingItem.rating = item.score;
                    allItems.set(item.item_id, existingItem);
                  } else {
                    // Add new item with just the rating
                    allItems.set(item.item_id, {
                      itemId: item.item_id,
                      description: "",
                      isPositive: null,
                      rating: item.score
                    });
                  }
                });
              }
              
              // Convert map to array for rendering
              const combinedItems = Array.from(allItems.values());
              
              if (combinedItems.length === 0) {
                return (
                  <div className="p-4 border rounded-md mb-6">
                    <p className="text-muted-foreground">No assessment items available</p>
                  </div>
                );
              }
              
              return (
                <div className="border rounded-md overflow-hidden mb-6">
                  <div className="grid grid-cols-12 bg-gray-100 p-3 border-b">
                    <div className="col-span-2 font-medium">Item ID</div>
                    <div className="col-span-6 font-medium">Description</div>
                    <div className="col-span-2 font-medium">Type</div>
                    <div className="col-span-2 font-medium">Rating</div>
                  </div>
                  <div className="divide-y">
                    {combinedItems.map((item, index) => (
                      <div key={`item-${index}`} className="grid grid-cols-12 p-3">
                        <div className="col-span-2">{item.itemId || `Item-${index + 1}`}</div>
                        <div className="col-span-6">{item.description || "-"}</div>
                        <div className="col-span-2">
                          {item.isPositive !== null ? (
                            <span className={item.isPositive ? "text-green-600" : "text-amber-600"}>
                              {item.isPositive ? "Strength" : "Improvement"}
                            </span>
                          ) : (
                            "-"
                          )}
                        </div>
                        <div className="col-span-2">
                          {item.rating ? getRatingLabel(item.rating) : "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Student Discussion (Facilitator) Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">Student Discussion (Facilitator)</h3>
            <div>
              {console.log("Debug discussion data:", {
                flag_discussed_with_student: feedbackData.flag_discussed_with_student,
                discussion_date: feedbackData.discussion_date
              })}
              {(() => {
                // 明确检查数据类型和值
                const wasDiscussed = 
                  feedbackData.flag_discussed_with_student === true || 
                  feedbackData.flag_discussed_with_student === "true" || 
                  feedbackData.flag_discussed_with_student === "yes";
                
                const discussionDate = feedbackData.discussion_date;
                
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
            </div>
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