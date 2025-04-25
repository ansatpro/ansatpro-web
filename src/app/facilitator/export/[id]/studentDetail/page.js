"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft,
  FileText,
  Calendar,
  User,
  Sparkles,
  FileOutput,
  Download,
  Bell,
  LogOut
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
import { format } from "date-fns";
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  PDFDownloadLink,
  Font
} from "@react-pdf/renderer";
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

// Register fonts
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' }
  ]
});

// Define PDF styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Roboto'
  },
  header: {
    textAlign: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 15
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    padding: 15,
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
    paddingBottom: 8,
    marginBottom: 12
  },
  infoTable: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%'
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5
  },
  tableLabel: {
    width: '35%',
    fontWeight: 'bold'
  },
  tableValue: {
    width: '65%'
  },
  contentContainer: {
    marginBottom: 20
  },
  contentBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#dddddd',
    padding: 15
  },
  paragraph: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 1.5
  },
  footer: {
    marginTop: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#dddddd',
    fontSize: 10,
    color: '#666666',
    textAlign: 'center'
  }
});

// PDF document component for exports
const ExportPDF = ({ student, exportType, content }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Document title */}
        <View style={styles.header}>
          <Text style={styles.title}>{exportType} Report</Text>
          <Text style={styles.subtitle}>Generated on {format(new Date(), "MMMM d, yyyy")}</Text>
        </View>
        
        {/* Student information section */}
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Student Information</Text>
          <View style={styles.infoTable}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Student ID:</Text>
              <Text style={styles.tableValue}>{student.studentId}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Student Name:</Text>
              <Text style={styles.tableValue}>{student.studentName}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>University:</Text>
              <Text style={styles.tableValue}>{student.studentUniversity}</Text>
            </View>
          </View>
        </View>
        
        {/* Content section */}
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>{exportType} Content</Text>
          <View style={styles.contentBox}>
            <Text style={styles.paragraph}>{content || `This is a ${exportType.toLowerCase()} report for ${student.studentName}.`}</Text>
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text>ANSAT Pro - Confidential Document - {format(new Date(), "yyyy-MM-dd")}</Text>
        </View>
      </Page>
    </Document>
  );
};

// Toast notification function
const toast = {
  success: (message) => {
    console.log("Success:", message);
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
    console.error("Error:", error);
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
  const docId = params.id; // Document ID from dynamic route
  
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState({});
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [error, setError] = useState("");
  const [exportType, setExportType] = useState("");
  
  // Load student data
  useEffect(() => {
    const loadStudentData = () => {
      try {
        if (!docId) {
          setError("Invalid document ID");
          setLoading(false);
          return;
        }
        
        // First try to load the selected student from localStorage
        const selectedStudentJson = localStorage.getItem('ansatpro_selected_student');
        
        if (selectedStudentJson) {
          try {
            const selectedStudent = JSON.parse(selectedStudentJson);
            if (selectedStudent.docId === docId) {
              console.log("Found matching student in localStorage:", selectedStudent);
              setStudent(selectedStudent);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error("Error parsing student data from localStorage:", e);
          }
        }
        
        // If no matching student found, search the student list
        const studentsJson = localStorage.getItem('ansatpro_students');
        if (studentsJson) {
          try {
            const students = JSON.parse(studentsJson);
            if (Array.isArray(students)) {
              const foundStudent = students.find(s => s.docId === docId);
              
              if (foundStudent) {
                console.log("Found matching student in student list:", foundStudent);
                setStudent(foundStudent);
                setLoading(false);
                return;
              }
            } else {
              console.error("Student data format incorrect, not an array:", typeof students);
            }
          } catch (e) {
            console.error("Error parsing student list from localStorage:", e);
          }
        } else {
          console.error("No student list data in localStorage");
        }
        
        // If still no match, use mock data
        console.log("No matching student found, using mock data");
        setStudent({
          docId: docId,
          studentId: "S1000",
          studentName: "Unknown Student",
          studentUniversity: "Unknown University",
          healthService: "General Hospital",
          clinicArea: "General Practice",
          startDate: "2023-01-15",
          endDate: "2023-06-30"
        });
        setLoading(false);
      } catch (error) {
        console.error("Error loading student data:", error);
        setError(`Error loading student data: ${error.message}`);
        setLoading(false);
      }
    };
    
    loadStudentData();
  }, [docId]);
  
  // Return to search page
  const handleBackClick = () => {
    router.push("/facilitator/export");
  };
  
  // Handle generating AI summary - Fixed navigation
  const handleGenerateAISummary = () => {
    try {
      // First, save current student data to localStorage for the AI Summary page to access
      if (student) {
        localStorage.setItem('ansatpro_current_student', JSON.stringify(student));
      }
      
      // Direct navigation with router
      router.push(`/facilitator/export/${docId}/studentDetail/aiSummary`);
    } catch (error) {
      console.error("AI Summary navigation error:", error);
      toast.error("Navigation error. Please try again.");
    }
  };
  
  // Handle export operation
  const handleExport = (type) => {
    setExportType(type);
    setShowExportDialog(true);
  };
  
  // Confirm export report using react-pdf
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
      // Create date string
      const dateStr = format(new Date(), "yyyy-MM-dd");
      
      // Create filename
      const fileName = `${student.studentName}_${exportType.replace(/\s+/g, '_')}_${dateStr}.pdf`;
      
      // Generate mock content based on export type
      const content = `This is a sample ${exportType} report for ${student.studentName} generated on ${dateStr}.
      
It includes information relevant to the student's performance and feedback received during their clinical placement.

The report is intended for educational purposes and provides a comprehensive overview of the student's progress.`;
      
      // Generate PDF blob
      const pdfBlob = await pdf(
        <ExportPDF 
          student={student} 
          exportType={exportType}
          content={content}
        />
      ).toBlob();
      
      // Use file-saver to save the file
      saveAs(pdfBlob, fileName);
      
      toast.success(`${exportType} has been exported successfully as PDF.`);
      
      // Close dialog
      setShowExportDialog(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`There was an error exporting the ${exportType}. Please try again.`);
    } finally {
      setExportLoading(prev => ({ ...prev, [exportType]: false }));
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-full gap-4">
        <p className="text-lg text-red-500">{error}</p>
        <Button onClick={handleBackClick} variant="outline">Return to Search</Button>
      </div>
    );
  }
  
  return (
    <div>
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
            {/* AI Summary Button - Fixed for direct navigation */}
            <Button 
              variant="default" 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleGenerateAISummary}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate AI Summary
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
            >
              {exportLoading[exportType] ? "Exporting..." : "Download PDF"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
