"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Home, 
  MessageSquareText, 
  Settings, 
  Users, 
  Download, 
  Bell, 
  LogOut, 
  FileOutput, 
  Sparkles
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

export default function StudentDetail() {
  const router = useRouter();
  const params = useParams();
  const feedbackId = params.id; // 获取URL中的ID参数
  
  const [confirmed, setConfirmed] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackData, setFeedbackData] = useState(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportType, setExportType] = useState('');
  const [exportLoading, setExportLoading] = useState({
    'aiSummary': false,
    'Preceptor Feedback': false,
    'Facilitator Review': false
  });

  // 预设的反馈数据（用作后备数据）
  const sampleFeedbacks = [
    {
      id: "F89012",
      studentName: "Olivia Martinez",
      ismarked: "Marked",
      is_marked: true,
      university: "Johns Hopkins University",
      healthService: "Community Clinic",
      clinicArea: "Family Medicine",
      date: "2023-07-10",
      content: "Olivia demonstrated excellent patient care skills and empathy. Her clinical notes were thorough and well-organized. Need to work on time management during busy clinic hours.",
      preceptor: "Dr. Johnson",
      studentId: "ST12345",
      startDate: "2023-05-01",
      endDate: "2023-08-30"
    },
    {
      id: "F89013",
      studentName: "Michael Brown",
      ismarked: "Unmarked",
      is_marked: false,
      university: "Stanford University",
      healthService: "Memorial Hospital",
      clinicArea: "Cardiology",
      date: "2023-08-05",
      content: "Michael shows promising clinical reasoning skills. He effectively communicates with patients and staff. Needs to improve documentation completeness and timeliness.",
      preceptor: "Dr. Williams",
      studentId: "ST67890",
      startDate: "2023-06-15",
      endDate: "2023-09-15"
    }
  ];

  // 获取反馈和学生数据
  useEffect(() => {
    const fetchFeedbackData = async () => {
      try {
        // 尝试首先从localStorage获取当前反馈
        const storedCurrentFeedback = localStorage.getItem('ansatpro_current_feedback');
        
        if (storedCurrentFeedback) {
          const currentFeedback = JSON.parse(storedCurrentFeedback);
          
          // 检查是否是我们需要的反馈ID
          if (currentFeedback.id === feedbackId) {
            console.log("Using feedback data from localStorage");
            setFeedbackData(currentFeedback);
            
            // 创建学生详情对象
            const studentDetails = {
              name: currentFeedback.studentName,
              studentId: currentFeedback.studentId || `ID-${currentFeedback.id}`,
              university: currentFeedback.university,
              healthService: currentFeedback.healthService,
              clinicArea: currentFeedback.clinicArea,
              startDate: currentFeedback.startDate,
              endDate: currentFeedback.endDate
            };
            
            setSelectedStudent(studentDetails);
            setLoading(false);
            return;
          }
        }
        
        // 如果未找到当前反馈，尝试从所有反馈列表中获取
        const storedFeedbacks = localStorage.getItem('ansatpro_feedbacks');
        
        if (storedFeedbacks) {
          const feedbacks = JSON.parse(storedFeedbacks);
          const feedback = feedbacks.find(f => f.id === feedbackId);
          
          if (feedback) {
            console.log("Using feedback data from stored feedbacks list");
            setFeedbackData(feedback);
            
            // 创建学生详情对象
            const studentDetails = {
              name: feedback.studentName,
              studentId: feedback.studentId || `ID-${feedback.id}`,
              university: feedback.university,
              healthService: feedback.healthService,
              clinicArea: feedback.clinicArea,
              startDate: feedback.startDate,
              endDate: feedback.endDate
            };
            
            setSelectedStudent(studentDetails);
            setLoading(false);
            return;
          }
        }
        
        // 如果localStorage中没有数据，回退到模拟数据
        console.log("Using fallback data");
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 查找反馈
        const feedback = sampleFeedbacks.find(f => f.id === feedbackId);
        
        if (feedback) {
          setFeedbackData(feedback);
          
          // 创建学生详情对象
          const studentDetails = {
            name: feedback.studentName,
            studentId: feedback.studentId || `ID-${feedback.id}`,
            university: feedback.university,
            healthService: feedback.healthService,
            clinicArea: feedback.clinicArea,
            startDate: feedback.startDate,
            endDate: feedback.endDate
          };
          
          setSelectedStudent(studentDetails);
        } else {
          console.error("Feedback not found with ID:", feedbackId);
        }
      } catch (error) {
        console.error("Error fetching feedback data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (feedbackId) {
      fetchFeedbackData();
    }
  }, [feedbackId]);

  // 处理复选框状态变化
  const handleConfirmChange = (checked) => {
    setConfirmed(checked);
  };

  // 处理下一步按钮点击
  const handleNextClick = () => {
    if (confirmed && feedbackData) {
      // 根据反馈标记状态决定下一步去向
      if (feedbackData.is_marked) {
        // 已标记，跳转到查看页面
        router.push(`/facilitator/feedback/${feedbackId}/studentDetail/reviewFeedback`);
      } else {
        // 未标记，跳转到创建页面
        router.push(`/facilitator/feedback/${feedbackId}/studentDetail/createFeedback`);
      }
    }
  };

  // 格式化日期显示
  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString || "N/A";
    }
  };

  // New functions for export functionality
  const handleGenerateAISummary = () => {
    setExportLoading(prev => ({ ...prev, aiSummary: true }));
    
    // Simulate AI summary generation
    setTimeout(() => {
      // Create a temporary text file with AI summary
      const summaryText = `AI Summary for ${selectedStudent.name}
Student ID: ${selectedStudent.studentId}
University: ${selectedStudent.university}
Health Service: ${selectedStudent.healthService}
Clinic Area: ${selectedStudent.clinicArea}

This is a simulated AI summary of the student's feedback. In a production environment, 
this would contain an actual AI-generated analysis of the student's performance based on 
their feedback data and assessments.

Generated on: ${new Date().toLocaleDateString()}`;
      
      // Create a blob and download link
      const blob = new Blob([summaryText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedStudent.name.replace(/\s+/g, '_')}_AI_Summary.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setExportLoading(prev => ({ ...prev, aiSummary: false }));
    }, 2000);
  };

  const handleExport = (type) => {
    setExportType(type);
    setShowExportDialog(true);
  };

  const confirmExport = () => {
    setExportLoading(prev => ({ ...prev, [exportType]: true }));
    setShowExportDialog(false);
    
    // Simulate PDF generation and download
    setTimeout(() => {
      alert(`${exportType} for ${selectedStudent.name} has been generated. In a production environment, this would download a PDF file.`);
      setExportLoading(prev => ({ ...prev, [exportType]: false }));
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  // 如果未找到反馈数据
  if (!feedbackData || !selectedStudent) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Feedback Not Found</h2>
          <p className="text-muted-foreground mb-6">Unable to find feedback with ID: {feedbackId}</p>
          <Button onClick={() => router.push('/facilitator/feedback')}>
            Return to Feedback List
          </Button>
        </div>
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
          <Link href="/facilitator/home" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
          <Link href="/facilitator/student" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            <Users className="mr-2 h-4 w-4" />
            Student
          </Link>
          <Link href="/facilitator/feedback" className="flex items-center rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">
            <MessageSquareText className="mr-2 h-4 w-4" />
            Feedback
          </Link>
          <Link href="/facilitator/report" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            <Download className="mr-2 h-4 w-4" />
            Report
          </Link>
          <Link href="/facilitator/settings" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </nav>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 p-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Student Details</h1>
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
          </div>
          
          <p className="text-lg text-muted-foreground mb-6">
            View the student's feedback: <span className="font-medium">{feedbackData.is_marked ? "Marked" : "Unmarked"}</span>
          </p>
        </header>
        
        <div className="space-y-8">
          
          
          {/* Student Card */}
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle className="text-2xl">{selectedStudent.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Student ID</p>
                  <p className="font-medium">{selectedStudent.studentId}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">University</p>
                  <p className="font-medium">{selectedStudent.university}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Assigned Health Service</p>
                  <p className="font-medium">{selectedStudent.healthService}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Assigned Clinic Area</p>
                  <p className="font-medium">{selectedStudent.clinicArea}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Placement Start Date</p>
                  <p className="font-medium">{formatDate(selectedStudent.startDate)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Placement End Date</p>
                  <p className="font-medium">{formatDate(selectedStudent.endDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Export Options Card */}
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle className="text-xl">Export Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">Choose an export option for {selectedStudent.name}'s data:</p>
              
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
          
          {/* Confirmation */}
          <div className="pt-6 border-t">
            <div className="flex items-center space-x-2 mb-6">
              <Checkbox 
                id="confirmation" 
                checked={confirmed} 
                onCheckedChange={handleConfirmChange}
              />
              <Label 
                htmlFor="confirmation" 
                className="text-sm"
              >
                I have reviewed the student's details above and confirm I am reviewing the feedback and determining the ANSAT scoring for the correct student.
              </Label>
            </div>
            
            {confirmed && (
              <Button onClick={handleNextClick} className="mt-4">
                {feedbackData.is_marked ? "Review Feedback" : "Create Feedback"}
              </Button>
            )}
          </div>
        </div>
      </main>
      
      {/* Export confirmation dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export {exportType}</DialogTitle>
            <DialogDescription>
              You are about to export {exportType} for {selectedStudent?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-2">Export Details:</p>
            <ul className="space-y-1 mb-4">
              <li className="flex items-start">
                <span className="font-medium mr-2">Student:</span> 
                <span>{selectedStudent?.name}</span>
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
            >
              {exportLoading[exportType] ? "Exporting..." : "Download PDF"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
