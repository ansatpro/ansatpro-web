"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
  Copy,
  FileOutput,
  RefreshCcw
} from "lucide-react";
import { format } from "date-fns";
// Import react-pdf related libraries
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
  section: {
    margin: 10,
    padding: 10
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
  heading1: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8
  },
  heading2: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6
  },
  paragraph: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 1.5
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 5
  },
  bulletPoint: {
    width: 15,
    fontSize: 12
  },
  listItemText: {
    flex: 1,
    fontSize: 12
  },
  editableContent: {
    fontFamily: 'Courier',
    fontSize: 10,
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

// PDF document component
const AISummaryPDF = ({ student, aiSummary, editableContent }) => {
  // Process Markdown content
  const renderMarkdownContent = () => {
    const lines = aiSummary.split('\n');
    const elements = [];
    
    lines.forEach((line, index) => {
      if (line.startsWith('# ')) {
        elements.push(
          <Text key={`h1-${index}`} style={styles.heading1}>
            {line.substring(2)}
          </Text>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <Text key={`h2-${index}`} style={styles.heading2}>
            {line.substring(3)}
          </Text>
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <View key={`li-${index}`} style={styles.listItem}>
            <Text style={styles.bulletPoint}>• </Text>
            <Text style={styles.listItemText}>{line.substring(2)}</Text>
          </View>
        );
      } else if (line.match(/^\d+\./)) {
        const num = line.split('.')[0];
        elements.push(
          <View key={`ol-${index}`} style={styles.listItem}>
            <Text style={styles.bulletPoint}>{num}. </Text>
            <Text style={styles.listItemText}>{line.substring(line.indexOf('.') + 1).trim()}</Text>
          </View>
        );
      } else if (line.trim() === '') {
        elements.push(<View key={`br-${index}`} style={{ height: 5 }} />);
      } else {
        elements.push(
          <Text key={`p-${index}`} style={styles.paragraph}>
            {line}
          </Text>
        );
      }
    });
    
    return elements;
  };
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Document title */}
        <View style={styles.header}>
          <Text style={styles.title}>AI Summary Report</Text>
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
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Health Service:</Text>
              <Text style={styles.tableValue}>{student.healthService}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Clinic Area:</Text>
              <Text style={styles.tableValue}>{student.clinicArea}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Period:</Text>
              <Text style={styles.tableValue}>{student.startDate} to {student.endDate}</Text>
            </View>
          </View>
        </View>
        
        {/* AI analysis results section */}
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>AI Analysis Results</Text>
          <View style={styles.contentBox}>
            {renderMarkdownContent()}
          </View>
        </View>
        
        {/* Editable content section - only displayed if there is content */}
        {editableContent && editableContent.trim() !== '' && (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <View style={styles.contentBox}>
              <Text style={styles.editableContent}>{editableContent}</Text>
            </View>
          </View>
        )}
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text>ANSAT Pro - Confidential Document - {format(new Date(), "yyyy-MM-dd")}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default function AISummaryPage() {
  const router = useRouter();
  const params = useParams();
  const docId = params.id;
  
  // State management
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // AI analysis results
  const [aiSummary, setAiSummary] = useState("");
  const [editableContent, setEditableContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Load student data from localStorage
  useEffect(() => {
    const loadStudentData = () => {
      try {
        if (!docId) {
          setError("Invalid document ID");
          setLoading(false);
          return;
        }
        
        // First try to load from ansatpro_current_student (set by the parent page)
        const currentStudentJson = localStorage.getItem('ansatpro_current_student');
        
        if (currentStudentJson) {
          try {
            const currentStudent = JSON.parse(currentStudentJson);
            console.log("Found current student in localStorage:", currentStudent);
            setStudent(currentStudent);
            
            // Generate mock AI results
            generateMockAISummary(currentStudent);
            
            setLoading(false);
            return;
          } catch (e) {
            console.error("Error parsing current student data:", e);
          }
        }
        
        // Try to load from selected student
        const selectedStudentJson = localStorage.getItem('ansatpro_selected_student');
        
        if (selectedStudentJson) {
          try {
            const selectedStudent = JSON.parse(selectedStudentJson);
            if (selectedStudent.docId === docId) {
              console.log("Found matching student in localStorage:", selectedStudent);
              setStudent(selectedStudent);
              
              // Generate mock AI results
              generateMockAISummary(selectedStudent);
              
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error("Error parsing student data from localStorage:", e);
          }
        }
        
        // If no matching student found, search in student list
        const studentsJson = localStorage.getItem('ansatpro_students');
        if (studentsJson) {
          try {
            const students = JSON.parse(studentsJson);
            if (Array.isArray(students)) {
              const foundStudent = students.find(s => s.docId === docId);
              
              if (foundStudent) {
                console.log("Found matching student in student list:", foundStudent);
                setStudent(foundStudent);
                
                // Generate mock AI results
                generateMockAISummary(foundStudent);
                
                setLoading(false);
                return;
              }
            }
          } catch (e) {
            console.error("Error parsing student list from localStorage:", e);
          }
        }
        
        // If still no match, use mock data
        console.log("No matching student found, using mock data");
        const mockStudent = {
          docId: docId,
          studentId: "S1000",
          studentName: "Unknown Student",
          studentUniversity: "Unknown University",
          healthService: "General Hospital",
          clinicArea: "General Practice",
          startDate: "2023-01-15",
          endDate: "2023-06-30"
        };
        
        setStudent(mockStudent);
        
        // Generate mock AI results
        generateMockAISummary(mockStudent);
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading student data:", error);
        setError(`Error loading student data: ${error.message}`);
        setLoading(false);
      }
    };
    
    loadStudentData();
  }, [docId]);
  
  // Generate mock AI summary
  const generateMockAISummary = (student) => {
    // Ensure student object has all needed fields, add default values if missing
    const enrichedStudent = {
      ...student,
      healthService: student.healthService || "General Hospital",
      clinicArea: student.clinicArea || "General Practice",
      startDate: student.startDate || "2023-01-15",
      endDate: student.endDate || "2023-06-30"
    };
    
    // Save enriched student data
    setStudent(enrichedStudent);
    
    const summary = `# Summary for ${enrichedStudent.studentName}

## Key Strengths
- Strong clinical reasoning skills demonstrated across multiple assessments
- Excellent patient communication and rapport building
- Thorough documentation practices with attention to detail

## Areas for Improvement
- Time management during complex patient encounters
- Confidence in decision-making under pressure
- Integration of theoretical knowledge with practical applications

## Overall Progress
The student has shown consistent improvement throughout the term, particularly in developing therapeutic relationships with patients and applying evidence-based practice. While initially hesitant in complex scenarios, ${enrichedStudent.studentName} has demonstrated growing competence and confidence in clinical decision-making.

## Recommendations
1. Additional practice in high-pressure clinical scenarios
2. Continued focus on integrating theoretical frameworks with practical applications
3. Regular reflection on time management strategies

This summary is based on ${Math.floor(Math.random() * 5) + 3} feedback reports from March to July 2023.`;

    setAiSummary(summary);
  };
  
  // Return to student detail page
  const handleBackClick = () => {
    router.push(`/facilitator/export/${docId}/studentDetail`);
  };
  
  // Copy AI summary content
  const handleCopyContent = () => {
    navigator.clipboard.writeText(aiSummary)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Unable to copy content: ', err);
      });
  };
  
  // Regenerate AI summary
  const handleRegenerate = async () => {
    setGenerating(true);
    
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Regenerate summary, using content from editable area as input
      let newSummary = "";
      
      if (editableContent.trim()) {
        // If user has provided content, generate based on it
        newSummary = `# AI Analysis of User Content\n\n${editableContent.substring(0, 100)}...\n\n## Key Points\n- Comprehensive assessment of clinical skills\n- Evidence of professional development\n- Structured feedback with actionable insights`;
      } else {
        // Otherwise randomly generate a new summary
        newSummary = `# Updated Summary for ${student.studentName}\n\n## Key Strengths\n- Demonstrates empathy and patient-centered care\n- Effective communication with healthcare team\n- Strong analytical skills in clinical situations\n\n## Areas for Growth\n- Further development of technical skills\n- Continued refinement of time management\n\nThis analysis includes the most recent feedback from preceptors and facilitators.`;
      }
      
      setAiSummary(newSummary);
    } catch (error) {
      console.error("Regeneration error:", error);
    } finally {
      setGenerating(false);
    }
  };
  
  // Export PDF using react-pdf
  const handleExport = async () => {
    setExporting(true);
    
    try {
      // Create date string
      const dateStr = format(new Date(), "yyyy-MM-dd");
      
      // Create filename
      const fileName = `${student.studentName}_AI_Summary_${dateStr}.pdf`;
      
      // Generate PDF blob
      const pdfBlob = await pdf(
        <AISummaryPDF 
          student={student} 
          aiSummary={aiSummary} 
          editableContent={editableContent.trim() !== '' ? editableContent : null} 
        />
      ).toBlob();
      
      // Use file-saver to save the file
      saveAs(pdfBlob, fileName);
    } catch (error) {
      console.error("Export error:", error);
      alert(`PDF generation error: ${error.message || 'Unknown error'}`);
    } finally {
      setExporting(false);
    }
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
          Return to Details Page
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
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
            <h1 className="text-3xl font-bold">AI Summary</h1>
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

        {/* Part 1: Student information card */}
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
              
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Health Service</p>
                  <p className="font-medium">{student.healthService}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Clinic Area</p>
                  <p className="font-medium">{student.clinicArea}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{student.startDate}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">{student.endDate}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Part 2: AI analysis results */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">AI Analysis Results</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyContent}
              className="gap-2"
            >
              {copied ? (
                <>
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 p-4 rounded-md whitespace-pre-wrap font-mono text-sm overflow-auto max-h-[400px]">
              {aiSummary || "No AI analysis available. Click 'Regenerate' to create a new analysis."}
            </div>
          </CardContent>
        </Card>
        
        {/* Part 3: Editable area */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Editable Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Please paste contents here first or add your notes..."
              className="min-h-[200px] font-mono text-sm"
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
            />
            <div className="text-right text-sm text-muted-foreground mt-2">
              Character count: {editableContent.length}
            </div>
          </CardContent>
        </Card>
        
        {/* Bottom buttons */}
        <div className="flex justify-between items-center mb-12">
          <Button 
            variant="outline" 
            onClick={handleRegenerate} 
            disabled={generating}
            className="gap-2"
          >
            {generating ? (
              <>Generating...</>
            ) : (
              <>
                <RefreshCcw className="h-4 w-4" />
                Regenerate
              </>
            )}
          </Button>
          
          <Button
            onClick={handleExport}
            disabled={exporting || !aiSummary}
            className="gap-2"
            id="download-btn"
          >
            {exporting ? (
              <>Exporting...</>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
