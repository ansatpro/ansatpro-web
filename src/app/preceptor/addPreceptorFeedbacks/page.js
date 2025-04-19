"use client";

import { useState, useEffect } from 'react';
import { account, functions } from "../../appwrite";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/label';
import { CalendarIcon, Bell, User, Home, PlusCircle, FileText, Settings } from 'lucide-react';
import Link from 'next/link';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';

export default function PreceptorFeedbackForm() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [jwt, setJwt] = useState('');
    const [content, setContent] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [flagFacilitator, setFlagFacilitator] = useState(null);
    const [flagStudent, setFlagStudent] = useState(null);
    const [discussionDate, setDiscussionDate] = useState(null);
    const [status, setStatus] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await account.get();
                const jwt = localStorage.getItem("jwt");
                setUser(currentUser);
                setJwt(jwt);

                // 从localStorage获取选中的学生信息
                const storedStudent = localStorage.getItem('selectedStudent');
                if (storedStudent) {
                    const parsedStudent = JSON.parse(storedStudent);
                    console.log('Loaded student data:', parsedStudent); // 添加日志

                    // 验证学生数据
                    if (!parsedStudent.student_id) {
                        console.error('Invalid student data - missing student_id:', parsedStudent);
                        setStatus('❌ Invalid student data. Please go back and select a student again.');
                        return;
                    }

                    setSelectedStudent(parsedStudent);
                } else {
                    console.error('No student data found in localStorage');
                    setStatus('❌ No student selected. Please go back and select a student.');
                }
            } catch (err) {
                console.error('Auth error:', err);
                setStatus('❌ Authentication error. Please try again.');
            }
        };
        loadUser();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedStudent) {
            setStatus('❌ No student selected. Please go back and select a student.');
            return;
        }

        if (!content || !flagFacilitator || !flagStudent || (flagStudent === 'yes' && !discussionDate)) {
            setStatus('Please fill in all required fields');
            return;
        }

        setStatus('Submitting...');

        try {
            const payload = {
                student_document_id: selectedStudent.$id,
                preceptor_id: user.$id,
                content,
                flag_discuss_with_facilitator: flagFacilitator === 'yes',
                flag_discussed_with_student: flagStudent === 'yes',
                discussion_date: discussionDate ? format(discussionDate, 'yyyy-MM-dd') : null,
            };

            // Store payload in localStorage
            localStorage.setItem("preceptorPayload", JSON.stringify(payload));


            router.push(
                "/preceptor/preceptorAiFeedback"
            );

        } catch (err) {
            console.error(err);
            setStatus('❌ Submission failed.');
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 bottom-0 w-[100px] bg-white border-r">
                <div className="flex flex-col items-center pt-6">
                    <Link href="/" className="mb-8">
                        <img src="/logo.png" alt="ANSAT Pro" className="w-12 h-12" />
                        <span className="text-sm text-center mt-1 block">ANSAT Pro</span>
                    </Link>
                    <nav className="flex flex-col items-center gap-8">
                        <Link href="/preceptor/home" className="p-2 hover:bg-gray-100 rounded-lg">
                            <Home className="w-6 h-6 text-gray-600" />
                            <span className="text-xs mt-1 block">Home</span>
                        </Link>
                        <Link href="/preceptor/add-feedback" className="p-2 bg-blue-50 rounded-lg">
                            <PlusCircle className="w-6 h-6 text-[#3A6784]" />
                            <span className="text-xs mt-1 block">Add</span>
                        </Link>
                        <Link href="/preceptor/view-feedback" className="p-2 hover:bg-gray-100 rounded-lg">
                            <FileText className="w-6 h-6 text-gray-600" />
                            <span className="text-xs mt-1 block">Feedback</span>
                        </Link>
                        <Link href="/preceptor/settings" className="p-2 hover:bg-gray-100 rounded-lg">
                            <Settings className="w-6 h-6 text-gray-600" />
                            <span className="text-xs mt-1 block">Settings</span>
                        </Link>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-[100px] p-8">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold">Feedback</h1>
                        <div className="flex items-center gap-4">
                            <button className="p-2 hover:bg-gray-100 rounded-full">
                                <Bell className="w-5 h-5 text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-full">
                                <User className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Status Message */}
                    {status && (
                        <div className={`p-4 mb-6 rounded-lg ${status.startsWith('❌')
                            ? 'bg-red-50 text-red-600'
                            : status.startsWith('✅')
                                ? 'bg-green-50 text-green-600'
                                : 'bg-blue-50 text-blue-600'
                            }`}>
                            {status}
                        </div>
                    )}

                    {/* Student Info */}
                    {selectedStudent && (
                        <div className="mb-6">
                            <p className="text-gray-600">
                                Providing feedback for {selectedStudent.first_name} {selectedStudent.last_name}
                            </p>
                        </div>
                    )}

                    {/* Feedback Form */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Provide feedback on student's performance</h2>
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Input text"
                                className="min-h-[200px]"
                            />
                            <div className="text-sm text-gray-500 mt-2">
                                Character count: {content.length}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <p className="mb-4">Do you wish to discuss this feedback further with the facilitator?</p>
                                <RadioGroup
                                    value={flagFacilitator}
                                    onValueChange={setFlagFacilitator}
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="yes" id="facilitator-yes" />
                                        <Label htmlFor="facilitator-yes">Yes</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="no" id="facilitator-no" />
                                        <Label htmlFor="facilitator-no">No</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div>
                                <p className="mb-4">This feedback has been discussed with the student.</p>
                                <RadioGroup
                                    value={flagStudent}
                                    onValueChange={setFlagStudent}
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="yes" id="student-yes" />
                                        <Label htmlFor="student-yes">Yes</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="no" id="student-no" />
                                        <Label htmlFor="student-no">No</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {flagStudent === 'yes' && (
                                <div>
                                    <p className="mb-4">If Yes, please select the discussion date.</p>
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
                                                {discussionDate ? format(discussionDate, "PPP") : "Pick a date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
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
                        </div>

                        <div className="flex justify-center">
                            <Button
                                type="submit"
                                className="px-8 py-2 bg-[#3A6784] text-white rounded-md hover:bg-[#2d5268]"
                            >
                                Next
                            </Button>
                        </div>

                        {status && (
                            <div className={cn(
                                "text-center p-2 rounded",
                                status.includes('✅') ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                            )}>
                                {status}
                            </div>
                        )}
                    </form>
                </div>
            </main>
        </div>
    );
}
