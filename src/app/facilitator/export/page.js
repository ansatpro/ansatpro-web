"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  Home, 
  MessageSquareText, 
  Settings, 
  Users, 
  Download, 
  Bell, 
  Search,
  X,
  LogOut
} from "lucide-react";
import { useRouter } from "next/navigation";

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
  const sampleStudents = [
    { 
      docId: "doc123", 
      studentId: "S1001", 
      studentName: "Olivia Martinez", 
      studentUniversity: "University of Melbourne",
      
    },
    { 
      docId: "doc124", 
      studentId: "S1002", 
      studentName: "Michael Johnson", 
      studentUniversity: "Stanford University",
      courses: [
        { code: "MED201", name: "Clinical Skills", year: "2023" }
      ]
    },
    { 
      docId: "doc125", 
      studentId: "S1003", 
      studentName: "Emma Wilson", 
      studentUniversity: "Deakin University",
      courses: [
        { code: "MED301", name: "Advanced Diagnostics", year: "2023" }
      ]
    },
    { 
      docId: "doc126", 
      studentId: "S1004", 
      studentName: "James Smith", 
      studentUniversity: "Monash University",
      courses: [
        { code: "BIO220", name: "Physiology", year: "2023" }
      ]
    },
    { 
      docId: "doc127", 
      studentId: "S1005", 
      studentName: "Sophia Chen", 
      studentUniversity: "University of Sydney",
      courses: [
        { code: "MED110", name: "Medical Ethics", year: "2023" }
      ]
    },
    { 
      docId: "doc128", 
      studentId: "S1006", 
      studentName: "William Brown", 
      studentUniversity: "RMIT University",
      courses: [
        { code: "BIO250", name: "Microbiology", year: "2023" }
      ]
    },
    { 
      docId: "doc129", 
      studentId: "S1007", 
      studentName: "Ava Davis", 
      studentUniversity: "La Trobe University",
      courses: [
        { code: "MED205", name: "Patient Care", year: "2023" }
      ]
    },
    { 
      docId: "doc130", 
      studentId: "S1008", 
      studentName: "Lucas Thompson", 
      studentUniversity: "University of Queensland",
      courses: [
        { code: "BIO230", name: "Immunology", year: "2023" }
      ]
    },
  ];

  // 初始化数据
  useEffect(() => {
    const initializeData = async () => {
      try {
        // 先清除localStorage中的学生数据以避免格式不一致的问题
        localStorage.removeItem('ansatpro_students');
        
        // 模拟加载延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 存储到localStorage
        localStorage.setItem('ansatpro_students', JSON.stringify(sampleStudents));
        
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
    const results = students.filter(student => {
      const studentIdMatch = student.studentId && student.studentId.toLowerCase().includes(lowercaseValue);
      const studentNameMatch = student.studentName && student.studentName.toLowerCase().includes(lowercaseValue);
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
    localStorage.setItem('ansatpro_selected_student', JSON.stringify(student));
    
    // 跳转到学生详情页面 - 使用docId作为路由参数
    router.push(`/facilitator/export/${student.docId}/studentDetail`);
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
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
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
          <h1 className="text-3xl font-bold">Student Search</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Bell className="mr-2 h-4 w-4" />
              <span className="sr-only md:not-sr-only md:inline-block">Notifications</span>
            </Button>
            <Button variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              <span className="sr-only md:not-sr-only md:inline-block">Log out</span>
            </Button>
          </div>
        </header>

        {/* Search box */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold">Search Student by ID or Name</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Enter student ID or name"
                    className="pl-10 pr-10"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  {searchTerm && (
                    <button 
                      className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      onClick={clearSearch}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                {/* Dropdown results */}
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                    <ul className="py-1">
                      {searchResults.map((student) => (
                        <li 
                          key={student.docId}
                          className="px-4 py-2 hover:bg-accent cursor-pointer"
                          onClick={() => selectStudent(student)}
                        >
                          <div className="font-medium">{student.studentName}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {student.studentId} | {student.studentUniversity}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Selected student info */}
              {selectedStudent && (
                <div className="mt-6 p-4 border rounded-md bg-muted/20">
                  <h3 className="text-lg font-medium mb-2">Selected Student</h3>
                  <p><span className="font-medium">ID:</span> {selectedStudent.studentId}</p>
                  <p><span className="font-medium">Name:</span> {selectedStudent.studentName}</p>
                  <p><span className="font-medium">University:</span> {selectedStudent.studentUniversity}</p>
                  <p><span className="font-medium">Document ID:</span> {selectedStudent.docId}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <p className="text-lg text-muted-foreground">Loading student data...</p>
          </div>
        )}
      </main>
    </div>
  );
}