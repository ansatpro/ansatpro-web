"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Checkbox,
  CheckboxItem
} from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Home, 
  MessageSquareText, 
  Settings, 
  Users, 
  Download, 
  Bell, 
  LogOut,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function ReviewFeedback() {
  const router = useRouter();
  const params = useParams();
  const feedbackId = params.id;
  
  // State management
  const [comment, setComment] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemRatings, setItemRatings] = useState({});
  const [discussedWithStudent, setDiscussedWithStudent] = useState(null);
  const [discussionDate, setDiscussionDate] = useState(null);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedbackData, setFeedbackData] = useState(null);
  
  // ANSAT assessment items
  const ansatItems = Array.from({ length: 23 }, (_, i) => ({
    id: i + 1,
    title: `ANSAT Assessment Item ${i + 1}`,
    description: `Description for ANSAT assessment item ${i + 1}`
  }));
  
  // Fetch feedback data
  useEffect(() => {
    const fetchFeedbackData = async () => {
      try {
        // First try to get current feedback data from localStorage
        const storedCurrentFeedback = localStorage.getItem('ansatpro_current_feedback');
        
        if (storedCurrentFeedback) {
          const currentFeedback = JSON.parse(storedCurrentFeedback);
          
          // Check if ID matches
          if (currentFeedback.id === feedbackId) {
            console.log("Using feedback data from localStorage (current feedback)");
            
            setFeedbackData({
              id: currentFeedback.id,
              date: currentFeedback.date,
              studentName: currentFeedback.studentName,
              originalFeedback: currentFeedback.content,
              mappedAnsatItems: [
                // Example mapped items
                { text: "clinical skills", status: "strength" },
                { text: "documentation", status: "improvement" }
              ]
            });
            
            setLoading(false);
            return;
          }
        }
        
        // If current feedback doesn't exist or ID doesn't match, search in feedback list
        const storedFeedbacks = localStorage.getItem('ansatpro_feedbacks');
        
        if (storedFeedbacks) {
          const feedbacks = JSON.parse(storedFeedbacks);
          const feedback = feedbacks.find(f => f.id === feedbackId);
          
          if (feedback) {
            console.log("Using feedback data from localStorage (feedbacks list)");
            
            setFeedbackData({
              id: feedback.id,
              date: feedback.date,
              studentName: feedback.studentName,
              originalFeedback: feedback.content,
              mappedAnsatItems: [
                // Example mapped items
                { text: "clinical skills", status: "strength" },
                { text: "documentation", status: "improvement" }
              ]
            });
            
            setLoading(false);
            return;
          }
        }
        
        // If not found in localStorage, use mock data
        console.log("Using fallback feedback data");
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setFeedbackData({
          id: feedbackId,
          date: "2020-02-05T19:32:00",
          studentName: "Joshua Davis",
          originalFeedback: "The student followed proper infection control procedures but needed guidance on sterile technique.",
          mappedAnsatItems: [
            { text: "infection control", status: "strength" },
            { text: "sterile technique", status: "improvement" }
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
  
  // Handle ANSAT item selection
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
  
  // Handle submission
  const handleSubmit = async () => {
    // Validate that all selected items have ratings
    const allItemsRated = selectedItems.every(itemId => itemRatings[itemId]);
    
    if (!allItemsRated) {
      alert("请为所有选中的ANSAT项目进行评分");
      return;
    }
    
    if (discussedWithStudent === "yes" && !discussionDate) {
      alert("请选择与学生讨论的日期");
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
    
    console.log("提交数据:", submissionData);
    
    // In a real application, this would call an API
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update feedback status to marked in localStorage
      const storedFeedbacks = localStorage.getItem('ansatpro_feedbacks');
      
      if (storedFeedbacks) {
        const feedbacks = JSON.parse(storedFeedbacks);
        const updatedFeedbacks = feedbacks.map(f => {
          if (f.id === feedbackId) {
            return {
              ...f,
              is_marked: true,
              ismarked: "Marked",
              reviewData: submissionData
            };
          }
          return f;
        });
        
        localStorage.setItem('ansatpro_feedbacks', JSON.stringify(updatedFeedbacks));
      }
      
      // Also update current feedback if it exists
      const storedCurrentFeedback = localStorage.getItem('ansatpro_current_feedback');
      
      if (storedCurrentFeedback) {
        const currentFeedback = JSON.parse(storedCurrentFeedback);
        
        if (currentFeedback.id === feedbackId) {
          const updatedCurrentFeedback = {
            ...currentFeedback,
            is_marked: true,
            ismarked: "Marked",
            reviewData: submissionData
          };
          
          localStorage.setItem('ansatpro_current_feedback', JSON.stringify(updatedCurrentFeedback));
        }
      }
      
      // 跳转到成功页面
      router.push(`/facilitator/feedback/${feedbackId}/studentDetail/createFeedback/success`);
    } catch (error) {
      console.error("提交失败:", error);
      alert("提交失败，请重试");
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
      {/* Sidebar navigation */}
      <aside className="w-64 border-r bg-muted/40 p-6 hidden md:block">
        <div className="mb-8">
          <h1 className="text-xl font-bold">ANSAT Pro</h1>
        </div>
        <nav className="space-y-2">
          <Link
            href="/facilitator/dashboard"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
          <Link
            href="/facilitator/student"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <Users className="mr-2 h-4 w-4" />
            Student
          </Link>
          <Link
            href="/facilitator/feedback"
            className="flex items-center rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground"
          >
            <MessageSquareText className="mr-2 h-4 w-4" />
            Feedback
          </Link>
          <Link
            href="/facilitator/report"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <Download className="mr-2 h-4 w-4" />
            Report
          </Link>
          <Link
            href="/facilitator/settings"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main content area */}
      <main className="flex-1 p-6">
        {/* Page title */}
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Review Feedback</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Button variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
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
                <p className="font-medium">
                  {format(new Date(feedbackData.date), "yyyy-MM-dd HH:mm")}
                </p>
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
        
        {/* Mapped ANSAT items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Mapped ANSAT Items</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedbackData.mappedAnsatItems.map((item, index) => (
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
              <p>1 = Does not perform expected behaviors and practices</p>
              <p>2 = Performs expected behaviors and practices below acceptable/satisfactory standard</p>
              <p>3 = Performs expected behaviors and practices at satisfactory/pass standard</p>
              <p>4 = Performs expected behaviors and practices at proficient standard</p>
              <p>5 = Performs expected behaviors and practices at excellent standard</p>
              <p>N/A = Not assessed</p>
              <p className="font-bold mt-2">*Note: Ratings of 1 or 2 indicate below standard performance</p>
            </div>
            
            {/* ANSAT item selection */}
            <Collapsible
              open={isCollapsibleOpen}
              onOpenChange={setIsCollapsibleOpen}
              className="border rounded-md"
            >
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                  <span>
                    ANSAT Items ({selectedItems.length > 0 ? `${selectedItems.length} selected` : "23 items"})
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isCollapsibleOpen ? "transform rotate-180" : ""}`} />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 border-t space-y-4">
                  {ansatItems.map((item) => (
                    <div key={item.id} className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id={`item-${item.id}`} 
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => handleItemSelect(item.id)}
                        />
                        <Label 
                          htmlFor={`item-${item.id}`}
                          className="cursor-pointer font-medium"
                        >
                          {item.title}
                        </Label>
                      </div>
                      
                      {selectedItems.includes(item.id) && (
                        <div className="ml-6 bg-muted/30 p-2 rounded-md">
                          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4, 5, 'N/A'].map((rating) => (
                              <TooltipProvider key={rating}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant={itemRatings[item.id] === rating ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => handleRatingSelect(item.id, rating)}
                                    >
                                      {rating}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{rating === 'N/A' ? 'Not assessed' : 
                                       `Rating ${rating}: ${['', 'Not performed', 'Below standard', 'Satisfactory', 'Proficient', 'Excellent'][rating]}`}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
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
              placeholder="Enter your comments"
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
            <p>Has this feedback been discussed with the student?</p>
            
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
                <p className="text-sm mb-2">Please select the discussion date</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !discussionDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {discussionDate ? format(discussionDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={discussionDate}
                      onSelect={setDiscussionDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Action buttons */}
        <div className="flex justify-end">
          <Button onClick={handleSubmit} className="min-w-[120px]">
            Submit
          </Button>
        </div>
      </main>
    </div>
  );
}
