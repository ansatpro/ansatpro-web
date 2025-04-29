"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { GetAllStudentsWithDetails } from "../../../../functions/HowToConnectToFunction";

export default function AllFeedback() {
  const router = useRouter();

  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredResults, setFilteredResults] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [universityFilter, setUniversityFilter] = useState("all");
  const [healthServiceFilter, setHealthServiceFilter] = useState("all");
  const [clinicAreaFilter, setClinicAreaFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 9 items per page

  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Check if data already exists in localStorage
        // const storedFeedbacks = localStorage.getItem("ansatpro_feedbacks");

        // if (storedFeedbacks) {
        //   // If data exists in localStorage, use it
        //   const parsedFeedbacks = JSON.parse(storedFeedbacks);
        //   setFeedbacks(parsedFeedbacks);
        //   setFilteredResults(parsedFeedbacks);
        //   setIsLoading(false);
        //   return;
        // }

        // If no stored data, use sample data

        // Original response (e.g., from API)
        // const testRes = await GetAllStudentsWithDetails();
        // console.log(testRes);

        const response = await GetAllStudentsWithDetails();
        console.log("raw data:", response);
        // Convert to sampleFeedbacks format
        const sampleFeedbacks = [];

        response.forEach((student) => {
          const {
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

          preceptorFeedbackList.forEach((feedback) => {
            const {
              $id: id,
              $createdAt: date,
              preceptor_id,
              preceptor_name: preceptor,
              content,
              flag_discussed_with_student:
              preceptor_flag_discussed_with_student,
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
              id,
              date,
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
            });
          });
        });

        console.log("for test", sampleFeedbacks);

        // Sort by date in descending order
        const sortedFeedbacks = [...sampleFeedbacks].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        // Store to localStorage
        localStorage.setItem(
          "ansatpro_feedbacks",
          JSON.stringify(sortedFeedbacks)
        );

        setFeedbacks(sortedFeedbacks);
        setFilteredResults(sortedFeedbacks);
      } catch (err) {
        console.error("Error initializing data:", err);
        // If error occurs, still try to use sample data
        const sortedFeedbacks = [...sampleFeedbacks].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setFeedbacks(sortedFeedbacks);
        setFilteredResults(sortedFeedbacks);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Update filtered results when feedback data changes
  useEffect(() => {
    setFilteredResults(feedbacks);
    setCurrentPage(1); // 重置到第一页当数据改变时
  }, [feedbacks]);

  // Get unique filter values from feedback data
  const universities = [
    ...new Set(feedbacks.map((feedback) => feedback.university)),
  ];
  const healthServices = [
    ...new Set(feedbacks.map((feedback) => feedback.healthService)),
  ];
  const clinicAreas = [
    ...new Set(feedbacks.map((feedback) => feedback.clinicArea)),
  ];

  // Apply filters when any filter criteria changes
  useEffect(() => {
    applyFilters();
  }, [universityFilter, healthServiceFilter, clinicAreaFilter, dateFilter]);

  // Handle university filter change
  const handleUniversityChange = (value) => {
    setUniversityFilter(value);
  };

  // Handle health service filter change
  const handleHealthServiceChange = (value) => {
    setHealthServiceFilter(value);
  };

  // Handle clinic area filter change
  const handleClinicAreaChange = (value) => {
    setClinicAreaFilter(value);
  };

  // Handle date filter change
  const handleDateFilterChange = (value) => {
    setDateFilter(value);
  };

  // Apply all filter conditions
  const applyFilters = () => {
    let results = feedbacks;

    // Apply university filter
    if (universityFilter !== "all") {
      results = results.filter(
        (feedback) => feedback.university === universityFilter
      );
    }

    // Apply health service filter
    if (healthServiceFilter !== "all") {
      results = results.filter(
        (feedback) => feedback.healthService === healthServiceFilter
      );
    }

    // Apply clinic area filter
    if (clinicAreaFilter !== "all") {
      results = results.filter(
        (feedback) => feedback.clinicArea === clinicAreaFilter
      );
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date();
      let filterDate = new Date();

      switch (dateFilter) {
        case "newest":
          // Sort by newest first (descending)
          results = [...results].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );
          break;
        case "oldest":
          // Sort by oldest first (ascending)
          results = [...results].sort(
            (a, b) => new Date(a.date) - new Date(b.date)
          );
          break;
        case "last7":
          // Last 7 days
          filterDate.setDate(now.getDate() - 7);
          results = results.filter(
            (feedback) => new Date(feedback.date) >= filterDate
          );
          break;
        case "last30":
          // Last 30 days
          filterDate.setDate(now.getDate() - 30);
          results = results.filter(
            (feedback) => new Date(feedback.date) >= filterDate
          );
          break;
        case "last90":
          // Last 90 days
          filterDate.setDate(now.getDate() - 90);
          results = results.filter(
            (feedback) => new Date(feedback.date) >= filterDate
          );
          break;
        default:
          break;
      }
    }

    setFilteredResults(results);
    setCurrentPage(1); // reset to first page when filters change
  };

  // Search feedback
  const searchFeedback = () => {
    if (searchTerm.trim() === "") {
      applyFilters();
      return;
    }

    const results = filteredResults.filter(
      (feedback) =>
        feedback.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredResults(results);
    setCurrentPage(1); // reset to first page when search is applied
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setUniversityFilter("all");
    setHealthServiceFilter("all");
    setClinicAreaFilter("all");
    setDateFilter("all");
    setFilteredResults(feedbacks);
  };

  // Handle feedback click - decide redirect target based on is_marked status
  const handleFeedbackClick = (feedback) => {
    try {
      // Make sure feedback is a valid object before storing
      if (!feedback || typeof feedback !== "object") {
        console.error("Invalid feedback object:", feedback);
        return;
      }

      // Store a clean version of feedback object to avoid circular references
      const cleanFeedback = {
        id: feedback.id,
        studentName: feedback.studentName,
        studentId: feedback.studentId,
        university: feedback.university,
        healthService: feedback.healthService,
        clinicArea: feedback.clinicArea,
        date: feedback.date,
        content: feedback.content,
        preceptor: feedback.preceptor,
        preceptor_id: feedback.preceptor_id,
        is_marked: feedback.is_marked,
        startDate: feedback.startDate,
        endDate: feedback.endDate,
        reviewComment: feedback.reviewComment,
        reviewScore: feedback.reviewScore,
        aiFeedbackDescriptions: feedback.aiFeedbackDescriptions || [],
        flag_discussed_with_student: feedback.flag_discussed_with_student,
        discussion_date: feedback.discussion_date,
        preceptor_flag_discussed_with_student: feedback.preceptor_flag_discussed_with_student,
        preceptor_discussion_date: feedback.preceptor_discussion_date
      };

      console.log("Storing feedback with discussion data:", {
        flag_discussed_with_student: feedback.flag_discussed_with_student,
        discussion_date: feedback.discussion_date,
        preceptor_flag_discussed_with_student: feedback.preceptor_flag_discussed_with_student,
        preceptor_discussion_date: feedback.preceptor_discussion_date
      });

      // Store current clicked feedback details to localStorage
      localStorage.setItem(
        "ansatpro_current_feedback",
        JSON.stringify(cleanFeedback)
      );

      // Wait a moment before navigating to ensure localStorage is updated
      setTimeout(() => {
        if (feedback.is_marked) {
          // If marked, redirect to view feedback details page
          router.push(`/facilitator/feedback/${feedback.id}/feedbackDetail`);
        } else {
          // If not marked, redirect to create feedback page
          router.push(`/facilitator/feedback/${feedback.id}/studentDetail`);
        }
      }, 100);
    } catch (error) {
      console.error("Error in handleFeedbackClick:", error);
      alert("There was an error processing this feedback. Please try again.");
    }
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredResults.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of the page
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="container mx-auto px-4 py-4">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Feedback Overview</h1>
      </header>

      {/* Search and filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search row */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="search"
                  placeholder="Search by student name or ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                  onKeyDown={(e) => e.key === "Enter" && searchFeedback()}
                />
              </div>
              <Button
                onClick={searchFeedback}
                variant="default"
                className="flex items-center gap-1"
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  University
                </label>
                <Select
                  value={universityFilter}
                  onValueChange={handleUniversityChange}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="All Universities" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Universities</SelectItem>
                    {universities.map((uni) => (
                      <SelectItem key={uni} value={uni}>
                        {uni}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Health Service
                </label>
                <Select
                  value={healthServiceFilter}
                  onValueChange={handleHealthServiceChange}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="All Health Services" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Health Services</SelectItem>
                    {healthServices.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Clinic Area
                </label>
                <Select
                  value={clinicAreaFilter}
                  onValueChange={handleClinicAreaChange}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="All Clinic Areas" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Clinic Areas</SelectItem>
                    {clinicAreas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Date Range
                </label>
                <Select
                  value={dateFilter}
                  onValueChange={handleDateFilterChange}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="All Dates" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="last7">Last 7 Days</SelectItem>
                    <SelectItem value="last30">Last 30 Days</SelectItem>
                    <SelectItem value="last90">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button - Top right */}
              <div className="col-span-full flex justify-end">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="ml-auto flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback cards list */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="loader"></div>
        </div>
      ) : filteredResults.length === 0 ? (
        <Card className="w-full mb-4">
          <CardContent className="p-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No Feedback Found</h3>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentItems.map((feedback) => (
              <Card
                key={feedback.id}
                className="w-full mb-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleFeedbackClick(feedback)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-bold">
                        {feedback.studentName}
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        ID: {feedback.studentId}
                      </p>
                    </div>
                    <Badge
                      variant={feedback.is_marked ? "success" : "pending"}
                      className={
                        feedback.is_marked ? "bg-green-500" : "bg-amber-500"
                      }
                    >
                      {feedback.is_marked ? "Reviewed" : "Pending"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="mb-2">
                    <p className="text-sm">
                      <span className="font-medium">Date:</span>{" "}
                      {formatDate(feedback.date)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Preceptor:</span>{" "}
                      {feedback.preceptor}
                    </p>
                  </div>
                  <p className="text-sm line-clamp-3">
                    <span className="font-medium">Feedback:</span>{" "}
                    {feedback.content}
                  </p>
                </CardContent>
                <CardFooter>
                  <div className="flex justify-between items-center w-full mt-2">
                    <div className="text-xs text-gray-500">
                      {feedback.university}
                    </div>
                    <Button size="sm" variant="outline" className="bg-white">
                      View Details
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, filteredResults.length)} of{" "}
                {filteredResults.length} items
              </div>
              <div className="flex items-center gap-1">
                {/* previous page button */}
                {currentPage > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>
                )}

                {/* Page numbers */}
                <div className="flex items-center">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Display only relevant pages
                      return (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      );
                    })
                    .map((page, index, array) => {
                      // If there are gaps in the page numbers, show ellipsis
                      if (index > 0 && array[index - 1] !== page - 1) {
                        return (
                          <React.Fragment key={`ellipsis-${page}`}>
                            <span className="px-2 text-muted-foreground">
                              ...
                            </span>
                            <Button
                              key={page}
                              variant={
                                currentPage === page ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className="mx-1 min-w-[32px]"
                            >
                              {page}
                            </Button>
                          </React.Fragment>
                        );
                      }

                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="mx-1 min-w-[32px]"
                        >
                          {page}
                        </Button>
                      );
                    })}
                </div>

                {/* next page button */}
                {currentPage < totalPages && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="flex items-center gap-1"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
