"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { functions, account } from "../../appwrite";
import PreceptorLayout from "@/components/layout/preceptorLayout"; // Restore your layout component
import DotsLoading from "@/components/preceptorUI/SearchLoading";

export default function SearchStudent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showNoResults, setShowNoResults] = useState(false);
  const shouldShowStudentList = !searchLoading && students.length > 0 && !selectedStudent;



  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await account.get();
        const jwt = localStorage.getItem("jwt");

        setSearchLoading(true);
        const res = await functions.createExecution(
          process.env.NEXT_PUBLIC_FN_PRECEPTOR_RELATED,
          JSON.stringify({
            jwt,
            action: 'searchStudents',
            payload: { query: searchQuery }
          })
        );

        const data = JSON.parse(res.responseBody);

        setSearchLoading(false);
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

  useEffect(() => {
    if (!searchLoading && searchQuery.length >= 2 && students.length === 0) {
      const timeout = setTimeout(() => {
        setShowNoResults(true);
      }, 500); // Delay before showing the message

      return () => clearTimeout(timeout); // cleanup if query changes
    } else {
      setShowNoResults(false); // reset if still loading or input changes
    }
  }, [searchLoading, students, searchQuery]);

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedStudent(null);
    setIsConfirmed(false);
  };

  if (error) {
    return (
      <PreceptorLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-600">{error}</p>
        </div>
      </PreceptorLayout>
    );
  }

  return (
    <PreceptorLayout>
      <main className="pt-10 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 font-['Roboto']">Student Detail</h1>
        </div>

        {/* Search Box */}
        <div className="relative mb-8 flex justify-center">
          <div className="relative w-[400px]">
            <Input
              type="text"
              placeholder="Enter student name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-6 pl-4 pr-10 bg-gray-50 rounded-lg"
            />

            {/* Clear Button */}
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {/* Search Results */}
            {searchQuery.length >= 2 && shouldShowStudentList && (
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

            {/* Loading animation */}
            {searchQuery.length >= 2 && searchLoading && (
              <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 z-20">
                <DotsLoading />
              </div>
            )}

            {searchQuery.length >= 2 && showNoResults && !selectedStudent && (
              <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg z-10">
                <p className="px-4 py-3 text-gray-500 text-center">No student found matching your search.</p>
              </div>
            )}
          </div>

        </div>

        {/* Student Details */}
        {selectedStudent && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 font-['Roboto']">
              {selectedStudent.first_name} {selectedStudent.last_name}
            </h2>
            <div className="space-y-2 text-gray-600 font-['Roboto']">
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
                <label htmlFor="confirmation" className="text-sm text-gray-600 font-['Roboto']">
                  I have reviewed the student details above and confirm I am entering feedback for the correct student.
                </label>
              </div>

              <div className="flex flex-col gap-4">
                <Button
                  variant="outline"
                  onClick={clearSearch}
                  className="px-6 py-3 rounded-lg text-[#3A6784] border-[#3A6784] hover:bg-[#f0f4f8] text-base font-semibold font-['Roboto']"
                >
                  Clear Selection
                </Button>
                <Button
                  disabled={!isConfirmed}
                  onClick={() => {
                    if (selectedStudent && isConfirmed) {
                      localStorage.setItem('selectedStudent', JSON.stringify(selectedStudent));
                      window.location.href = '/preceptor/addPreceptorFeedbacks';
                    }
                  }}
                  className="px-6 py-3 rounded-lg bg-[#3A6784] hover:bg-[#2d5268] text-white text-base font-semibold font-['Roboto'] transition-transform duration-200 hover:scale-105"
                >
                  Continue to Feedback
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </PreceptorLayout>
  );
}
