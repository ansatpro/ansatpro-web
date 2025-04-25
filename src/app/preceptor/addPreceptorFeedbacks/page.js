"use client";

import { useState, useEffect } from 'react';
import { account, functions } from "../../appwrite";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/label';
import { CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { enGB } from "date-fns/locale"; // ✅ 加入英国 locale 实现 Mo → Su
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import PreceptorLayout from "@/components/layout/preceptorLayout";

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
    const [calendarOpen, setCalendarOpen] = useState(false); // ✅ 控制弹窗收起

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await account.get();
                const jwt = localStorage.getItem("jwt");
                setUser(currentUser);
                setJwt(jwt);

                const storedStudent = localStorage.getItem('selectedStudent');
                if (storedStudent) {
                    const parsedStudent = JSON.parse(storedStudent);
                    if (!parsedStudent.student_id) {
                        setStatus('❌ Invalid student data. Please go back and select a student again.');
                        return;
                    }
                    setSelectedStudent(parsedStudent);
                } else {
                    setStatus('❌ No student selected. Please go back and select a student.');
                }
            } catch (err) {
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

            localStorage.setItem("preceptorPayload", JSON.stringify(payload));
            router.push("/preceptor/preceptorAiFeedback");

        } catch (err) {
            console.error(err);
            setStatus('❌ Submission failed.');
        }
    };

    return (
        <PreceptorLayout>
            <main className="p-8">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold font-['Roboto']">Feedback</h1>
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
                            <p className="text-gray-600 font-['Roboto']">
                                For {selectedStudent.first_name} {selectedStudent.last_name}
                            </p>
                        </div>
                    )}

                    {/* Feedback Form */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <h2 className="text-lg font-semibold mb-4 font-['Roboto']">Provide feedback on student's performance</h2>
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Input text"
                                className="min-h-[200px] font-['Roboto']"
                            />
                            <div className="text-sm text-gray-500 mt-2 font-['Roboto']">
                                Word count: {content.trim().split(/\s+/).filter(Boolean).length}
                            </div>
                        </div>

                        <div className="space-y-6 font-['Roboto']">
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
                                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
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
                                                onSelect={(date) => {
                                                    setDiscussionDate(date);
                                                    setCalendarOpen(false);
                                                }}
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
                                className="w-full max-w-md px-6 py-3 rounded-lg bg-[#3A6784] hover:bg-[#2d5268] text-white text-base font-semibold font-['Roboto'] transition-transform duration-200 hover:scale-105"
                            >
                                Continue
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </PreceptorLayout>
    );
}
