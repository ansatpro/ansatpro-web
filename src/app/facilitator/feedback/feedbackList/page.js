// "use client";

// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Card, CardContent } from "@/components/ui/card";

// export default function StudentList() {
//   // 预设的示例学生数据
//   const sampleStudents = [
//     {
//       studentId: "S12345",
//       firstName: "John",
//       lastName: "Smith",
//       university: "University of California",
//       healthService: "General Hospital",
//       clinicArea: "Pediatrics",
//       additionalFacilitator: "Dr. Johnson",
//       startDate: "2023-09-01",
//       endDate: "2024-06-30"
//     },
//     {
//       studentId: "S23456",
//       firstName: "Emily",
//       lastName: "Johnson",
//       university: "Stanford University",
//       healthService: "Community Health Center",
//       clinicArea: "Psychiatry",
//       additionalFacilitator: "Dr. Williams",
//       startDate: "2023-08-15",
//       endDate: "2024-05-31"
//     },
//     {
//       studentId: "S34567",
//       firstName: "Michael",
//       lastName: "Chen",
//       university: "MIT",
//       healthService: "Tech Medical Center",
//       clinicArea: "Neurology",
//       additionalFacilitator: "Dr. Garcia",
//       startDate: "2023-09-10",
//       endDate: "2024-06-15"
//     },
//     {
//       studentId: "S45678",
//       firstName: "Sarah",
//       lastName: "Wilson",
//       university: "Harvard University",
//       healthService: "Research Hospital",
//       clinicArea: "Cardiology",
//       additionalFacilitator: "Dr. Martinez",
//       startDate: "2023-08-20",
//       endDate: "2024-05-20"
//     },
//     {
//       studentId: "S56789",
//       firstName: "David",
//       lastName: "Lee",
//       university: "California Institute of Technology",
//       healthService: "University Hospital",
//       clinicArea: "Orthopedics",
//       additionalFacilitator: "Dr. Robinson",
//       startDate: "2023-09-05",
//       endDate: "2024-06-10"
//     },
//     {
//       studentId: "S67890",
//       firstName: "Jessica",
//       lastName: "Brown",
//       university: "University of Michigan",
//       healthService: "Mental Health Clinic",
//       clinicArea: "Psychology",
//       additionalFacilitator: "Dr. Thompson",
//       startDate: "2023-08-25",
//       endDate: "2024-05-25"
//     },
//     {
//       studentId: "S78901",
//       firstName: "Ryan",
//       lastName: "Taylor",
//       university: "University of Washington",
//       healthService: "Medical Research Center",
//       clinicArea: "Oncology",
//       additionalFacilitator: "Dr. Anderson",
//       startDate: "2023-09-15",
//       endDate: "2024-06-20"
//     },
//     {
//       studentId: "S89012",
//       firstName: "Olivia",
//       lastName: "Martinez",
//       university: "Johns Hopkins University",
//       healthService: "Community Clinic",
//       clinicArea: "Family Medicine",
//       additionalFacilitator: "Dr. Patel",
//       startDate: "2023-08-10",
//       endDate: "2024-05-15"
//     }
//   ];

//   const [students, setStudents] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [filteredResults, setFilteredResults] = useState([]);
  
//   const [searchTerm, setSearchTerm] = useState("");
//   const [universityFilter, setUniversityFilter] = useState("all");
//   const [healthServiceFilter, setHealthServiceFilter] = useState("all");
//   const [clinicAreaFilter, setClinicAreaFilter] = useState("all");
//   const [startDateFilter, setStartDateFilter] = useState("");
//   const [endDateFilter, setEndDateFilter] = useState("");

//   // 初始化数据
//   useEffect(() => {
//     const initializeData = async () => {
//       try {
//         // 模拟加载延迟
//         await new Promise(resolve => setTimeout(resolve, 800));
//         setStudents(sampleStudents);
//         setFilteredResults(sampleStudents);
//       } catch (err) {
//         console.error("Error initializing data:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     initializeData();
//   }, []);

//   // 更新过滤结果当学生数据变化时
//   useEffect(() => {
//     setFilteredResults(students);
//   }, [students]);

//   // 从学生数据中获取唯一的筛选值
//   const universities = [
//     ...new Set(students.map((student) => student.university)),
//   ];
//   const healthServices = [
//     ...new Set(students.map((student) => student.healthService)),
//   ];
//   const clinicAreas = [
//     ...new Set(students.map((student) => student.clinicArea)),
//   ];

//   // Apply filters whenever any filter changes
//   useEffect(() => {
//     applyFilters();
//   }, [
//     universityFilter,
//     healthServiceFilter,
//     clinicAreaFilter,
//     startDateFilter,
//     endDateFilter,
//   ]);

//   // Function to handle university filter change
//   const handleUniversityChange = (value) => {
//     setUniversityFilter(value);
//   };

//   // Function to handle health service filter change
//   const handleHealthServiceChange = (value) => {
//     setHealthServiceFilter(value);
//   };

//   // Function to handle clinic area filter change
//   const handleClinicAreaChange = (value) => {
//     setClinicAreaFilter(value);
//   };

//   // Function to handle start date change
//   const handleStartDateChange = (e) => {
//     setStartDateFilter(e.target.value);
//   };

//   // Function to handle end date change
//   const handleEndDateChange = (e) => {
//     setEndDateFilter(e.target.value);
//   };

//   // Check if date is within range
//   const isWithinDateRange = (studentStartDate, studentEndDate) => {
//     if (!startDateFilter && !endDateFilter) return true;

//     const studentStart = new Date(studentStartDate);
//     const studentEnd = new Date(studentEndDate);

//     if (startDateFilter && endDateFilter) {
//       const filterStart = new Date(startDateFilter);
//       const filterEnd = new Date(endDateFilter);

//       // Check if the student's period overlaps with the filter period
//       return studentStart <= filterEnd && studentEnd >= filterStart;
//     } else if (startDateFilter) {
//       const filterStart = new Date(startDateFilter);
//       return studentEnd >= filterStart;
//     } else if (endDateFilter) {
//       const filterEnd = new Date(endDateFilter);
//       return studentStart <= filterEnd;
//     }

//     return true;
//   };

//   // Apply all filters
//   const applyFilters = () => {
//     const results = students.filter((student) => {
//       const matchesUniversity =
//         universityFilter === "all" || student.university === universityFilter;
//       const matchesHealthService =
//         healthServiceFilter === "all" ||
//         student.healthService === healthServiceFilter;
//       const matchesClinicArea =
//         clinicAreaFilter === "all" || student.clinicArea === clinicAreaFilter;
//       const matchesDateRange = isWithinDateRange(
//         student.startDate,
//         student.endDate
//       );

//       return (
//         matchesUniversity &&
//         matchesHealthService &&
//         matchesClinicArea &&
//         matchesDateRange
//       );
//     });

//     setFilteredResults(results);
//   };

//   // Search for an individual student
//   const searchStudent = () => {
//     if (searchTerm.trim() === "") {
//       applyFilters();
//       return;
//     }

//     const results = filteredResults.filter(
//       (student) =>
//         student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         student.studentId.includes(searchTerm)
//     );

//     setFilteredResults(results);
//   };

//   const clearFilters = () => {
//     setSearchTerm("");
//     setUniversityFilter("all");
//     setHealthServiceFilter("all");
//     setClinicAreaFilter("all");
//     setStartDateFilter("");
//     setEndDateFilter("");
//     setFilteredResults(students);
//   };

//   const handleDelete = (studentId) => {
//     // In a real application, this would make an API call to delete the student
//     console.log(`Delete student with ID: ${studentId}`);
//     // Remove the student from filtered results
//     setFilteredResults((prevResults) =>
//       prevResults.filter((student) => student.studentId !== studentId)
//     );
//     // Also remove from the main students array
//     setStudents((prevStudents) => 
//       prevStudents.filter((student) => student.studentId !== studentId)
//     );
//   };

//   return (
//     <div className="flex min-h-screen bg-background">
//       {/* Sidebar navigation */}
//       <aside className="w-64 border-r bg-muted/40 p-6">
//         <nav className="space-y-2">
//           <Link
//             href="/facilitator/dashboard"
//             className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
//           >
//             Home
//           </Link>
//           <Link
//             href="/facilitator/student"
//             className="flex items-center rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground"
//           >
//             Student
//           </Link>
//           <Link
//             href="/facilitator/feedback"
//             className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
//           >
//             Feedback
//           </Link>
//           <Link
//             href="/facilitator/report"
//             className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
//           >
//             Report
//           </Link>
//           <Link
//             href="/facilitator/settings"
//             className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
//           >
//             Settings
//           </Link>
//         </nav>
//       </aside>

//       {/* Main content */}
//       <main className="flex-1 p-6">
//         {/* Header */}
//         <header className="mb-8 flex items-center justify-between">
//           <h1 className="text-3xl font-bold">Student List</h1>
//           <div className="flex items-center gap-4">
//             <Button variant="outline" size="sm">
//               Notifications
//             </Button>
//             <Button variant="outline" size="sm">
//               Log out
//             </Button>
//           </div>
//         </header>

//         {/* Search and filters */}
//         <Card className="mb-6">
//           <CardContent className="p-6">
//             <div className="space-y-4">
//               {/* Search */}
//               <div className="flex gap-2">
//                 <div className="flex-1">
//                   <Input
//                     type="search"
//                     placeholder="Search for a student"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full"
//                     onKeyDown={(e) => e.key === "Enter" && searchStudent()}
//                   />
//                 </div>
//                 <Button onClick={searchStudent} variant="default">
//                   Search
//                 </Button>
//                 <Button
//                   onClick={clearFilters}
//                   variant="outline"
//                   className="ml-2"
//                 >
//                   Clear Filters
//                 </Button>
//               </div>

//               {/* Filters */}
//               <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
//                 <div>
//                   <label className="mb-2 block text-sm font-medium">
//                     University
//                   </label>
//                   <Select
//                     value={universityFilter}
//                     onValueChange={handleUniversityChange}
//                   >
//                     <SelectTrigger className="w-full">
//                       <SelectValue placeholder="All Universities" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All Universities</SelectItem>
//                       {universities.map((uni) => (
//                         <SelectItem key={uni} value={uni}>
//                           {uni}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div>
//                   <label className="mb-2 block text-sm font-medium">
//                     Health Service
//                   </label>
//                   <Select
//                     value={healthServiceFilter}
//                     onValueChange={handleHealthServiceChange}
//                   >
//                     <SelectTrigger className="w-full">
//                       <SelectValue placeholder="All Health Services" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All Health Services</SelectItem>
//                       {healthServices.map((service) => (
//                         <SelectItem key={service} value={service}>
//                           {service}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div>
//                   <label className="mb-2 block text-sm font-medium">
//                     Clinic Area
//                   </label>
//                   <Select
//                     value={clinicAreaFilter}
//                     onValueChange={handleClinicAreaChange}
//                   >
//                     <SelectTrigger className="w-full">
//                       <SelectValue placeholder="All Clinic Areas" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All Clinic Areas</SelectItem>
//                       {clinicAreas.map((area) => (
//                         <SelectItem key={area} value={area}>
//                           {area}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div>
//                   <label className="mb-2 block text-sm font-medium">
//                     Date Range
//                   </label>
//                   <div className="flex gap-2">
//                     <Input
//                       type="date"
//                       placeholder="Start Date"
//                       className="w-full"
//                       value={startDateFilter}
//                       onChange={handleStartDateChange}
//                     />
//                     <Input
//                       type="date"
//                       placeholder="End Date"
//                       className="w-full"
//                       value={endDateFilter}
//                       onChange={handleEndDateChange}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Student table */}
//         <div className="rounded-md border">
//           <div className="overflow-x-auto">
//             <table className="w-full table-auto">
//               <thead>
//                 <tr className="border-b bg-muted/50">
//                   <th className="px-4 py-3 text-left text-sm font-medium">
//                     First Name
//                   </th>
//                   <th className="px-4 py-3 text-left text-sm font-medium">
//                     Last Name
//                   </th>
//                   <th className="px-4 py-3 text-left text-sm font-medium">
//                     Student ID Number
//                   </th>
//                   <th className="px-4 py-3 text-left text-sm font-medium">
//                     University
//                   </th>
//                   <th className="px-4 py-3 text-left text-sm font-medium">
//                     Health Service
//                   </th>
//                   <th className="px-4 py-3 text-left text-sm font-medium">
//                     Clinic Area
//                   </th>
//                   <th className="px-4 py-3 text-left text-sm font-medium">
//                     Additional Facilitator
//                   </th>
//                   <th className="px-4 py-3 text-left text-sm font-medium">
//                     Start Date
//                   </th>
//                   <th className="px-4 py-3 text-left text-sm font-medium">
//                     End Date
//                   </th>
//                   <th className="px-4 py-3 text-left text-sm font-medium">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {isLoading ? (
//                   <tr>
//                     <td
//                       colSpan="10"
//                       className="px-4 py-6 text-center text-sm text-muted-foreground"
//                     >
//                       Loading...
//                     </td>
//                   </tr>
//                 ) : filteredResults.length > 0 ? (
//                   filteredResults.map((student, index) => (
//                     <tr
//                       key={student.studentId}
//                       className={
//                         index % 2 === 0 ? "bg-background" : "bg-muted/20"
//                       }
//                     >
//                       <td className="px-4 py-3 text-sm">{student.firstName}</td>
//                       <td className="px-4 py-3 text-sm">{student.lastName}</td>
//                       <td className="px-4 py-3 text-sm">{student.studentId}</td>
//                       <td className="px-4 py-3 text-sm">
//                         {student.university}
//                       </td>
//                       <td className="px-4 py-3 text-sm">
//                         {student.healthService}
//                       </td>
//                       <td className="px-4 py-3 text-sm">
//                         {student.clinicArea}
//                       </td>
//                       <td className="px-4 py-3 text-sm">
//                         {student.additionalFacilitator}
//                       </td>
//                       <td className="px-4 py-3 text-sm">{student.startDate}</td>
//                       <td className="px-4 py-3 text-sm">{student.endDate}</td>
//                       <td className="px-4 py-3 text-sm">
//                         <Button
//                           variant="destructive"
//                           size="sm"
//                           onClick={() => handleDelete(student.studentId)}
//                         >
//                           Delete
//                         </Button>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td
//                       colSpan="10"
//                       className="px-4 py-6 text-center text-sm text-muted-foreground"
//                     >
//                       No students found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

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
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  MessageSquareText, 
  Settings, 
  Users, 
  Download, 
  Bell, 
  Search,
  X
} from "lucide-react";

export default function FeedbackList() {
  // 预设的示例反馈数据
  const sampleFeedbacks = [
    {
      id: "F12345",
      studentName: "John Smith",
      course: "Mathematics 101",
      university: "University of California",
      healthService: "General Hospital",
      clinicArea: "Pediatrics",
      date: "2023-10-15",
      feedbackType: "Assignment Feedback",
      content: "John has shown significant improvement in algebraic equations. His problem-solving approach demonstrates good analytical skills. Need to work more on geometry concepts.",
      preceptor: "Dr. Williams"
    },
    {
      id: "F23456",
      studentName: "Emily Johnson",
      course: "Literature Studies",
      university: "Stanford University",
      healthService: "Community Health Center",
      clinicArea: "Psychiatry",
      date: "2023-10-12",
      feedbackType: "Term Paper Feedback",
      content: "Emily's analysis of the text was insightful and well-structured. Her arguments were supported with relevant quotes and references. Grammar and citations need more attention.",
      preceptor: "Prof. Garcia"
    },
    {
      id: "F34567",
      studentName: "Michael Chen",
      course: "Computer Science 202",
      university: "MIT",
      healthService: "Tech Medical Center",
      clinicArea: "Neurology",
      date: "2023-10-10",
      feedbackType: "Project Feedback",
      content: "Michael's code was well-organized and efficiently implemented. Documentation was thorough and clear. For future projects, consider adding more error handling and unit tests.",
      preceptor: "Dr. Thompson"
    },
    {
      id: "F45678",
      studentName: "Sarah Wilson",
      course: "Biology 301",
      university: "Harvard University",
      healthService: "Research Hospital",
      clinicArea: "Cardiology",
      date: "2023-10-08",
      feedbackType: "Lab Report Feedback",
      content: "Sarah's experimental methodology was sound and her observations were detailed. The analysis section showed good understanding of the concepts. Recommendation: include more relevant literature in the discussion section.",
      preceptor: "Prof. Martinez"
    },
    {
      id: "F56789",
      studentName: "David Lee",
      course: "Physics 202",
      university: "California Institute of Technology",
      healthService: "University Hospital",
      clinicArea: "Orthopedics",
      date: "2023-10-05",
      feedbackType: "Exam Feedback",
      content: "David demonstrated strong understanding of core concepts. Calculations were accurate but needs to show more detailed work. Overall performance was above average.",
      preceptor: "Dr. Robinson"
    },
    {
      id: "F67890",
      studentName: "Jessica Brown",
      course: "Psychology 101",
      university: "University of Michigan",
      healthService: "Mental Health Clinic",
      clinicArea: "Psychology",
      date: "2023-09-25",
      feedbackType: "Presentation Feedback",
      content: "Jessica's presentation was well-organized and engaging. Her research on cognitive development was thorough. Recommendation: Work on pacing and eye contact with audience.",
      preceptor: "Prof. Anderson"
    },
    {
      id: "F78901",
      studentName: "Ryan Taylor",
      course: "Chemistry 202",
      university: "University of Washington",
      healthService: "Medical Research Center",
      clinicArea: "Oncology",
      date: "2023-08-15",
      feedbackType: "Lab Evaluation",
      content: "Ryan's lab work was methodical and precise. His analysis of chemical compounds showed deep understanding of the reactions. Could improve on documentation of experimental procedures.",
      preceptor: "Dr. Patel"
    },
    {
      id: "F89012",
      studentName: "Olivia Martinez",
      course: "Nursing 301",
      university: "Johns Hopkins University",
      healthService: "Community Clinic",
      clinicArea: "Family Medicine",
      date: "2023-07-10",
      feedbackType: "Clinical Assessment",
      content: "Olivia demonstrated excellent patient care skills and empathy. Her clinical notes were thorough and well-organized. Need to work on time management during busy clinic hours.",
      preceptor: "Dr. Johnson"
    }
  ];

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
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // 初始化数据
  useEffect(() => {
    const initializeData = async () => {
      try {
        // 模拟加载延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 按日期倒序排列
        const sortedFeedbacks = [...sampleFeedbacks].sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        
        setFeedbacks(sortedFeedbacks);
        setFilteredResults(sortedFeedbacks);
      } catch (err) {
        console.error("Error initializing data:", err);
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
  }, [
    universityFilter,
    healthServiceFilter,
    clinicAreaFilter,
    dateFilter,
  ]);

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
      results = results.filter((feedback) => feedback.university === universityFilter);
    }
    
    // 应用医疗服务筛选
    if (healthServiceFilter !== "all") {
      results = results.filter((feedback) => feedback.healthService === healthServiceFilter);
    }
    
    // 应用诊所区域筛选
    if (clinicAreaFilter !== "all") {
      results = results.filter((feedback) => feedback.clinicArea === clinicAreaFilter);
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
      
      results = results.filter((feedback) => new Date(feedback.date) >= filterDate);
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
        feedback.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.feedbackType.toLowerCase().includes(searchTerm.toLowerCase())
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

  // 处理点击反馈详情
  const handleFeedbackClick = (feedbackId) => {
    console.log(`View feedback details for ID: ${feedbackId}`);
    // 在实际应用中，这将导航到反馈详情页面
    // router.push(`/facilitator/feedback/${feedbackId}`);
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
                    placeholder="Search for feedback content, type, or student name"
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
                className="flex flex-col h-full cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => handleFeedbackClick(feedback.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{feedback.studentName}</CardTitle>
                    <Badge variant="outline">{feedback.course}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(feedback.date)}
                  </p>
                </CardHeader>
                <CardContent className="flex-grow">
                  <h3 className="font-medium mb-2">{feedback.feedbackType}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-4">{feedback.content}</p>
                </CardContent>
                <CardFooter className="border-t pt-3 text-xs text-muted-foreground">
                  Preceptor: {feedback.preceptor}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No feedback found matching your filters.</p>
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
