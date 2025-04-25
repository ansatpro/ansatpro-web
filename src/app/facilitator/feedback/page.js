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
        feedback.studentId.toLowerCase().includes(searchTerm.toLowerCase())
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
                <Select value={dateFilter} onValueChange={handleDateFilterChange}>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResults.map((feedback) => (
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
                    className={feedback.is_marked ? "bg-green-500" : "bg-amber-500"}
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
                <p className="text-sm line-clamp-3">{feedback.content}</p>
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
      )}
            </div>
  );
}
