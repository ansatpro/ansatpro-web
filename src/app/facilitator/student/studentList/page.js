"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  GetAllStudents,
  DeleteStudent,
} from "../../../../../functions/HowToConnectToFunction";

export default function StudentList() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentsData = await GetAllStudents();
        setStudents(studentsData);
        setFilteredResults(studentsData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [universityFilter, setUniversityFilter] = useState("all");
  const [healthServiceFilter, setHealthServiceFilter] = useState("all");
  const [clinicAreaFilter, setClinicAreaFilter] = useState("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  const universities = [
    ...new Set(students.map((student) => student.university)),
  ].filter(Boolean);
  const healthServices = [
    ...new Set(students.map((student) => student.healthService)),
  ].filter(Boolean);
  const clinicAreas = [
    ...new Set(students.map((student) => student.clinicArea)),
  ].filter(Boolean);

  // Apply all filters
  const applyFilters = useCallback(() => {
    // Check if date is within range - moved inside useCallback to avoid dependency issues
    const isWithinDateRange = (studentStartDate, studentEndDate) => {
      if (!startDateFilter && !endDateFilter) return true;

      const studentStart = new Date(studentStartDate);
      const studentEnd = new Date(studentEndDate);

      if (startDateFilter && endDateFilter) {
        const filterStart = new Date(startDateFilter);
        const filterEnd = new Date(endDateFilter);

        // Check if the student's period overlaps with the filter period
        return studentStart <= filterEnd && studentEnd >= filterStart;
      } else if (startDateFilter) {
        const filterStart = new Date(startDateFilter);
        return studentEnd >= filterStart;
      } else if (endDateFilter) {
        const filterEnd = new Date(endDateFilter);
        return studentStart <= filterEnd;
      }

      return true;
    };

    const filtered = students.filter((student) => {
      const matchesUniversity =
        universityFilter === "all" || student.university === universityFilter;
      const matchesHealthService =
        healthServiceFilter === "all" ||
        student.healthService === healthServiceFilter;
      const matchesClinicArea =
        clinicAreaFilter === "all" || student.clinicArea === clinicAreaFilter;
      const matchesDateRange = isWithinDateRange(
        student.startDate,
        student.endDate
      );

      // If search term exists, apply name/ID search
      const matchesSearch = searchTerm.trim() === "" ? true :
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.includes(searchTerm);

      return (
        matchesUniversity &&
        matchesHealthService &&
        matchesClinicArea &&
        matchesDateRange &&
        matchesSearch
      );
    });

    setFilteredResults(filtered);
  }, [students, universityFilter, healthServiceFilter, clinicAreaFilter, startDateFilter, endDateFilter, searchTerm]);

  // Apply filters whenever any filter changes
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Function to handle university filter change
  const handleUniversityChange = (value) => {
    setUniversityFilter(value);
  };

  // Function to handle health service filter change
  const handleHealthServiceChange = (value) => {
    setHealthServiceFilter(value);
  };

  // Function to handle clinic area filter change
  const handleClinicAreaChange = (value) => {
    setClinicAreaFilter(value);
  };

  // Function to handle start date change
  const handleStartDateChange = (e) => {
    setStartDateFilter(e.target.value);
  };

  // Function to handle end date change
  const handleEndDateChange = (e) => {
    setEndDateFilter(e.target.value);
  };

  // Search for an individual student
  const searchStudent = () => {
    applyFilters();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setUniversityFilter("all");
    setHealthServiceFilter("all");
    setClinicAreaFilter("all");
    setStartDateFilter("");
    setEndDateFilter("");
    setFilteredResults(students);
  };

  const handleDelete = async (studentId) => {
    try {
      // Find student to delete
      const studentToDelete = students.find(
        (student) => student.studentId === studentId
      );

      if (!studentToDelete) return;

      const documentID = studentToDelete.documentID;
      await DeleteStudent(documentID);

      // Remove the student from both lists
      const updatedStudents = students.filter(
        (student) => student.studentId !== studentId
      );

      setStudents(updatedStudents);
      setFilteredResults(
        filteredResults.filter((student) => student.studentId !== studentId)
      );

      console.log(`Deleted student with ID: ${studentId}`);
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  return (
    <div>
      {/* Header with back button */}
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/facilitator/student")}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-3xl font-bold">Student List</h1>
        </div>
      </header>

      {/* Search and filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="space-y-4">

            {/* Search - Single row */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="search"
                  placeholder="Search by student name or ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                  onKeyDown={(e) => e.key === "Enter" && searchStudent()}
                />
              </div>
              <Button onClick={searchStudent} variant="default" className="flex items-center gap-1">
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  University
                </label>
                <Select
                  value={universityFilter}
                  onValueChange={handleUniversityChange}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="All Universities" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Universities</SelectItem>
                    {universities.map(
                      (uni) =>
                        uni && (
                          <SelectItem key={uni} value={uni}>
                            {uni}
                          </SelectItem>
                        )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Health Service
                </label>
                <Select
                  value={healthServiceFilter}
                  onValueChange={handleHealthServiceChange}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="All Health Services" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Health Services</SelectItem>
                    {healthServices.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Clinic Area
                </label>
                <Select
                  value={clinicAreaFilter}
                  onValueChange={handleClinicAreaChange}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="All Clinic Areas" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Clinic Areas</SelectItem>
                    {clinicAreas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Date Range
                </label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    placeholder="Start Date"
                    className="w-full bg-white"
                    value={startDateFilter}
                    onChange={handleStartDateChange}
                  />
                  <Input
                    type="date"
                    placeholder="End Date"
                    className="w-full bg-white"
                    value={endDateFilter}
                    onChange={handleEndDateChange}
                  />
                </div>

                {/* Clear Filters Button - Top right */}
                <br />
                <div className="flex justify-end">
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Clear Filters
                  </Button>
                </div>


              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student table */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">
                  First Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Last Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Student ID Number
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  University
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Health Service
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Clinic Area
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Additional Facilitator
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Start Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  End Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="px-4 py-6 text-center">
                    Loading student data...
                  </td>
                </tr>
              ) : filteredResults.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-6 text-center">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredResults.map((student) => (
                  <tr
                    key={student.studentId}
                    className="border-b hover:bg-muted/50"
                  >
                    <td className="px-4 py-3 text-sm">{student.firstName}</td>
                    <td className="px-4 py-3 text-sm">{student.lastName}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {student.studentId}
                    </td>
                    <td className="px-4 py-3 text-sm">{student.university}</td>
                    <td className="px-4 py-3 text-sm">
                      {student.healthService}
                    </td>
                    <td className="px-4 py-3 text-sm">{student.clinicArea}</td>
                    <td className="px-4 py-3 text-sm">
                      {student.additionalFacilitator || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {student.startDate}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {student.endDate}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(student.studentId)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
