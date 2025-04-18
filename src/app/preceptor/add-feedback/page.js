"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, User, LayoutDashboard, X } from "lucide-react";
import { functions, account } from "../../appwrite";

export default function SearchStudent() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 获取所有必要的数据
    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentUser = await account.get(); // 验证用户登录状态
                const token = await account.createJWT();
                
                // 获取学生数据
                const res = await functions.createExecution(
                    '67ffd00400174f76be85',
                    JSON.stringify({
                        jwt: token.jwt,
                        action: 'searchStudents',
                        payload: { query: searchQuery }
                    })
                );

                const data = JSON.parse(res.responseBody);
                if (data.status === 'success') {
                    setStudents(data.data || []);
                } else {
                    setError(data.message || "Failed to load students");
                }
                setLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load data");
                setLoading(false);
            }
        };

        if (searchQuery.length >= 2) {
            fetchData();
        } else {
            setStudents([]);
        }
    }, [searchQuery]);

    // 清除搜索
    const clearSearch = () => {
        setSearchQuery("");
        setSelectedStudent(null);
        setIsConfirmed(false);
    };

    if (loading && searchQuery.length >= 2) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-gray-600">Loading students...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Top Bar */}
            <header className="fixed top-0 left-0 right-0 h-14 bg-white z-50">
                <div className="h-full px-6 flex justify-between items-center">
                    <Link href="/preceptor/home" className="flex items-center">
                        <LayoutDashboard className="h-8 w-8 text-[#3A6784]" />
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link href="/preceptor/notifications" className="hover:bg-gray-50 p-2 rounded-full transition-colors">
                            <Bell className="h-5 w-5 text-gray-600" />
                        </Link>
                        <Link href="/preceptor/settings" className="hover:bg-gray-50 p-2 rounded-full transition-colors">
                            <User className="h-5 w-5 text-gray-600" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-20 px-6 max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">STUDENT DETAIL</h1>
                    <p className="text-gray-600">Search for a student by student name</p>
                </div>

                {/* Search Box */}
                <div className="relative mb-8">
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Search for a student"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-6 pl-4 pr-10 bg-gray-50 rounded-lg"
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>

                    {/* Search Results */}
                    {searchQuery && students.length > 0 && !selectedStudent && (
                        <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg z-10">
                            {students.map((student) => (
                                <button
                                    key={student.$id}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                                    onClick={() => setSelectedStudent(student)}
                                >
                                    {student.first_name} {student.last_name} ({student.student_id})
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Selected Student Details */}
                {selectedStudent && (
                    <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-4">
                            {selectedStudent.first_name} {selectedStudent.last_name}
                        </h2>
                        <div className="space-y-2 text-gray-600">
                            <p>Student ID: {selectedStudent.student_id}</p>
                            <p>Institution: {selectedStudent.institution || 'Not assigned'}</p>
                            <p>Clinic Area: {selectedStudent.clinic_area || 'Not assigned'}</p>
                            <p>Email: {selectedStudent.email || 'Not available'}</p>
                            <p>Start Date: {selectedStudent.start_date ? new Date(selectedStudent.start_date).toLocaleDateString() : 'Not set'}</p>
                            <p>End Date: {selectedStudent.end_date ? new Date(selectedStudent.end_date).toLocaleDateString() : 'Not set'}</p>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="confirmation"
                                    checked={isConfirmed}
                                    onCheckedChange={setIsConfirmed}
                                />
                                <label
                                    htmlFor="confirmation"
                                    className="text-sm text-gray-600"
                                >
                                    I have reviewed the student details above and confirm I am entering feedback for the correct student.
                                </label>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    onClick={clearSearch}
                                    className="mr-2"
                                >
                                    Clear Selection
                                </Button>
                                <Button
                                    disabled={!isConfirmed}
                                    onClick={() => {
                                        if (selectedStudent && isConfirmed) {
                                            localStorage.setItem('selectedStudent', JSON.stringify(selectedStudent));
                                            window.location.href = '/auth/addPreceptorFeedbacks';
                                        }
                                    }}
                                >
                                    Continue to Feedback
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
} 