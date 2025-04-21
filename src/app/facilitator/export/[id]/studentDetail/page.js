"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Home, 
  MessageSquareText, 
  Settings, 
  Users, 
  Download, 
  Bell, 
  LogOut,
  ArrowLeft,
  FileText,
  Calendar,
  User,
  Sparkles,
  FileOutput
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// 如果使用toast通知，需要导入toast组件
// 如果没有安装sonner，则使用自定义toast函数
const toast = {
  success: (message) => {
    console.log("Success:", message);
    // 如果有DOM环境，可以创建一个临时元素来显示toast
    if (typeof document !== 'undefined') {
      const toastEl = document.createElement('div');
      toastEl.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded shadow-lg z-50';
      toastEl.textContent = message;
      document.body.appendChild(toastEl);
      setTimeout(() => {
        toastEl.remove();
      }, 3000);
    }
  },
  error: (message) => {
    console.error("Error:", message);
    // 如果有DOM环境，可以创建一个临时元素来显示toast
    if (typeof document !== 'undefined') {
      const toastEl = document.createElement('div');
      toastEl.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded shadow-lg z-50';
      toastEl.textContent = message;
      document.body.appendChild(toastEl);
      setTimeout(() => {
        toastEl.remove();
      }, 3000);
    }
  }
};

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const docId = params.id; // 文档ID作为动态路由
  
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState({});
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [error, setError] = useState("");
  const [exportType, setExportType] = useState("");
  
  // 加载学生数据
  useEffect(() => {
    const loadStudentData = () => {
      try {
        if (!docId) {
          setError("无效的文档ID");
          setLoading(false);
          return;
        }
        
        // 首先尝试从localStorage加载选中的学生
        const selectedStudentJson = localStorage.getItem('ansatpro_selected_student');
        
        if (selectedStudentJson) {
          try {
            const selectedStudent = JSON.parse(selectedStudentJson);
            if (selectedStudent.docId === docId) {
              console.log("从localStorage中找到匹配的学生:", selectedStudent);
              setStudent(selectedStudent);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error("解析localStorage中的学生数据出错:", e);
          }
        }
        
        // 如果找不到匹配的学生，从学生列表中查找
        const studentsJson = localStorage.getItem('ansatpro_students');
        if (studentsJson) {
          try {
            const students = JSON.parse(studentsJson);
            if (Array.isArray(students)) {
              const foundStudent = students.find(s => s.docId === docId);
              
              if (foundStudent) {
                console.log("从学生列表中找到匹配的学生:", foundStudent);
                setStudent(foundStudent);
                setLoading(false);
                return;
              }
            } else {
              console.error("学生数据格式不正确，不是数组:", typeof students);
            }
          } catch (e) {
            console.error("解析localStorage中的学生列表出错:", e);
          }
        } else {
          console.error("localStorage中没有学生列表数据");
        }
        
        // 如果仍然找不到，使用模拟数据
        console.log("未找到匹配的学生，使用模拟数据");
        setStudent({
          docId: docId,
          studentId: "S1000",
          studentName: "Unknown Student",
          studentUniversity: "Unknown University",
          courses: [
            { code: "MED101", name: "Introduction to Medicine", year: "2023" },
            { code: "BIO240", name: "Human Anatomy", year: "2023" }
          ]
        });
        setLoading(false);
      } catch (error) {
        console.error("Error loading student data:", error);
        setError(`加载学生数据时出错: ${error.message}`);
        setLoading(false);
      }
    };
    
    loadStudentData();
  }, [docId]);
  
  // 返回到搜索页面
  const handleBackClick = () => {
    router.push("/facilitator/export");
  };
  
  // 处理生成AI摘要
  const handleGenerateAISummary = async () => {
    // 直接导航到AI摘要页面
    router.push(`/facilitator/export/${docId}/studentDetail/aiSummary`);
  };
  
  // 处理导出操作
  const handleExport = (type) => {
    setExportType(type);
    setShowExportDialog(true);
  };
  
  // 确认导出报告
  const confirmExport = async () => {
    if (!exportType) {
      toast.error("No export type selected");
      return;
    }
    
    if (!student) {
      toast.error("No student data available");
      return;
    }
    
    setExportLoading(prev => ({ ...prev, [exportType]: true }));
    
    try {
      // 根据不同的导出类型执行不同的逻辑
      if (exportType === "Preceptor Feedback") {
        await exportPreceptorFeedback();
      } else if (exportType === "Facilitator Review") {
        await exportFacilitatorFeedback();
      }
      
      setShowExportDialog(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("There was an error exporting the reports. Please try again.");
    } finally {
      setExportLoading(prev => ({ ...prev, [exportType]: false }));
    }
  };
  
  // 导出所有Preceptor反馈
  const exportPreceptorFeedback = async () => {
    // 模拟从localStorage或API获取反馈数据
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟获取的preceptor反馈列表
    const preceptorFeedbacks = generateMockFeedbacks("preceptor", 3);
    
    if (preceptorFeedbacks.length === 0) {
      toast.error("No preceptor feedback found for this student.");
      return;
    }
    
    // 为每个反馈生成PDF并下载
    for (let i = 0; i < preceptorFeedbacks.length; i++) {
      const feedback = preceptorFeedbacks[i];
      const fileName = `${student.studentName}_Preceptor_Feedback_${i+1}.pdf`;
      
      await generateAndDownloadPDF(fileName, feedback);
      
      // 小延迟，避免浏览器同时触发多个下载
      if (i < preceptorFeedbacks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    toast.success(`${preceptorFeedbacks.length} preceptor feedback reports have been downloaded.`);
  };
  
  // 导出所有Facilitator反馈
  const exportFacilitatorFeedback = async () => {
    // 模拟从localStorage或API获取反馈数据
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟获取的facilitator反馈列表
    const facilitatorFeedbacks = generateMockFeedbacks("facilitator", 2);
    
    if (facilitatorFeedbacks.length === 0) {
      toast.error("No facilitator feedback found for this student.");
      return;
    }
    
    // 为每个反馈生成PDF并下载
    for (let i = 0; i < facilitatorFeedbacks.length; i++) {
      const feedback = facilitatorFeedbacks[i];
      const fileName = `${student.studentName}_Facilitator_Feedback_${i+1}.pdf`;
      
      await generateAndDownloadPDF(fileName, feedback);
      
      // 小延迟，避免浏览器同时触发多个下载
      if (i < facilitatorFeedbacks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    toast.success(`${facilitatorFeedbacks.length} facilitator feedback reports have been downloaded.`);
  };
  
  // 生成并下载PDF
  const generateAndDownloadPDF = async (fileName, content) => {
    // 创建Blob对象
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    // 创建下载链接并触发点击
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };
  
  // 生成模拟反馈数据
  const generateMockFeedbacks = (type, count) => {
    const feedbacks = [];
    for (let i = 0; i < count; i++) {
      feedbacks.push({
        id: `${type}_feedback_${i+1}`,
        studentId: student.studentId,
        studentName: student.studentName,
        date: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 每隔30天一个
        type: type,
        content: `This is a sample ${type} feedback ${i+1} for ${student.studentName}`,
        score: Math.floor(Math.random() * 5) + 1,
        comments: `${type} comments for feedback ${i+1}`,
        reviewer: `${type.charAt(0).toUpperCase() + type.slice(1)} Reviewer ${i+1}`
      });
    }
    return feedbacks;
  };
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading student data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center flex-col">
        <p className="text-lg text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={handleBackClick}>
          返回搜索页面
        </Button>
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
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <MessageSquareText className="mr-2 h-4 w-4" />
            Feedback
          </Link>
          <Link
            href="/facilitator/export"
            className="flex items-center rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
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
            <h1 className="text-3xl font-bold">Student Details</h1>
          </div>
          
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

        {/* Student info card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Student ID</p>
                  <p className="font-medium">{student.studentId}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Student Name</p>
                  <p className="font-medium">{student.studentName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">University</p>
                  <p className="font-medium">{student.studentUniversity}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Document ID</p>
                  <p className="font-medium">{student.docId}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Export Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Export Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">Choose an export option for {student.studentName}'s reports:</p>
            
            <div className="flex flex-col md:flex-row gap-4">
              {/* AI Summary Button - Different color */}
              <Button 
                variant="default" 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={handleGenerateAISummary}
                disabled={exportLoading.aiSummary}
              >
                {exportLoading.aiSummary ? (
                  "Generating..."
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate AI Summary
                  </>
                )}
              </Button>
              
              {/* Export Preceptor Feedback Button */}
              <Button 
                variant="outline"
                onClick={() => handleExport("Preceptor Feedback")}
                disabled={exportLoading["Preceptor Feedback"]}
              >
                {exportLoading["Preceptor Feedback"] ? (
                  "Exporting..."
                ) : (
                  <>
                    <FileOutput className="mr-2 h-4 w-4" />
                    Export All Preceptor Feedback
                  </>
                )}
              </Button>
              
              {/* Export Facilitator Review Button */}
              <Button 
                variant="outline"
                onClick={() => handleExport("Facilitator Review")}
                disabled={exportLoading["Facilitator Review"]}
              >
                {exportLoading["Facilitator Review"] ? (
                  "Exporting..."
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export All Facilitator Review
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      
      {/* Export confirmation dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export {exportType}</DialogTitle>
            <DialogDescription>
              You are about to export {exportType} for {student?.studentName}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-2">Export Details:</p>
            <ul className="space-y-1 mb-4">
              <li className="flex items-start">
                <span className="font-medium mr-2">Student:</span> 
                <span>{student?.studentName}</span>
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">Export Type:</span> 
                <span>{exportType}</span>
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">Format:</span> 
                <span>PDF Document</span>
              </li>
            </ul>
            <p className="text-sm text-muted-foreground">
              This will generate and download a PDF report with all {exportType.toLowerCase()} data.
            </p>
          </div>
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={confirmExport}
              disabled={exportLoading[exportType]}
              className="gap-2"
            >
              {exportLoading[exportType] ? (
                "Processing..."
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
