"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  LogOut
} from "lucide-react";

export default function StudentDetail() {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // 预设的学生数据
  const studentData = [
    {
      id: "S12345",
      name: "John Smith",
      studentId: "12345678",
      university: "Northland University",
      healthService: "Northland Health & Wellness Center",
      clinicArea: "Pediatrics",
      startDate: "2025-01-01",
      endDate: "2025-03-01"
    },
    {
      id: "S67890",
      name: "Emily Johnson",
      studentId: "67890123",
      university: "Central Medical College",
      healthService: "City General Hospital",
      clinicArea: "Cardiology",
      startDate: "2025-02-15",
      endDate: "2025-05-15"
    }
  ];

  // 模拟获取学生数据
  useEffect(() => {
    const getStudentData = async () => {
      try {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 在实际应用中，这里会从URL获取学生ID并从API获取数据
        // 这里假设我们显示第一个学生的数据
        setSelectedStudent(studentData[0]);
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    };

    getStudentData();
  }, []);

  // 处理复选框状态变化
  const handleConfirmChange = (checked) => {
    setConfirmed(checked);
  };

  // 处理下一步按钮点击
  const handleNextClick = () => {
    if (confirmed && selectedStudent) {
      // 在实际应用中，这里会导航到反馈表单页面
      router.push(`/facilitator/feedback/createFeedback/${selectedStudent.id}`);
    }
  };

  // 格式化日期显示
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
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
            View the student's feedback:
          </p>
        </header>
        
        {selectedStudent && (
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
                  Next
                </Button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
