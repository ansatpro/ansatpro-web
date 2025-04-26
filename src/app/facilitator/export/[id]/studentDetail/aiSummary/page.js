"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Download, 
  Bell, 
  LogOut,
  ArrowLeft,
  FileText,
  Calendar,
  User,
  Copy,
  RefreshCcw
} from "lucide-react";
import { format } from "date-fns";
// 导入react-pdf相关库
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

// 注册字体
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' }
  ]
});

// 定义PDF样式
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

// PDF文档组件
const AISummaryPDF = ({ student, aiSummary, editableContent }) => {
  // 处理Markdown内容
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
        {/* 文档标题 */}
        <View style={styles.header}>
          <Text style={styles.title}>AI Summary Report</Text>
          <Text style={styles.subtitle}>Generated on {format(new Date(), "MMMM d, yyyy")}</Text>
        </View>
        
        {/* 学生信息部分 */}
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
        
        {/* AI分析结果部分 */}
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>AI Analysis Results</Text>
          <View style={styles.contentBox}>
            {renderMarkdownContent()}
          </View>
        </View>
        
        {/* 可编辑内容部分 - 如果有内容才显示 */}
        {editableContent && editableContent.trim() !== '' && (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <View style={styles.contentBox}>
              <Text style={styles.editableContent}>{editableContent}</Text>
            </View>
          </View>
        )}
        
        {/* 页脚 */}
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
  
  // 状态管理
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // AI 分析结果
  const [aiSummary, setAiSummary] = useState("");
  const [editableContent, setEditableContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // 从localStorage加载学生数据
  useEffect(() => {
    const loadStudentData = () => {
      try {
        if (!docId) {
          setError("无效的文档ID");
          setLoading(false);
          return;
        }
        
        // 首先尝试从ansatpro_current_student加载（由父页面保存的）
        const currentStudentJson = localStorage.getItem('ansatpro_current_student');
        
        if (currentStudentJson) {
          try {
            const currentStudent = JSON.parse(currentStudentJson);
            console.log("从localStorage中找到当前学生:", currentStudent);
            setStudent(currentStudent);
            
            // 模拟AI生成的结果
            generateMockAISummary(currentStudent);
            
            setLoading(false);
            return;
          } catch (e) {
            console.error("解析当前学生数据出错:", e);
          }
        }
        
        // 首先尝试从localStorage加载选中的学生
        const selectedStudentJson = localStorage.getItem('ansatpro_selected_student');
        
        if (selectedStudentJson) {
          try {
            const selectedStudent = JSON.parse(selectedStudentJson);
            if (selectedStudent.docId === docId) {
              console.log("从localStorage中找到匹配的学生:", selectedStudent);
              setStudent(selectedStudent);
              
              // 模拟AI生成的结果
              generateMockAISummary(selectedStudent);
              
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
                
                // 模拟AI生成的结果
                generateMockAISummary(foundStudent);
                
                setLoading(false);
                return;
              }
            }
          } catch (e) {
            console.error("解析localStorage中的学生列表出错:", e);
          }
        }
        
        // 如果仍然找不到，使用模拟数据
        console.log("未找到匹配的学生，使用模拟数据");
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
        
        // 模拟AI生成的结果
        generateMockAISummary(mockStudent);
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading student data:", error);
        setError(`加载学生数据时出错: ${error.message}`);
        setLoading(false);
      }
    };
    
    loadStudentData();
  }, [docId]);
  
  // 模拟AI生成的摘要
  const generateMockAISummary = (student) => {
    // 确保学生对象有所有需要的字段，没有的话添加默认值
    const enrichedStudent = {
      ...student,
      healthService: student.healthService || "General Hospital",
      clinicArea: student.clinicArea || "General Practice",
      startDate: student.startDate || "2023-01-15",
      endDate: student.endDate || "2023-06-30"
    };
    
    // 保存扩展后的学生数据
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
  
  // 返回到搜索页面
  const handleBackClick = () => {
    router.push(`/facilitator/export/${docId}/studentDetail`);
  };
  
  // 复制AI摘要内容
  const handleCopyContent = () => {
    navigator.clipboard.writeText(aiSummary)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('无法复制内容: ', err);
      });
  };
  
  // 重新生成AI摘要
  const handleRegenerate = async () => {
    setGenerating(true);
    
    try {
      // 模拟AI处理时间
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 重新生成摘要，这里使用编辑区域的内容作为输入
      let newSummary = "";
      
      if (editableContent.trim()) {
        // 如果用户提供了内容，基于它生成
        newSummary = `# AI Analysis of User Content\n\n${editableContent.substring(0, 100)}...\n\n## Key Points\n- Comprehensive assessment of clinical skills\n- Evidence of professional development\n- Structured feedback with actionable insights`;
      } else {
        // 否则随机生成一个新摘要
        newSummary = `# Updated Summary for ${student.studentName}\n\n## Key Strengths\n- Demonstrates empathy and patient-centered care\n- Effective communication with healthcare team\n- Strong analytical skills in clinical situations\n\n## Areas for Growth\n- Further development of technical skills\n- Continued refinement of time management\n\nThis analysis includes the most recent feedback from preceptors and facilitators.`;
      }
      
      setAiSummary(newSummary);
    } catch (error) {
      console.error("Regeneration error:", error);
    } finally {
      setGenerating(false);
    }
  };
  
  // 使用react-pdf导出PDF
  const handleExport = async () => {
    setExporting(true);
    
    try {
      // 创建日期字符串
      const dateStr = format(new Date(), "yyyy-MM-dd");
      
      // 创建文件名
      const fileName = `${student.studentName}_AI_Summary_${dateStr}.pdf`;
      
      // 生成PDF blob
      const pdfBlob = await pdf(
        <AISummaryPDF 
          student={student} 
          aiSummary={aiSummary} 
          editableContent={editableContent.trim() !== '' ? editableContent : null} 
        />
      ).toBlob();
      
      // 使用file-saver保存文件
      saveAs(pdfBlob, fileName);
    } catch (error) {
      console.error("Export error:", error);
      alert(`PDF生成出错: ${error.message || '未知错误'}`);
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
          返回详情页面
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
        </header>

        {/* 第一部分: 学生信息卡片 */}
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
        
        {/* 第三部分: AI分析结果 */}
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
        
        {/* 第四部分: 可编辑区域 */}
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
        
        {/* 底部按钮 */}
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
