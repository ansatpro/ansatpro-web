"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search, X, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { GetAllStudentsWithDetails } from "../../../../lib/HowToConnectToFunction";

export default function ExportPage() {
  const router = useRouter();
  const searchRef = useRef(null);

  // 状态管理
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // 示例学生数据 - 更新格式以与反馈系统保持一致
  // const sampleStudents = [
  //   {
  //     docId: "doc123",
  //     studentId: "S1001",
  //     studentName: "Olivia Martinez",
  //     studentUniversity: "University of Melbourne",
  //   },
  //   {
  //     docId: "doc124",
  //     studentId: "S1002",
  //     studentName: "Michael Johnson",
  //     studentUniversity: "Stanford University",
  //     courses: [{ code: "MED201", name: "Clinical Skills", year: "2023" }],
  //   },
  //   {
  //     docId: "doc125",
  //     studentId: "S1003",
  //     studentName: "Emma Wilson",
  //     studentUniversity: "Deakin University",
  //     courses: [{ code: "MED301", name: "Advanced Diagnostics", year: "2023" }],
  //   },
  //   {
  //     docId: "doc126",
  //     studentId: "S1004",
  //     studentName: "James Smith",
  //     studentUniversity: "Monash University",
  //     courses: [{ code: "BIO220", name: "Physiology", year: "2023" }],
  //   },
  //   {
  //     docId: "doc127",
  //     studentId: "S1005",
  //     studentName: "Sophia Chen",
  //     studentUniversity: "University of Sydney",
  //     courses: [{ code: "MED110", name: "Medical Ethics", year: "2023" }],
  //   },
  //   {
  //     docId: "doc128",
  //     studentId: "S1006",
  //     studentName: "William Brown",
  //     studentUniversity: "RMIT University",
  //     courses: [{ code: "BIO250", name: "Microbiology", year: "2023" }],
  //   },
  //   {
  //     docId: "doc129",
  //     studentId: "S1007",
  //     studentName: "Ava Davis",
  //     studentUniversity: "La Trobe University",
  //     courses: [{ code: "MED205", name: "Patient Care", year: "2023" }],
  //   },
  //   {
  //     docId: "doc130",
  //     studentId: "S1008",
  //     studentName: "Lucas Thompson",
  //     studentUniversity: "University of Queensland",
  //     courses: [{ code: "BIO230", name: "Immunology", year: "2023" }],
  //   },
  // ];

  // 初始化数据
  useEffect(() => {
    const initializeData = async () => {
      try {
        // 模拟加载延迟
        // await new Promise((resolve) => setTimeout(resolve, 800));

        // Get all students created by the facilitator
        const response = await GetAllStudentsWithDetails();
        console.log(response);

        // Convert to sampleFeedbacks format
        const sampleFeedbacks = [];

        response.forEach((student) => {
          const {
            $id: student_DocId,
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
              $id: preceptorFeedback_DocId,
              $createdAt: preceptorFeedback_date,
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
              student_DocId,
              preceptorFeedback_DocId,
              preceptorFeedback_date,
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

        // concert sampleFeedbacks to sampleStudents
        const sampleStudents = [];

        const seenStudentIds = new Set();

        sampleFeedbacks.forEach((feedback) => {
          if (!seenStudentIds.has(feedback.studentId)) {
            sampleStudents.push({
              docId: feedback.student_DocId,
              studentId: feedback.studentId,
              studentName: feedback.studentName,
              studentUniversity: feedback.university,
            });
            seenStudentIds.add(feedback.studentId);
          }
        });

        console.log(sampleStudents);

        // 存储到localStorage
        localStorage.setItem(
          "ansatpro_students",
          JSON.stringify(sampleStudents)
        );

        setStudents(sampleStudents);
      } catch (err) {
        console.error("Error initializing data:", err);
        // 如果发生错误，仍然尝试使用示例数据
        setStudents(sampleStudents);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();

    // 添加点击外部关闭下拉框的事件
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 处理搜索输入变化
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    // 确保students数组存在且有内容
    if (!students || students.length === 0) {
      return;
    }

    // 根据学生ID或姓名进行搜索
    const lowercaseValue = value.toLowerCase();
    const results = students.filter((student) => {
      const studentIdMatch =
        student.studentId &&
        student.studentId.toLowerCase().includes(lowercaseValue);
      const studentNameMatch =
        student.studentName &&
        student.studentName.toLowerCase().includes(lowercaseValue);
      return studentIdMatch || studentNameMatch;
    });

    setSearchResults(results);
    setShowDropdown(true);
  };

  // 清除搜索
  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setShowDropdown(false);
    setSelectedStudent(null);
  };

  // 选择学生
  const selectStudent = (student) => {
    if (!student || !student.docId) {
      console.error("Invalid student data:", student);
      return;
    }

    setSelectedStudent(student);
    setSearchTerm(student.studentName || "");
    setShowDropdown(false);

    // 将所选学生存储到localStorage
    localStorage.setItem("ansatpro_selected_student", JSON.stringify(student));

    // 跳转到学生详情页面 - 使用docId作为路由参数
    router.push(`/facilitator/export/${student.docId}/studentDetail`);
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <h1 className="text-2xl font-bold mb-6">Export Data</h1>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-semibold">Search for a Student</h2>
          <p className="text-sm text-muted-foreground">
            To generate reports, start by searching for a student by name or ID
          </p>
        </CardHeader>
        <CardContent>
          <div className="relative" ref={searchRef}>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by student name or ID"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 pr-10"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {showDropdown && searchResults.length > 0 && (
              <div className="absolute w-full bg-white mt-1 rounded-md border shadow-lg z-10 max-h-80 overflow-y-auto">
                {searchResults.map((student) => (
                  <div
                    key={student.docId}
                    className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                    onClick={() => selectStudent(student)}
                  >
                    <div className="font-medium">{student.studentName}</div>
                    <div className="text-sm text-gray-500 flex justify-between">
                      <span>ID: {student.studentId}</span>
                      <span>{student.studentUniversity}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showDropdown && searchTerm && searchResults.length === 0 && (
              <div className="absolute w-full bg-white mt-1 rounded-md border shadow-lg z-10">
                <div className="p-3 text-center text-gray-500">
                  No students found matching "{searchTerm}"
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedStudent && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">
                  {selectedStudent.studentName}
                </h3>
                <p className="text-sm text-gray-500">
                  ID: {selectedStudent.studentId}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedStudent.studentUniversity}
                </p>
              </div>
              <Button
                onClick={() =>
                  router.push(
                    `/facilitator/export/${selectedStudent.docId}/studentDetail`
                  )
                }
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !searchTerm && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium mb-2">
            Ready to Generate Reports
          </h3>
          <p className="text-gray-500 mb-4">
            Search for a student above to view their details and generate
            reports
          </p>
        </div>
      )}
    </div>
  );
}
