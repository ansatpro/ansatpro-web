"use client";

import { useEffect, useState, useMemo } from "react";
import debounce from 'lodash.debounce';
import { account, functions } from "../../appwrite";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function SearchStudentPage() {
    const [user, setUser] = useState(null);
    const [jwtToken, setJwtToken] = useState(null);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const router = useRouter();

    // Run once on mount: check session & get JWT
    useEffect(() => {
        const checkSession = async () => {
            try {
                const currentUser = await account.get();
                setUser(currentUser);
                const token = await account.createJWT();
                setJwtToken(token.jwt);
            } catch (err) {
                console.error("Session Error:", err);
                router.push('/auth/login');
            }
        };
        checkSession();
    }, [router]);

    // Debounced search effect
    const debouncedSearch = useMemo(() => debounce(async (value) => {
        if (!jwtToken || value.length < 2) return;

        setIsLoading(true);
        try {
            const res = await functions.createExecution(
                '67ffd00400174f76be85',
                JSON.stringify({
                    jwt: jwtToken,
                    action: 'searchStudents',
                    payload: { query: value }
                })
            );

            const data = JSON.parse(res.responseBody);
            if (data.status === 'success') {
                setStudents(data.data || []);
            } else {
                console.error("Function returned error:", data.message);
                setStudents([]);
            }
        } catch (err) {
            console.error("Search failed:", err.message);
            setStudents([]);
        } finally {
            setIsLoading(false);
        }
    }, 500), [jwtToken]);

    // Trigger search when query changes
    useEffect(() => {
        if (query.length >= 2) {
            debouncedSearch(query);
        } else {
            setStudents([]);
        }
        return () => debouncedSearch.cancel();
    }, [query, debouncedSearch]);

    // Handle student selection
    const handleSelectStudent = async (student) => {
        try {
            // 使用选中的学生数据直接显示，因为搜索结果已经包含了完整信息
            setSelectedStudent(student);
            setQuery(`${student.first_name} ${student.last_name}`);
            setStudents([]); // 清空搜索结果列表
        } catch (error) {
            console.error("Error selecting student:", error);
        }
    };

    // Clear search and selection
    const clearSearch = () => {
        setQuery('');
        setStudents([]);
        setSelectedStudent(null);
    };

    if (!user) return null;

    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 p-4">
            <Card className="w-full max-w-2xl mt-10">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">STUDENT DETAIL</CardTitle>
                    <p className="text-center text-gray-600 mt-2">Search for a student by student name</p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Search Input */}
                        <div className="relative mb-8">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search students by name"
                                    className="w-full pl-10 pr-10 py-6 bg-white"
                                />
                                {query && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                            </div>

                            {/* Loading State */}
                            {isLoading && (
                                <p className="text-gray-500 text-sm text-center">Searching...</p>
                            )}

                            {/* Search Results */}
                            {!selectedStudent && students.length > 0 && (
                                <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg z-10">
                                    {students.map((student) => (
                                        <button
                                            key={student.$id}
                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                                            onClick={() => handleSelectStudent(student)}
                                        >
                                            {student.first_name} {student.last_name}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* No Results Message */}
                            {!isLoading && query.length >= 2 && students.length === 0 && !selectedStudent && (
                                <p className="text-sm text-gray-500 text-center">No students found.</p>
                            )}
                        </div>

                        {/* Selected Student Information Card */}
                        {selectedStudent && (
                            <div className="mt-6 bg-white p-6 border rounded-lg shadow">
                                <h2 className="text-xl font-semibold mb-4">Student Information</h2>
                                <table className="w-full text-left">
                                    <tbody className="space-y-3">
                                        <tr>
                                            <td className="font-medium pr-4 py-2">Full Name:</td>
                                            <td>{selectedStudent.first_name} {selectedStudent.last_name}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-medium pr-4 py-2">Student ID:</td>
                                            <td>{selectedStudent.student_id}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-medium pr-4 py-2">Institution:</td>
                                            <td>{selectedStudent.university || selectedStudent.institution || 'Not assigned'}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-medium pr-4 py-2">Clinic Area:</td>
                                            <td>{selectedStudent.clinic_area || 'Not assigned'}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-medium pr-4 py-2">Email:</td>
                                            <td>{selectedStudent.email || 'Not available'}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-medium pr-4 py-2">Start Date:</td>
                                            <td>{selectedStudent.start_date ? new Date(selectedStudent.start_date).toLocaleDateString() : 'Not set'}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-medium pr-4 py-2">End Date:</td>
                                            <td>{selectedStudent.end_date ? new Date(selectedStudent.end_date).toLocaleDateString() : 'Not set'}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Confirmation Checkbox */}
                                <div className="mt-6 flex items-start space-x-2">
                                    <Checkbox
                                        id="confirmation"
                                        checked={isConfirmed}
                                        onCheckedChange={(checked) => setIsConfirmed(checked)}
                                    />
                                    <label
                                        htmlFor="confirmation"
                                        className="text-sm text-gray-600 leading-relaxed cursor-pointer"
                                    >
                                        I have reviewed the student details above and confirm I am entering feedback for the correct student.
                                    </label>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-6 flex justify-end">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedStudent(null);
                                            setQuery('');
                                            setIsConfirmed(false);
                                        }}
                                        className="mr-2"
                                    >
                                        Clear Selection
                                    </Button>
                                    <Button
                                        disabled={!isConfirmed}
                                        onClick={() => {
                                            if (selectedStudent && isConfirmed) {
                                                // 确保存储完整的学生信息
                                                const studentData = {
                                                    student_id: selectedStudent.student_id,
                                                    first_name: selectedStudent.first_name,
                                                    last_name: selectedStudent.last_name,
                                                    institution: selectedStudent.institution || selectedStudent.university,
                                                    clinic_area: selectedStudent.clinic_area,
                                                    email: selectedStudent.email,
                                                    start_date: selectedStudent.start_date,
                                                    end_date: selectedStudent.end_date
                                                };
                                                
                                                // 验证必要字段
                                                if (!studentData.student_id) {
                                                    console.error('Missing student_id:', studentData);
                                                    return;
                                                }
                                                
                                                console.log('Storing student data:', studentData);
                                                localStorage.setItem('selectedStudent', JSON.stringify(studentData));
                                                router.push('/auth/addPreceptorFeedbacks');
                                            }
                                        }}
                                    >
                                        Continue to Feedback
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
