"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Checkbox,
  CheckboxItem
} from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Home, 
  MessageSquareText, 
  Settings, 
  Users, 
  Download, 
  Bell, 
  LogOut,
  ChevronDown
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function ReviewFeedback() {
  const router = useRouter();
  const params = useParams();
  const feedbackId = params.id;
  
  // 状态管理
  const [comment, setComment] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemRatings, setItemRatings] = useState({});
  const [discussedWithStudent, setDiscussedWithStudent] = useState(null);
  const [discussionDate, setDiscussionDate] = useState(null);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedbackData, setFeedbackData] = useState(null);
  
  // 模拟的ANSAT评分项
  const ansatItems = Array.from({ length: 23 }, (_, i) => ({
    id: i + 1,
    title: `ANSAT评分项 ${i + 1}`,
    description: `这是ANSAT评分项${i + 1}的描述内容`
  }));
  
  // 模拟获取反馈数据
  useEffect(() => {
    const fetchFeedbackData = async () => {
      try {
        // 实际应用中应该从API获取数据
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setFeedbackData({
          id: feedbackId,
          date: "2020-02-05T19:32:00",
          studentName: "Joshua Davis",
          originalFeedback: "The student followed proper infection control procedures but needed guidance on sterile technique.",
          mappedAnsatItems: [
            { text: "infection control", status: "strength" },
            { text: "sterile technique", status: "improvement" }
          ]
        });
      } catch (error) {
        console.error("Error fetching feedback data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeedbackData();
  }, [feedbackId]);
  
  // 处理选择ANSAT项目
  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        // 如果取消选中，也删除对应的评分
        const newRatings = { ...itemRatings };
        delete newRatings[itemId];
        setItemRatings(newRatings);
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };
  
  // 处理设置评分
  const handleRatingSelect = (itemId, rating) => {
    setItemRatings(prev => ({
      ...prev,
      [itemId]: rating
    }));
  };
  
  // 处理提交
  const handleSubmit = async () => {
    // 验证所有选中的项目都有评分
    const allItemsRated = selectedItems.every(itemId => itemRatings[itemId]);
    
    if (!allItemsRated) {
      alert("请为所有选中的ANSAT项目进行评分");
      return;
    }
    
    if (discussedWithStudent === "yes" && !discussionDate) {
      alert("请选择与学生讨论的日期");
      return;
    }
    
    // 构建提交数据
    const submissionData = {
      feedbackId,
      selectedItems: selectedItems.map(itemId => ({
        itemId,
        rating: itemRatings[itemId]
      })),
      comment,
      discussedWithStudent,
      discussionDate: discussedWithStudent === "yes" ? discussionDate : null
    };
    
    console.log("提交数据:", submissionData);
    
    // 在实际应用中，这里应该调用API提交数据
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800));
      alert("提交成功");
      router.push("/facilitator/feedback");
    } catch (error) {
      console.error("提交失败:", error);
      alert("提交失败，请重试");
    }
  };
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">加载中...</p>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* 侧边栏导航 */}
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

      {/* 主内容区 */}
      <main className="flex-1 p-6">
        {/* 页面标题 */}
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">评审反馈</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
              <span className="sr-only">通知</span>
            </Button>
            <Button variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              退出登录
            </Button>
          </div>
        </header>

        {/* 反馈卡片 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">学生信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">日期和时间</p>
                <p className="font-medium">
                  {format(new Date(feedbackData.date), "yyyy年MM月dd日 HH:mm")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">学生姓名</p>
                <p className="font-medium">{feedbackData.studentName}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* 原始反馈 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">原始反馈</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              "{feedbackData.originalFeedback}"
            </p>
          </CardContent>
        </Card>
        
        {/* 映射的ANSAT项目 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">映射的ANSAT项目</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedbackData.mappedAnsatItems.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${item.status === 'strength' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                  <span className="font-medium">"{item.text}":</span>
                  <span>{item.status === 'strength' ? '优势' : '需要改进的地方'}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        {/* 评分部分 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">评分</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 评分描述 */}
            <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
              <p>1 = 未执行预期的行为和实践</p>
              <p>2 = 执行的预期行为和实践低于可接受/满意的标准</p>
              <p>3 = 执行的预期行为和实践达到满意/通过标准</p>
              <p>4 = 执行的预期行为和实践达到熟练标准</p>
              <p>5 = 执行的预期行为和实践达到优秀标准</p>
              <p>N/A = 未评估</p>
              <p className="font-bold mt-2">*注意: 评分为1或2表示未达到标准</p>
            </div>
            
            {/* ANSAT项目选择 */}
            <Collapsible
              open={isCollapsibleOpen}
              onOpenChange={setIsCollapsibleOpen}
              className="border rounded-md"
            >
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                  <span>
                    ANSAT项目 ({selectedItems.length > 0 ? `已选择 ${selectedItems.length}` : "23 项"})
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isCollapsibleOpen ? "transform rotate-180" : ""}`} />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 border-t space-y-4">
                  {ansatItems.map((item) => (
                    <div key={item.id} className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id={`item-${item.id}`} 
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => handleItemSelect(item.id)}
                        />
                        <Label 
                          htmlFor={`item-${item.id}`}
                          className="cursor-pointer font-medium"
                        >
                          {item.title}
                        </Label>
                      </div>
                      
                      {selectedItems.includes(item.id) && (
                        <div className="ml-6 bg-muted/30 p-2 rounded-md">
                          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4, 5, 'N/A'].map((rating) => (
                              <TooltipProvider key={rating}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant={itemRatings[item.id] === rating ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => handleRatingSelect(item.id, rating)}
                                    >
                                      {rating}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{rating === 'N/A' ? '未评估' : 
                                       `评分 ${rating}: ${['', '未执行', '低于标准', '满足标准', '熟练水平', '优秀水平'][rating]}`}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
        
        {/* 评论部分 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">评论</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="请输入评论"
              className="min-h-[120px]"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="text-right text-sm text-muted-foreground mt-2">
              字符数: {comment.length}
            </div>
          </CardContent>
        </Card>
        
        {/* 讨论部分 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">学生讨论</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>此反馈是否已与学生讨论?</p>
            
            <RadioGroup
              value={discussedWithStudent}
              onValueChange={setDiscussedWithStudent}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="discussed-yes" />
                <Label htmlFor="discussed-yes">是</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="discussed-no" />
                <Label htmlFor="discussed-no">否</Label>
              </div>
            </RadioGroup>
            
            {discussedWithStudent === "yes" && (
              <div className="pt-2">
                <p className="text-sm mb-2">请选择讨论日期</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !discussionDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {discussionDate ? format(discussionDate, "PPP") : "选择日期"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={discussionDate}
                      onSelect={setDiscussionDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* 操作按钮 */}
        <div className="flex justify-end">
          <Button onClick={handleSubmit} className="min-w-[120px]">
            提交
          </Button>
        </div>
      </main>
    </div>
  );
}
