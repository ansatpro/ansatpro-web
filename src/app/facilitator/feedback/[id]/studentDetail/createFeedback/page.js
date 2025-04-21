"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
  CalendarIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PostFacilitatorComments } from "../../../../../../../lib/HowToConnectToFunction";

export default function ReviewFeedback() {
  const router = useRouter();
  const params = useParams();
  const feedbackId = params.id;

  // State management
  const [comment, setComment] = useState("");
  const [itemRatings, setItemRatings] = useState({});
  const [discussedWithStudent, setDiscussedWithStudent] = useState(null);
  const [discussionDate, setDiscussionDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackData, setFeedbackData] = useState(null);
  const [ansatItems, setAnsatItems] = useState([]);

  // Fetch feedback data
  useEffect(() => {
    const fetchFeedbackData = async () => {
      try {
        // First try to get current feedback data from localStorage
        const storedCurrentFeedback = localStorage.getItem(
          "ansatpro_current_feedback"
        );

        console.log(storedCurrentFeedback);

        if (storedCurrentFeedback) {
          const currentFeedback = JSON.parse(storedCurrentFeedback);

          // Check if ID matches
          if (currentFeedback.id === feedbackId) {
            console.log(
              "Using feedback data from localStorage (current feedback)"
            );

            setFeedbackData({
              id: currentFeedback.id,
              date: currentFeedback.date,
              studentName: currentFeedback.studentName,
              originalFeedback: currentFeedback.content,
            });

            setLoading(false);
            return;
          }
        }

        // If current feedback doesn't exist or ID doesn't match, search in feedback list
        const storedFeedbacks = localStorage.getItem("ansatpro_feedbacks");

        if (storedFeedbacks) {
          const feedbacks = JSON.parse(storedFeedbacks);
          const feedback = feedbacks.find((f) => f.id === feedbackId);

          if (feedback) {
            console.log(
              "Using feedback data from localStorage (feedbacks list)"
            );

            setFeedbackData({
              id: feedback.id,
              date: feedback.date,
              studentName: feedback.studentName,
              originalFeedback: feedback.content,
            });

            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error("Error fetching feedback data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbackData();
  }, [feedbackId]);

  // Fetch ANSAT items
  useEffect(() => {
    const fetchAnsatItems = async () => {
      try {
        // Get feedback data from localStorage
        const storedFeedbacks = localStorage.getItem("ansatpro_feedbacks");

        if (storedFeedbacks) {
          const feedbacks = JSON.parse(storedFeedbacks);
          const currentFeedback = feedbacks.find((f) => f.id === feedbackId);

          if (currentFeedback && currentFeedback.aiFeedbackDescriptions) {
            // Transform the AI feedback descriptions into ANSAT items
            const ansatItems = currentFeedback.aiFeedbackDescriptions.map(
              (item) => ({
                item_id: item.item_id,
                title: item.description,
                is_positive: item.is_positive,
              })
            );

            setAnsatItems(ansatItems);
          } else {
            console.error("No ANSAT items found for this feedback");
          }
        } else {
          console.error("No feedbacks found in localStorage");
        }
      } catch (error) {
        console.error("Error fetching ANSAT items:", error);
      }
    };

    fetchAnsatItems();
  }, [feedbackId]);

  // Handle rating selection
  const handleRatingSelect = (itemId, rating) => {
    setItemRatings((prev) => ({
      ...prev,
      [itemId]: rating,
    }));
  };

  // Handle submission
  const handleSubmit = async () => {
    // Validate that required items have ratings
    const hasRatings = Object.keys(itemRatings).length > 0;

    if (!hasRatings) {
      alert("请至少为一个ANSAT项目进行评分");
      return;
    }

    if (discussedWithStudent === "yes" && !discussionDate) {
      alert("请选择与学生讨论的日期");
      return;
    }

    // Build submission data
    const submissionData = {
      feedbackId,
      ratedItems: Object.entries(itemRatings).map(([itemId, rating]) => ({
        itemId,
        rating,
      })),
      comment,
      discussedWithStudent,
      discussionDate: discussedWithStudent === "yes" ? discussionDate : null,
    };

    console.log("提交数据:", submissionData);

    // In a real application, this would call an API
    try {
      // Simulate API call
      const res = await PostFacilitatorComments(submissionData);
      console.log(res);

      // Update feedback status to marked in localStorage
      const storedFeedbacks = localStorage.getItem("ansatpro_feedbacks");

      if (storedFeedbacks) {
        const feedbacks = JSON.parse(storedFeedbacks);
        const updatedFeedbacks = feedbacks.map((f) => {
          if (f.id === feedbackId) {
            return {
              ...f,
              is_marked: true,
              ismarked: "Marked",
              reviewData: submissionData,
            };
          }
          return f;
        });

        localStorage.setItem(
          "ansatpro_feedbacks",
          JSON.stringify(updatedFeedbacks)
        );
      }

      // Also update current feedback if it exists
      const storedCurrentFeedback = localStorage.getItem(
        "ansatpro_current_feedback"
      );

      if (storedCurrentFeedback) {
        const currentFeedback = JSON.parse(storedCurrentFeedback);

        if (currentFeedback.id === feedbackId) {
          const updatedCurrentFeedback = {
            ...currentFeedback,
            is_marked: true,
            ismarked: "Marked",
            reviewData: submissionData,
          };

          localStorage.setItem(
            "ansatpro_current_feedback",
            JSON.stringify(updatedCurrentFeedback)
          );
        }
      }

      // 跳转到成功页面
      router.push(
        `/facilitator/feedback/${feedbackId}/studentDetail/createFeedback/success`
      );
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
      <main className="flex-1 p-6 overflow-auto">
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

        {/* Assessment section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              Assessment (
              {Object.keys(itemRatings).length > 0
                ? `${Object.keys(itemRatings).length} items rated`
                : `${ansatItems.length} items total`}
              )
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Rating description */}
            <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
              <p>1 = Does not perform expected behaviors and practices</p>
              <p>
                2 = Performs expected behaviors and practices below
                acceptable/satisfactory standard
              </p>
              <p>
                3 = Performs expected behaviors and practices at
                satisfactory/pass standard
              </p>
              <p>
                4 = Performs expected behaviors and practices at proficient
                standard
              </p>
              <p>
                5 = Performs expected behaviors and practices at excellent
                standard
              </p>
              <p>N/A = Not assessed</p>
              <p className="font-bold mt-2">
                *Note: Ratings of 1 or 2 indicate below standard performance
              </p>
            </div>

            {/* ANSAT item list with ratings */}
            <div className="space-y-6">
              {ansatItems.map((item) => (
                <div
                  key={item.item_id}
                  className="border rounded-md p-4 transition-all hover:border-primary/30 hover:bg-muted/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <h3 className="font-medium">
                        Item {item.item_id}: {item.title}
                      </h3>
                      <span
                        className={`text-sm ml-3 px-2 py-1 rounded ${
                          item.is_positive
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        } font-medium`}
                      >
                        {item.is_positive ? "Positive" : "Improvement needed"}
                      </span>
                    </div>
                    {itemRatings[item.item_id] && (
                      <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                        Rated: {itemRatings[item.item_id]}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {[1, 2, 3, 4, 5, "N/A"].map((rating) => (
                      <TooltipProvider key={rating}>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Button
                              variant={
                                itemRatings[item.item_id] === rating
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                handleRatingSelect(item.item_id, rating)
                              }
                              className={
                                itemRatings[item.item_id] === rating
                                  ? "ring-2 ring-primary/30"
                                  : ""
                              }
                            >
                              {rating}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {rating === "N/A"
                                ? "Not assessed"
                                : `Rating ${rating}: ${
                                    [
                                      "",
                                      "Not performed",
                                      "Below standard",
                                      "Satisfactory",
                                      "Proficient",
                                      "Excellent",
                                    ][rating]
                                  }`}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
                <p className="text-sm mb-2">
                  Please select the discussion date
                </p>
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
                      {discussionDate
                        ? format(discussionDate, "PPP")
                        : "Select date"}
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
        <div className="flex justify-end mb-12">
          <Button onClick={handleSubmit} className="min-w-[120px]">
            Submit
          </Button>
        </div>
      </main>
    </div>
  );
}
