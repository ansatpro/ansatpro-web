"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Download, 
  ArrowLeft,
  FileText,
  Calendar,
  User,
  Copy,
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
import { GetAllStudentsWithDetails } from "../../../../../../../lib/HowToConnectToFunction";

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

// Helper function to format date as YYYY-MM-DD
const formatDateToYMD = (dateString) => {
  if (!dateString) return "Not Available";
  
  try {
    // Handle ISO date format from API (split at T to get just the date part)
    if (typeof dateString === 'string' && dateString.includes('T')) {
      dateString = dateString.split('T')[0];
      // If we now have a valid YYYY-MM-DD format, return it
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
    }
    
    // Try to parse the date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // If invalid date but still a string with something, return it
      return typeof dateString === 'string' && dateString.trim() ? dateString : "Not Available";
    }
    
    // Format date to YYYY-MM-DD
    return format(date, "yyyy-MM-dd");
  } catch (e) {
    console.error("Date formatting error:", e, "for date:", dateString);
    // Return original if processing fails
    return typeof dateString === 'string' ? dateString : "Not Available";
  }
};

// PDF document component
const AISummaryPDF = ({ student, aiSummary, editableContent }) => {
  const currentDate = format(new Date(), "dd MMMM yyyy");
  
  // Format dates for display in PDF
  const formattedStartDate = formatDateToYMD(student.startDate);
  const formattedEndDate = formatDateToYMD(student.endDate);
  
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
          <Text style={styles.title}>{student.studentName} - AI Summary Report</Text>
          <Text style={styles.subtitle}>Generated on {currentDate}</Text>
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
              <Text style={styles.tableValue}>{student.university}</Text>
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
              <Text style={styles.tableValue}>{formattedStartDate} to {formattedEndDate}</Text>
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
        
        {/* Editable content section - only if content exists */}
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
          <Text>ANSAT Pro - Confidential Document - {format(new Date(), "dd-MM-yyyy")}</Text>
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
  
  // Load student data from API and localStorage
  useEffect(() => {
    const loadStudentData = async () => {
      try {
        if (!docId) {
          setError("Invalid document ID");
          setLoading(false);
          return;
        }
        
        // First try to load from ansatpro_current_student (saved by parent page)
        const currentStudentJson = localStorage.getItem('ansatpro_current_student');
        
        if (currentStudentJson) {
          try {
            const currentStudent = JSON.parse(currentStudentJson);
            console.log("Found current student in localStorage:", currentStudent);
            
            // Make sure we have all required fields
            if (currentStudent) {
              const enrichedStudent = await enrichStudentData(currentStudent);
              setStudent(enrichedStudent);
              generateMockAISummary(enrichedStudent);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error("Error parsing current student data:", e);
          }
        }
        
        // Try to load from selected student in localStorage
        const selectedStudentJson = localStorage.getItem('ansatpro_selected_student');
        
        if (selectedStudentJson) {
          try {
            const selectedStudent = JSON.parse(selectedStudentJson);
            if (selectedStudent.docId === docId) {
              console.log("Found matching student in localStorage:", selectedStudent);
              
              const enrichedStudent = await enrichStudentData(selectedStudent);
              setStudent(enrichedStudent);
              generateMockAISummary(enrichedStudent);
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
                
                const enrichedStudent = await enrichStudentData(foundStudent);
                setStudent(enrichedStudent);
                generateMockAISummary(enrichedStudent);
                setLoading(false);
                return;
              }
            }
          } catch (e) {
            console.error("Error parsing student list from localStorage:", e);
          }
        }
        
        // If still not found, try to fetch from API
        try {
          const response = await GetAllStudentsWithDetails();
          console.log("API Response:", response); // Debugging line
          
          if (response && Array.isArray(response)) {
            const foundStudent = response.find(s => s.$id === docId || s.student_id === docId);
            
            if (foundStudent) {
              console.log("Found student from API:", foundStudent);
              
              // Additional date handling
              const startDate = foundStudent.start_date ? foundStudent.start_date : null;
              const endDate = foundStudent.end_date ? foundStudent.end_date : null;
              
              console.log("Extracted dates:", { startDate, endDate });
              
              const mappedStudent = {
                docId: foundStudent.$id || docId,
                studentId: foundStudent.student_id,
                studentName: `${foundStudent.first_name} ${foundStudent.last_name}`,
                university: foundStudent.university_id,
                healthService: foundStudent.health_service_id,
                clinicArea: foundStudent.clinic_area_id,
                startDate: startDate,
                endDate: endDate
              };
              
              const enrichedStudent = await enrichStudentData(mappedStudent);
              setStudent(enrichedStudent);
              generateMockAISummary(enrichedStudent);
              setLoading(false);
              return;
            }
          }
        } catch (apiError) {
          console.error("Error fetching student data from API:", apiError);
        }
        
        // If still not found, use mock data
        console.log("No matching student found, using mock data");
        const mockStudent = {
          docId: docId,
          studentId: "S1000",
          studentName: "John Smith",
          university: "University of Medicine",
          healthService: "General Hospital",
          clinicArea: "General Practice",
          startDate: "2023-01-15",
          endDate: "2023-06-30"
        };
        
        setStudent(mockStudent);
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
  
  // Helper function to ensure student data has all required fields
  const enrichStudentData = async (studentData) => {
    console.log("Enriching student data:", studentData);
    
    // Try to get missing data from the API, especially for dates
    if (!studentData.startDate || !studentData.endDate || 
        studentData.startDate === "N/A" || studentData.endDate === "N/A") {
      try {
        console.log("Trying to get dates from API for student:", studentData.studentId);
        const response = await GetAllStudentsWithDetails();
        
        if (response && Array.isArray(response)) {
          const foundStudent = response.find(s => 
            s.$id === studentData.docId || 
            s.student_id === studentData.studentId
          );
          
          if (foundStudent) {
            console.log("Found student in API:", foundStudent);
            
            // Get dates from API response
            const apiStartDate = foundStudent.start_date;
            const apiEndDate = foundStudent.end_date;
            
            console.log("API dates:", { apiStartDate, apiEndDate });
            
            // Update student data with API dates if available
            studentData = {
              ...studentData,
              startDate: studentData.startDate === "N/A" ? apiStartDate : studentData.startDate,
              endDate: studentData.endDate === "N/A" ? apiEndDate : studentData.endDate
            };
          }
        }
      } catch (error) {
        console.error("Error fetching dates from API:", error);
      }
    }
    
    // Format dates consistently
    const formattedStudent = {
      ...studentData,
      startDate: formatDateToYMD(studentData.startDate),
      endDate: formatDateToYMD(studentData.endDate)
    };
    
    console.log("Formatted student data:", formattedStudent);
    
    // If all fields exist, return as is
    if (
      formattedStudent.healthService && 
      formattedStudent.clinicArea && 
      formattedStudent.startDate && 
      formattedStudent.endDate !== "Not Available" && 
      formattedStudent.university
    ) {
      return formattedStudent;
    }
    
    // Try to get missing data from the API
    try {
      const response = await GetAllStudentsWithDetails();
      if (response && Array.isArray(response)) {
        const foundStudent = response.find(s => 
          s.$id === studentData.docId || 
          s.student_id === studentData.studentId
        );
        
        if (foundStudent) {
          return {
            ...formattedStudent,
            university: formattedStudent.university || foundStudent.university_id,
            healthService: formattedStudent.healthService || foundStudent.health_service_id,
            clinicArea: formattedStudent.clinicArea || foundStudent.clinic_area_id,
            startDate: formattedStudent.startDate !== "Not Available" ? 
              formattedStudent.startDate : formatDateToYMD(foundStudent.start_date),
            endDate: formattedStudent.endDate !== "Not Available" ? 
              formattedStudent.endDate : formatDateToYMD(foundStudent.end_date)
          };
        }
      }
    } catch (error) {
      console.error("Error fetching additional student data:", error);
    }
    
    // If API fetch fails, fill with defaults
    return {
      ...formattedStudent,
      university: formattedStudent.university || "Unknown University",
      healthService: formattedStudent.healthService || "General Hospital",
      clinicArea: formattedStudent.clinicArea || "General Practice",
      startDate: formattedStudent.startDate !== "Not Available" ? formattedStudent.startDate : "2023-01-15",
      endDate: formattedStudent.endDate !== "Not Available" ? formattedStudent.endDate : "2023-06-30"
    };
  };
  
  // Generate mock AI summary
  const generateMockAISummary = (student) => {
    const currentDate = format(new Date(), "dd MMMM yyyy");
    
    const summary = `# Performance Summary for ${student.studentName}

## Key Strengths
- Strong clinical reasoning skills demonstrated across multiple assessments
- Excellent patient communication and rapport building
- Thorough documentation practices with attention to detail

## Areas for Improvement
- Time management during complex patient encounters
- Confidence in decision-making under pressure
- Integration of theoretical knowledge with practical applications

## Overall Progress
The student has shown consistent improvement throughout the term, particularly in developing therapeutic relationships with patients and applying evidence-based practice. While initially hesitant in complex scenarios, ${student.studentName} has demonstrated growing competence and confidence in clinical decision-making.

## Recommendations
1. Additional practice in high-pressure clinical scenarios
2. Continued focus on integrating theoretical frameworks with practical applications
3. Regular reflection on time management strategies

This summary is based on ${Math.floor(Math.random() * 5) + 3} feedback reports collected between ${student.startDate} and ${student.endDate}.`;

    setAiSummary(summary);
  };
  
  // Return to search page
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
      
      // Regenerate summary, using editable area content as input if available
      let newSummary = "";
      const currentDate = format(new Date(), "dd MMMM yyyy");
      
      if (editableContent.trim()) {
        // If user provided content, generate based on it
        newSummary = `# AI Analysis of User Content for ${student.studentName}

## Key Insights
- Comprehensive assessment of clinical skills
- Evidence of professional development
- Structured feedback with actionable insights

## Strengths Identified
- Strong theoretical knowledge application
- Effective communication with healthcare team
- Patient-centered approach to care

## Areas for Development
- Further refinement of technical skills in ${student.clinicArea}
- Enhanced prioritization in high-pressure situations
- Continued development of leadership abilities

This analysis is based on content provided on ${currentDate} and integrates information from multiple feedback sources.`;
      } else {
        // Otherwise generate a new random summary
        newSummary = `# Updated Performance Summary for ${student.studentName}

## Key Strengths
- Demonstrates empathy and patient-centered care
- Effective communication with healthcare team
- Strong analytical skills in clinical situations

## Areas for Growth
- Further development of technical skills in ${student.clinicArea}
- Continued refinement of time management
- Building confidence in complex clinical scenarios

## Overall Assessment
${student.studentName} has demonstrated a solid foundation of clinical knowledge and skills during the placement at ${student.healthService}. Their approach to patient care is compassionate and thorough, with particular strength in establishing rapport with diverse patient populations.

## Recommendations
1. Seek opportunities for additional supervised practice in technical procedures
2. Develop strategies for managing complex cases with multiple priorities
3. Continue reflective practice to build clinical confidence

This updated analysis includes the most recent feedback from preceptors and facilitators, collected between ${student.startDate} and ${student.endDate}.`;
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
      // Create date string in DD-MM-YYYY format
      const dateStr = format(new Date(), "dd-MM-yyyy");
      
      // Format student data for PDF
      const pdfStudentData = {
        ...student,
        startDate: formatDateToYMD(student.startDate),
        endDate: formatDateToYMD(student.endDate)
      };
      
      // Create filename with student name and date
      const fileName = `${student.studentName}_AI_Summary_${dateStr}.pdf`;
      
      // Generate PDF blob
      const pdfBlob = await pdf(
        <AISummaryPDF 
          student={pdfStudentData} 
          aiSummary={aiSummary} 
          editableContent={editableContent.trim() !== '' ? editableContent : null} 
        />
      ).toBlob();
      
      // Save file using file-saver
      saveAs(pdfBlob, fileName);
      
      // Navigate to success page after brief delay to ensure file download starts
      setTimeout(() => {
        router.push("/facilitator/export/success");
      }, 500);
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
          Return to Details
        </Button>
      </div>
    );
  }

  // Format current date for display
  const formattedDate = format(new Date(), "dd MMMM yyyy");
  
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
          <div className="text-sm text-muted-foreground">
            Generated on {formattedDate}
          </div>
        </header>

        {/* Part 1: Student Information Card */}
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
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">University</p>
                  <p className="font-medium">{student.university}</p>
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
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Document ID</p>
                  <p className="font-medium">{student.docId}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{formatDateToYMD(student.startDate)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">{formatDateToYMD(student.endDate)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Part 3: AI Analysis Results */}
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
        
        {/* Part 4: Editable Content */}
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
            style={{color: '#000000', backgroundColor: '#ffffff', borderColor: '#d1d5db'}}
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
            style={{color: '#ffffff', backgroundColor: '#3b82f6', borderColor: '#3b82f6'}}
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
