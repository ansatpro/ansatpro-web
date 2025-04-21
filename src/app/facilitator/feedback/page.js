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
import {
  Home,
  MessageSquareText,
  Settings,
  Users,
  Download,
  Bell,
  Search,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { GetAllStudentsWithDetails } from "../../../../lib/HowToConnectToFunction";

export default function AllFeedback() {
  const router = useRouter();

  // // 预设的示例反馈数据
  // const sampleFeedbacks = [
  //   {
  //     id: "F89012",
  //     studentName: "Olivia Martinez!",
  //     studentId: "12345678",
  //     is_marked: false,
  //     university: "University",
  //     healthService: "Community Clinic",
  //     clinicArea: "Family Medicine",
  //     date: "2023-07-10",
  //     content:
  //       "Olivia demonstrated excellent patient care skills and empathy. Her clinical notes were thorough and well-organized. Need to work on time management during busy clinic hours.",
  //     preceptor: "Dr. Johnson",
  //     startDate: "2023-07-10",
  //     endDate: "2023-07-12",
  //   },
  // ];

  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredResults, setFilteredResults] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [universityFilter, setUniversityFilter] = useState("all");
  const [healthServiceFilter, setHealthServiceFilter] = useState("all");
  const [clinicAreaFilter, setClinicAreaFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // 格式化日期的辅助函数
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // 初始化数据
  useEffect(() => {
    const initializeData = async () => {
      try {
        // 检查localStorage中是否已有数据
        // const storedFeedbacks = localStorage.getItem("ansatpro_feedbacks");

        // if (storedFeedbacks) {
        //   // 如果localStorage中有数据，使用它
        //   const parsedFeedbacks = JSON.parse(storedFeedbacks);
        //   setFeedbacks(parsedFeedbacks);
        //   setFilteredResults(parsedFeedbacks);
        //   setIsLoading(false);
        //   return;
        // }

        // 如果没有存储的数据，则使用示例数据

        // Original response (e.g., from API)
        // const testRes = await GetAllStudentsWithDetails();
        // console.log(testRes);

        const response = await GetAllStudentsWithDetails();

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
              is_marked: !!is_marked,
              reviewComment,
              reviewScore,
              aiFeedbackDescriptions,
            });
          });
        });

        console.log(sampleFeedbacks);

        // 按日期倒序排列
        const sortedFeedbacks = [...sampleFeedbacks].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        // 存储到localStorage
        localStorage.setItem(
          "ansatpro_feedbacks",
          JSON.stringify(sortedFeedbacks)
        );

        setFeedbacks(sortedFeedbacks);
        setFilteredResults(sortedFeedbacks);
      } catch (err) {
        console.error("Error initializing data:", err);
        // 如果发生错误，仍然尝试使用示例数据
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

  // 更新过滤结果当反馈数据变化时
  useEffect(() => {
    setFilteredResults(feedbacks);
  }, [feedbacks]);

  // 从反馈数据中获取唯一的筛选值
  const universities = [
    ...new Set(feedbacks.map((feedback) => feedback.university)),
  ];
  const healthServices = [
    ...new Set(feedbacks.map((feedback) => feedback.healthService)),
  ];
  const clinicAreas = [
    ...new Set(feedbacks.map((feedback) => feedback.clinicArea)),
  ];

  // 应用筛选器当任何筛选条件变化时
  useEffect(() => {
    applyFilters();
  }, [universityFilter, healthServiceFilter, clinicAreaFilter, dateFilter]);

  // 处理大学筛选变化
  const handleUniversityChange = (value) => {
    setUniversityFilter(value);
  };

  // 处理医疗服务筛选变化
  const handleHealthServiceChange = (value) => {
    setHealthServiceFilter(value);
  };

  // 处理诊所区域筛选变化
  const handleClinicAreaChange = (value) => {
    setClinicAreaFilter(value);
  };

  // 处理日期筛选变化
  const handleDateFilterChange = (value) => {
    setDateFilter(value);
  };

  // 应用所有筛选条件
  const applyFilters = () => {
    let results = feedbacks;

    // 应用大学筛选
    if (universityFilter !== "all") {
      results = results.filter(
        (feedback) => feedback.university === universityFilter
      );
    }

    // 应用医疗服务筛选
    if (healthServiceFilter !== "all") {
      results = results.filter(
        (feedback) => feedback.healthService === healthServiceFilter
      );
    }

    // 应用诊所区域筛选
    if (clinicAreaFilter !== "all") {
      results = results.filter(
        (feedback) => feedback.clinicArea === clinicAreaFilter
      );
    }

    // 应用日期筛选
    if (dateFilter !== "all") {
      const now = new Date();
      let filterDate = new Date();

      switch (dateFilter) {
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setDate(now.getDate() - 30);
          break;
        case "sixMonths":
          filterDate.setMonth(now.getMonth() - 6);
          break;
        default:
          break;
      }

      results = results.filter(
        (feedback) => new Date(feedback.date) >= filterDate
      );
    }

    setFilteredResults(results);
  };

  // 搜索反馈
  const searchFeedback = () => {
    if (searchTerm.trim() === "") {
      applyFilters();
      return;
    }

    const results = filteredResults.filter(
      (feedback) =>
        feedback.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredResults(results);
  };

  // 清除所有筛选条件
  const clearFilters = () => {
    setSearchTerm("");
    setUniversityFilter("all");
    setHealthServiceFilter("all");
    setClinicAreaFilter("all");
    setDateFilter("all");
    setFilteredResults(feedbacks);
  };

  // 处理点击反馈详情 - 根据is_marked状态决定跳转目标
  const handleFeedbackClick = (feedback) => {
    // 存储当前点击的反馈详情到localStorage
    localStorage.setItem("ansatpro_current_feedback", JSON.stringify(feedback));

    if (feedback.is_marked) {
      // 已标记，跳转到查看反馈详情页面
      router.push(`/facilitator/feedback/${feedback.id}/feedbackDetail`);
    } else {
      // 未标记，跳转到创建反馈页面
      router.push(`/facilitator/feedback/${feedback.id}/studentDetail`);
    }
  };

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

      {/* Main content */}
      <main className="flex-1 p-6">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Feedback List</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </Button>
            <Button variant="outline" size="sm">
              Log out
            </Button>
          </div>
        </header>

        {/* Search and filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search for student name or feedback content"
                    className="pl-10 pr-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchFeedback()}
                  />
                  {searchTerm && (
                    <button
                      className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setSearchTerm("")}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button onClick={searchFeedback} variant="default">
                  Search
                </Button>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="ml-2"
                >
                  Clear Filters
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
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Universities" />
                    </SelectTrigger>
                    <SelectContent>
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
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Health Services" />
                    </SelectTrigger>
                    <SelectContent>
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
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Clinic Areas" />
                    </SelectTrigger>
                    <SelectContent>
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
                    Time Period
                  </label>
                  <Select
                    value={dateFilter}
                    onValueChange={handleDateFilterChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="sixMonths">Last 6 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback cards - ensuring maximum 3 per row */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-lg text-muted-foreground">Loading...</p>
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map((feedback) => (
              <Card
                key={feedback.id}
                className="flex flex-col h-full cursor-pointer transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 group"
                onClick={() => handleFeedbackClick(feedback)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">
                      {feedback.studentName}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="group-hover:bg-primary/10 transition-colors duration-300"
                    >
                      {feedback.is_marked ? "Marked" : "Unmarked"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(feedback.date)}
                  </p>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-4">
                    {feedback.content}
                  </p>
                </CardContent>
                <CardFooter className="border-t pt-3 text-xs text-muted-foreground group-hover:border-primary/20 transition-colors duration-300">
                  Preceptor: {feedback.preceptor}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                No feedback found matching your filters.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
