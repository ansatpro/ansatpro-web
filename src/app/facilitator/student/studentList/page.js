"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export default function StudentList() {
  // Sample data - this would typically come from a database or API
  const students = [
    { firstName: "Brian", lastName: "Harris", studentId: "12345678", university: "Riverstone University", healthService: "Mental Health", clinicArea: "North Wing", additionalFacilitator: "Dr. Smith", startDate: "2023-01-15", endDate: "2023-06-30" },
    { firstName: "John", lastName: "Hill", studentId: "12345653", university: "Riverstone University", healthService: "Physical Therapy", clinicArea: "South Wing", additionalFacilitator: "Dr. Johnson", startDate: "2023-02-10", endDate: "2023-07-20" },
    { firstName: "Ryan", lastName: "Williams", studentId: "12345356", university: "Summit Valley College", healthService: "Counseling", clinicArea: "East Wing", additionalFacilitator: "Dr. Brown", startDate: "2023-03-05", endDate: "2023-08-15" },
    { firstName: "Sarah", lastName: "Green", studentId: "24555678", university: "Riverstone University", healthService: "Nutrition", clinicArea: "West Wing", additionalFacilitator: "Dr. Davis", startDate: "2023-01-20", endDate: "2023-06-25" },
    { firstName: "Emma", lastName: "Johnson", studentId: "24545678", university: "Summit Valley College", healthService: "Physical Therapy", clinicArea: "North Wing", additionalFacilitator: "Dr. Wilson", startDate: "2023-02-28", endDate: "2023-07-31" },
    { firstName: "Michael", lastName: "Smith", studentId: "25564333", university: "Summit Valley College", healthService: "Mental Health", clinicArea: "South Wing", additionalFacilitator: "Dr. Taylor", startDate: "2023-03-15", endDate: "2023-08-30" },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [universityFilter, setUniversityFilter] = useState("all");
  const [healthServiceFilter, setHealthServiceFilter] = useState("all");
  const [clinicAreaFilter, setClinicAreaFilter] = useState("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [filteredResults, setFilteredResults] = useState(students);
  
  const universities = [...new Set(students.map(student => student.university))];
  const healthServices = [...new Set(students.map(student => student.healthService))];
  const clinicAreas = [...new Set(students.map(student => student.clinicArea))];

  // Apply filters whenever any filter changes
  useEffect(() => {
    applyFilters();
  }, [universityFilter, healthServiceFilter, clinicAreaFilter, startDateFilter, endDateFilter]);

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

  // Check if date is within range
  const isWithinDateRange = (studentStartDate, studentEndDate) => {
    if (!startDateFilter && !endDateFilter) return true;
    
    const studentStart = new Date(studentStartDate);
    const studentEnd = new Date(studentEndDate);
    
    if (startDateFilter && endDateFilter) {
      const filterStart = new Date(startDateFilter);
      const filterEnd = new Date(endDateFilter);
      
      // Check if the student's period overlaps with the filter period
      return (
        (studentStart <= filterEnd && studentEnd >= filterStart)
      );
    } else if (startDateFilter) {
      const filterStart = new Date(startDateFilter);
      return studentEnd >= filterStart;
    } else if (endDateFilter) {
      const filterEnd = new Date(endDateFilter);
      return studentStart <= filterEnd;
    }
    
    return true;
  };

  // Apply all filters
  const applyFilters = () => {
    const results = students.filter(student => {
      const matchesUniversity = universityFilter === "all" || student.university === universityFilter;
      const matchesHealthService = healthServiceFilter === "all" || student.healthService === healthServiceFilter;
      const matchesClinicArea = clinicAreaFilter === "all" || student.clinicArea === clinicAreaFilter;
      const matchesDateRange = isWithinDateRange(student.startDate, student.endDate);
      
      return matchesUniversity && matchesHealthService && matchesClinicArea && matchesDateRange;
    });
    
    setFilteredResults(results);
  };

  // Search for an individual student
  const searchStudent = () => {
    if (searchTerm.trim() === "") {
      applyFilters();
      return;
    }

    const results = filteredResults.filter(student => 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.includes(searchTerm)
    );
    
    setFilteredResults(results);
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

  const handleDelete = (studentId) => {
    // In a real application, this would make an API call to delete the student
    console.log(`Delete student with ID: ${studentId}`);
    // Remove the student from filtered results
    setFilteredResults(prevResults => prevResults.filter(student => student.studentId !== studentId));
  };

  // Function to fetch data from backend
  const fetchStudentsData = async () => {
    try {
      // Example API call
      // const response = await fetch('/api/students');
      // const data = await response.json();
      // setStudents(data);
      // setFilteredResults(data);
      console.log("Fetching student data from backend...");
      // For now, we're using the sample data defined above
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar navigation */}
      <aside className="w-64 border-r bg-muted/40 p-6">
        <nav className="space-y-2">
          <Link href="/facilitator/dashboard" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            Home
          </Link>
          <Link href="/facilitator/student" className="flex items-center rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">
            Student
          </Link>
          <Link href="/facilitator/feedback" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            Feedback
          </Link>
          <Link href="/facilitator/report" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            Report
          </Link>
          <Link href="/facilitator/settings" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            Settings
          </Link>
        </nav>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 p-6">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Student List</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              Notifications
            </Button>
            <Button variant="outline" size="sm">
              Log out
            </Button>
          </div>
        </header>
        
        {/* Search and filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="search"
                    placeholder="Search for a student"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                    onKeyDown={(e) => e.key === 'Enter' && searchStudent()}
                  />
                </div>
                <Button onClick={searchStudent} variant="default">
                  Search
                </Button>
                <Button onClick={clearFilters} variant="outline" className="ml-2">
                  Clear Filters
                </Button>
              </div>
              
              {/* Filters */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">University</label>
                  <Select value={universityFilter} onValueChange={handleUniversityChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Universities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Universities</SelectItem>
                      {universities.map((uni) => (
                        <SelectItem key={uni} value={uni}>
                          {uni}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium">Health Service</label>
                  <Select value={healthServiceFilter} onValueChange={handleHealthServiceChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Health Services" />
                    </SelectTrigger>
                    <SelectContent>
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
                  <label className="mb-2 block text-sm font-medium">Clinic Area</label>
                  <Select value={clinicAreaFilter} onValueChange={handleClinicAreaChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Clinic Areas" />
                    </SelectTrigger>
                    <SelectContent>
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
                  <label className="mb-2 block text-sm font-medium">Date Range</label>
                  <div className="flex gap-2">
                    <Input 
                      type="date" 
                      placeholder="Start Date" 
                      className="w-full"
                      value={startDateFilter}
                      onChange={handleStartDateChange}
                    />
                    <Input 
                      type="date" 
                      placeholder="End Date" 
                      className="w-full"
                      value={endDateFilter}
                      onChange={handleEndDateChange}
                    />
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
                  <th className="px-4 py-3 text-left text-sm font-medium">First Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Last Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Student ID Number</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">University</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Health Service</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Clinic Area</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Additional Facilitator</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Start Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">End Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.length > 0 ? (
                  filteredResults.map((student, index) => (
                    <tr key={student.studentId} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                      <td className="px-4 py-3 text-sm">{student.firstName}</td>
                      <td className="px-4 py-3 text-sm">{student.lastName}</td>
                      <td className="px-4 py-3 text-sm">{student.studentId}</td>
                      <td className="px-4 py-3 text-sm">{student.university}</td>
                      <td className="px-4 py-3 text-sm">{student.healthService}</td>
                      <td className="px-4 py-3 text-sm">{student.clinicArea}</td>
                      <td className="px-4 py-3 text-sm">{student.additionalFacilitator}</td>
                      <td className="px-4 py-3 text-sm">{student.startDate}</td>
                      <td className="px-4 py-3 text-sm">{student.endDate}</td>
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
                ) : (
                  <tr>
                    <td colSpan="10" className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
