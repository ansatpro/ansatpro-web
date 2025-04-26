"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  ChevronDown
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AssessmentForm() {
  const router = useRouter();
  const params = useParams();
  const feedbackId = params?.id || "unknown";
  
  // State management
  const [comment, setComment] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemRatings, setItemRatings] = useState({});
  const [discussedWithStudent, setDiscussedWithStudent] = useState(null);
  const [discussionDate, setDiscussionDate] = useState("");
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedbackData, setFeedbackData] = useState(null);
  
  // Assessment items
  const assessmentItems = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    title: `Assessment Item ${i + 1}`,
    description: `Description for assessment item ${i + 1}`
  }));
  
  // Fetch feedback data
  useEffect(() => {
    const fetchFeedbackData = async () => {
      try {
        // First try to get current feedback data from localStorage
        const storedCurrentFeedback = localStorage.getItem('current_feedback');
        
        if (storedCurrentFeedback) {
          const currentFeedback = JSON.parse(storedCurrentFeedback);
          
          // Check if ID matches
          if (currentFeedback.id === feedbackId) {
            setFeedbackData({
              id: currentFeedback.id,
              date: currentFeedback.date,
              studentName: currentFeedback.studentName || "Unknown Student",
              originalFeedback: currentFeedback.content || "No feedback content available",
              mappedItems: [
                { text: "clinical skills", status: "strength" },
                { text: "documentation", status: "improvement" }
              ]
            });
            
            setLoading(false);
            return;
          }
        }
        
        // If current feedback doesn't exist or ID doesn't match, search in feedback list
        const storedFeedbacks = localStorage.getItem('feedbacks');
        
        if (storedFeedbacks) {
          const feedbacks = JSON.parse(storedFeedbacks);
          const feedback = feedbacks.find(f => f.id === feedbackId);
          
          if (feedback) {
            setFeedbackData({
              id: feedback.id,
              date: feedback.date,
              studentName: feedback.studentName || "Unknown Student",
              originalFeedback: feedback.content || "No feedback content available",
              mappedItems: [
                { text: "clinical skills", status: "strength" },
                { text: "documentation", status: "improvement" }
              ]
            });
            
            setLoading(false);
            return;
          }
        }
        
        // If not found in localStorage, use fallback data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setFeedbackData({
          id: feedbackId,
          date: "2023-05-15 14:30",
          studentName: "John Smith",
          originalFeedback: "Student showed good clinical reasoning but needs to improve documentation.",
          mappedItems: [
            { text: "clinical reasoning", status: "strength" },
            { text: "documentation", status: "improvement" }
          ]
        });
        
      } catch (error) {
        console.error("Error fetching feedback data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeedbackData();
  }, [feedbackId]);
  
  // Handle item selection
  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        // If unchecked, also remove the rating
        const newRatings = { ...itemRatings };
        delete newRatings[itemId];
        setItemRatings(newRatings);
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };
  
  // Handle rating selection
  const handleRatingSelect = (itemId, rating) => {
    setItemRatings(prev => ({
      ...prev,
      [itemId]: rating
    }));
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Validate that all selected items have ratings
    const allItemsRated = selectedItems.every(itemId => itemRatings[itemId]);
    
    if (!allItemsRated) {
      alert("Please rate all selected assessment items");
      return;
    }
    
    if (discussedWithStudent === "yes" && !discussionDate) {
      alert("Please enter a discussion date");
      return;
    }
    
    // Build submission data
    const submissionData = {
      feedbackId,
      selectedItems: selectedItems.map(itemId => ({
        itemId,
        rating: itemRatings[itemId]
      })),
      comment,
      discussedWithStudent,
      discussionDate: discussedWithStudent === "yes" ? discussionDate : null
    };
    
    console.log("Submission data:", submissionData);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update feedback status to marked in localStorage
      const storedFeedbacks = localStorage.getItem('feedbacks');
      
      if (storedFeedbacks) {
        const feedbacks = JSON.parse(storedFeedbacks);
        const updatedFeedbacks = feedbacks.map(f => {
          if (f.id === feedbackId) {
            return {
              ...f,
              is_marked: true,
              reviewData: submissionData
            };
          }
          return f;
        });
        
        localStorage.setItem('feedbacks', JSON.stringify(updatedFeedbacks));
      }
      
      // Also update current feedback if it exists
      const storedCurrentFeedback = localStorage.getItem('current_feedback');
      
      if (storedCurrentFeedback) {
        const currentFeedback = JSON.parse(storedCurrentFeedback);
        
        if (currentFeedback.id === feedbackId) {
          const updatedCurrentFeedback = {
            ...currentFeedback,
            is_marked: true,
            reviewData: submissionData
          };
          
          localStorage.setItem('current_feedback', JSON.stringify(updatedCurrentFeedback));
        }
      }
      
      alert("Assessment submitted successfully");
      router.push("/facilitator/feedback");
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Submission failed, please try again");
    }
  };
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Main content area */}
      <main className="flex-1 p-6">
        {/* Page title */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Feedback Detail</h1>
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
        
        {/* Mapped items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Mapped Items</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedbackData.mappedItems.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${item.status === 'strength' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                  <span className="font-medium">"{item.text}":</span>
                  <span>{item.status === 'strength' ? 'Strength' : 'Area for improvement'}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        {/* Assessment section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Rating description */}
            <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
              <p>1 = Does not meet expectations</p>
              <p>2 = Below satisfactory standards</p>
              <p>3 = Meets satisfactory standards</p>
              <p>4 = Exceeds expectations</p>
              <p>5 = Outstanding performance</p>
              <p>N/A = Not assessed</p>
              <p className="font-bold mt-2">*Note: Ratings of 1 or 2 require additional feedback</p>
            </div>
            
            {/* Assessment items selection */}
            <Collapsible
              open={isCollapsibleOpen}
              onOpenChange={setIsCollapsibleOpen}
              className="border rounded-md"
            >
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                  <span>
                    Assessment Items ({selectedItems.length > 0 ? `${selectedItems.length} selected` : `${assessmentItems.length} items`})
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isCollapsibleOpen ? "transform rotate-180" : ""}`} />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 border-t">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Select</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Rating</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assessmentItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Checkbox 
                              id={`item-${item.id}`} 
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={() => handleItemSelect(item.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <Label 
                              htmlFor={`item-${item.id}`}
                              className="cursor-pointer font-medium"
                            >
                              {item.title}
                              <p className="text-sm text-muted-foreground font-normal mt-1">{item.description}</p>
                            </Label>
                          </TableCell>
                          <TableCell>
                            {selectedItems.includes(item.id) && (
                              <div className="flex flex-wrap gap-2">
                                {[1, 2, 3, 4, 5, 'N/A'].map((rating) => (
                                  <Button
                                    key={rating}
                                    variant={itemRatings[item.id] === rating ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleRatingSelect(item.id, rating)}
                                  >
                                    {rating}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
        
        {/* Comments section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter your assessment comments here"
              className="min-h-[120px]"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="text-right text-sm text-muted-foreground mt-2">
              Character count: {comment.length}
            </div>
          </CardContent>
        </Card>
        
        {/* Student discussion section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Student Discussion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Has this assessment been discussed with the student?</p>
            
            <RadioGroup
              value={discussedWithStudent}
              onValueChange={setDiscussedWithStudent}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="discussed-yes" />
                <Label htmlFor="discussed-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="discussed-no" />
                <Label htmlFor="discussed-no">No</Label>
              </div>
            </RadioGroup>
            
            {discussedWithStudent === "yes" && (
              <div className="pt-2">
                <Label htmlFor="discussion-date" className="block mb-2">Discussion Date (YYYY-MM-DD)</Label>
                <Input
                  id="discussion-date"
                  type="text"
                  placeholder="e.g., 2023-05-15"
                  value={discussionDate}
                  onChange={(e) => setDiscussionDate(e.target.value)}
                  pattern="\d{4}-\d{2}-\d{2}"
                  className="w-full max-w-xs"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 