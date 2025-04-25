"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CreateStudent } from "../../../../../lib/HowToConnectToFunction";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function RegisterStudentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    studentId: "",
    university: "",
    healthService: "",
    clinicArea: "",
    additionalFacilitator: "",
    startDate: "",
    endDate: "",
    csvFile: null,
  });
  const [fileName, setFileName] = useState("No file chosen");
  const fileInputRef = useRef(null);
  
  // CSV processing states
  const [csvData, setCsvData] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [showCsvDialog, setShowCsvDialog] = useState(false);
  const [fieldMapping, setFieldMapping] = useState({});
  const [processingCsv, setProcessingCsv] = useState(false);
  const [previewData, setPreviewData] = useState([]);

  // Predefined values - University list
  const universities = [
    "Australian Catholic University",
    "Deakin University",
    "La Trobe University",
    "Monash University",
    "RMIT University",
    "University of Melbourne",
    "Victoria University",
  ];

  // Predefined values - Health services list
  const healthServices = [
    "Alfred Health",
    "Austin Health",
    "Eastern Health",
    "Monash Health",
    "Royal Children's Hospital",
    "Royal Melbourne Hospital",
    "St Vincent's Hospital",
  ];

  // Predefined values - Clinic areas
  const clinicAreas = [
    "Emergency Department",
    "Intensive Care Unit",
    "Medical Ward",
    "Surgical Ward",
    "Pediatrics",
    "Maternity",
    "Mental Health",
    "Rehabilitation",
  ];

  // Required field names and their possible matches in CSV headers
  const requiredFields = {
    firstName: ["first_name", "firstname", "first name", "given name", "givenname"],
    lastName: ["last_name", "lastname", "last name", "surname", "family name"],
    studentId: ["student_id", "studentid", "student id", "id", "number"],
    university: ["university", "uni", "school", "institution"],
    healthService: ["health_service", "healthservice", "health service", "service", "hospital", "clinic", "facility"],
    clinicArea: ["clinic_area", "clinicarea", "clinic area", "area", "department", "speciality", "specialty"],
    additionalFacilitator: ["additional_facilitator", "additionalfacilitator", "additional facilitator", "facilitator"],
    startDate: ["start_date", "startdate", "start date", "start", "begin date", "from", "commence"],
    endDate: ["end_date", "enddate", "end date", "end", "finish date", "to", "completion"],
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0] || null;
      setFormData({
        ...formData,
        [name]: file,
      });
      setFileName(file ? file.name : "No file chosen");
      
      // Process CSV file if it exists
      if (file && file.name.endsWith('.csv')) {
        processCsvFile(file);
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSelectChange = (value, field) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Validate the form to check whether we have CSV or all required manual fields
  const validateForm = () => {
    // If we have a CSV file, no need to validate manual fields
    if (formData.csvFile) {
      return true;
    }
    
    // Otherwise check if all required fields are filled
    const requiredFields = [
      'firstName', 
      'lastName', 
      'studentId',
      'university',
      'healthService',
      'clinicArea',
      'startDate',
      'endDate'
    ];
    
    return requiredFields.every(field => formData[field]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form first
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please either fill all required fields or upload a CSV file",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    // Check if user has uploaded a CSV file
    if (formData.csvFile) {
      // If CSV file exists, process it directly without requiring form fields
      if (csvData.length > 0) {
        // CSV already processed, just show the dialog again
        setShowCsvDialog(true);
      } else {
        // If file selected but not yet processed, process it now
        processCsvFile(formData.csvFile);
      }
      setIsLoading(false);
      return;
    }

    try {
      // If no CSV, continue with normal form submission
      console.log("Form submitted:", formData);
      const res = await CreateStudent(formData);
      console.log(res);

      toast({
        title: "Registration Successful",
        description: "Student has been registered successfully.",
        duration: 3000,
      });

      // Redirect to success page after successful submission
      router.push("/facilitator/student/success");
      
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Process the uploaded CSV file
  const processCsvFile = (file) => {
    setProcessingCsv(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target.result;
      const lines = csvText.split(/\r\n|\n/);
      
      // Extract headers (first line)
      const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
      setCsvHeaders(headers);
      
      // Parse CSV data (remaining lines)
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue; // Skip empty lines
        
        const values = parseCSVLine(lines[i]);
        const entry = {};
        headers.forEach((header, index) => {
          entry[header] = values[index] || '';
        });
        data.push(entry);
      }
      
      setCsvData(data);
      
      // Auto-map fields based on similarity
      const mapping = autoMapFields(headers);
      setFieldMapping(mapping);
      
      // Generate preview data
      generatePreviewData(data, mapping);
      
      // Show CSV dialog
      setShowCsvDialog(true);
      setProcessingCsv(false);
    };
    
    reader.onerror = () => {
      toast({
        title: "File Reading Error",
        description: "Failed to read the CSV file.",
        variant: "destructive",
      });
      setProcessingCsv(false);
    };
    
    reader.readAsText(file);
  };

  // Parse CSV line handling quoted values with commas
  const parseCSVLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    return values;
  };

  // Auto-map CSV headers to required fields based on similarity
  const autoMapFields = (headers) => {
    const mapping = {};
    
    // For each required field
    Object.entries(requiredFields).forEach(([field, possibleMatches]) => {
      // Find the best match in headers
      let bestMatch = null;
      let bestScore = -1;
      
      headers.forEach(header => {
        // Exact match
        if (possibleMatches.includes(header)) {
          bestMatch = header;
          bestScore = Infinity;
          return;
        }
        
        // Calculate similarity score
        const score = calculateSimilarity(header, possibleMatches);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = header;
        }
      });
      
      // If we found a reasonable match (score threshold)
      if (bestScore > 0.3) {
        mapping[field] = bestMatch;
      }
    });
    
    return mapping;
  };

  // Calculate similarity between a header and possible matches
  const calculateSimilarity = (header, possibleMatches) => {
    let maxScore = 0;
    
    possibleMatches.forEach(match => {
      // Simple substring check
      if (header.includes(match) || match.includes(header)) {
        const score = Math.min(header.length, match.length) / Math.max(header.length, match.length);
        maxScore = Math.max(maxScore, score);
      }
      
      // Word-by-word comparison
      const headerWords = header.split(/[_\s-]+/);
      const matchWords = match.split(/[_\s-]+/);
      
      let wordMatches = 0;
      headerWords.forEach(hw => {
        matchWords.forEach(mw => {
          if (hw === mw || hw.includes(mw) || mw.includes(hw)) {
            wordMatches++;
          }
        });
      });
      
      const wordScore = wordMatches / Math.max(headerWords.length, matchWords.length);
      maxScore = Math.max(maxScore, wordScore);
    });
    
    return maxScore;
  };

  // Generate preview data based on mapping
  const generatePreviewData = (data, mapping) => {
    if (data.length === 0) return;
    
    // Use up to 5 rows for preview
    const previewRows = data.slice(0, 5).map(row => {
      const mappedRow = {};
      Object.entries(mapping).forEach(([field, header]) => {
        mappedRow[field] = header ? row[header] : '';
      });
      return mappedRow;
    });
    
    setPreviewData(previewRows);
  };

  // Update field mapping when user changes a mapping
  const handleMappingChange = (field, header) => {
    const newMapping = {
      ...fieldMapping,
      [field]: header === 'not_mapped' ? '' : header,
    };
    setFieldMapping(newMapping);
    generatePreviewData(csvData, newMapping);
  };

  // Process and submit CSV data
  const handleCsvSubmit = async () => {
    setIsLoading(true);
    
    // Check if all required fields are mapped
    const requiredFieldsList = ['firstName', 'lastName', 'studentId', 'university', 'healthService', 'clinicArea', 'startDate', 'endDate'];
    const missingFields = requiredFieldsList.filter(field => !fieldMapping[field]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Field Mappings",
        description: `Please map the following required fields: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    // Process each CSV row
    try {
      let successCount = 0;
      let errorCount = 0;
      
      for (const row of csvData) {
        // Map CSV data to form data structure
        const studentData = {
          firstName: fieldMapping.firstName ? row[fieldMapping.firstName] : '',
          lastName: fieldMapping.lastName ? row[fieldMapping.lastName] : '',
          studentId: fieldMapping.studentId ? row[fieldMapping.studentId] : '',
          university: fieldMapping.university ? row[fieldMapping.university] : '',
          healthService: fieldMapping.healthService ? row[fieldMapping.healthService] : '',
          clinicArea: fieldMapping.clinicArea ? row[fieldMapping.clinicArea] : '',
          additionalFacilitator: fieldMapping.additionalFacilitator ? row[fieldMapping.additionalFacilitator] : '',
          startDate: fieldMapping.startDate ? formatDate(row[fieldMapping.startDate]) : '',
          endDate: fieldMapping.endDate ? formatDate(row[fieldMapping.endDate]) : '',
        };
        
        try {
          await CreateStudent(studentData);
          successCount++;
        } catch (error) {
          console.error("Error creating student:", error, studentData);
          errorCount++;
        }
      }
      
      // Show result message
      toast({
        title: "Bulk Registration Complete",
        description: `Successfully registered ${successCount} students with ${errorCount} errors.`,
        duration: 5000,
      });
      
      // Redirect to success page if at least one student was registered
      if (successCount > 0) {
        router.push("/facilitator/student/success");
      } else {
        setIsLoading(false);
        setShowCsvDialog(false);
      }
      
    } catch (error) {
      toast({
        title: "Bulk Registration Failed",
        description: error.message || "An error occurred during bulk registration.",
        variant: "destructive",
      });
      setIsLoading(false);
      setShowCsvDialog(false);
    }
  };

  // Format date strings from various formats to YYYY-MM-DD
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    
    // Try parsing different date formats
    let date;
    
    // Check if it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    // Try MM/DD/YYYY
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
      const parts = dateStr.split('/');
      date = new Date(parts[2], parts[0] - 1, parts[1]);
    }
    // Try DD/MM/YYYY
    else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
      const parts = dateStr.split('/');
      date = new Date(parts[2], parts[1] - 1, parts[0]);
    }
    // Try to parse as is
    else {
      date = new Date(dateStr);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateStr; // Return original if cannot parse
    }
    
    // Format as YYYY-MM-DD
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="container mx-auto py-8 px-4">
      
      {/* Back Button */}
      <Button 
        variant="ghost" 
        className="mb-4 flex items-center text-muted-foreground hover:text-foreground"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back
      </Button>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Register Student</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First name and last name - Two columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Input text"
                  required={!formData.csvFile}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Input text"
                  required={!formData.csvFile}
                />
              </div>
            </div>

            {/* Student ID - Single row */}
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID Number</Label>
              <Input
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                placeholder="Input text"
                required={!formData.csvFile}
              />
            </div>

            {/* University - Single row */}
            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <Select
                value={formData.university}
                onValueChange={(value) =>
                  handleSelectChange(value, "university")
                }
                required={!formData.csvFile}
              >
                <SelectTrigger id="university" className="bg-white w-full">
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {universities.map((uni) => (
                    <SelectItem key={uni} value={uni}>
                      {uni}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Health service and clinic area - Same row */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="healthService">Health Service</Label>
                <Select
                  value={formData.healthService}
                  onValueChange={(value) =>
                    handleSelectChange(value, "healthService")
                  }
                  required={!formData.csvFile}
                >
                  <SelectTrigger id="healthService" className="bg-white w-full">
                    <SelectValue placeholder="Select health service" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {healthServices.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicArea">Clinic Area</Label>
                <Select
                  value={formData.clinicArea}
                  onValueChange={(value) =>
                    handleSelectChange(value, "clinicArea")
                  }
                  required={!formData.csvFile}
                >
                  <SelectTrigger id="clinicArea" className="bg-white w-full">
                    <SelectValue placeholder="Select clinic area" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {clinicAreas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Additional facilitator - Single row */}
            <div className="space-y-2">
              <Label htmlFor="additionalFacilitator">
                Add additional facilitator (Optional)
              </Label>
              <Input
                id="additionalFacilitator"
                name="additionalFacilitator"
                value={formData.additionalFacilitator}
                onChange={handleInputChange}
                placeholder="Input text"
              />
            </div>

            {/* Start date and end date - Same row */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required={!formData.csvFile}
                  className="bg-white w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required={!formData.csvFile}
                  className="bg-white w-full"
                />
              </div>
            </div>

            {/* File upload - Custom style */}
            <div className="space-y-2 mt-6">
              <Label htmlFor="csvFile">
                Import a .csv file for bulk registration
              </Label>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-32 bg-white"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={processingCsv}
                  >
                    {processingCsv ? "Processing..." : "Choose File"}
                  </Button>
                  <Input
                    type="file"
                    id="csvFile"
                    name="csvFile"
                    ref={fileInputRef}
                    accept=".csv"
                    onChange={handleInputChange}
                    className="hidden"
                    disabled={processingCsv}
                  />
                </div>
                <span className="text-sm text-gray-500">{fileName}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Upload a CSV file containing student information. The system will automatically detect fields.
                {formData.csvFile && <span className="font-medium text-green-600"> When using CSV upload, form fields are optional.</span>}
              </p>
            </div>

            <div className="mt-6">
              <Button
                type="submit"
                className="w-full md:w-auto"
                disabled={isLoading || processingCsv}
              >
                {isLoading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* CSV Mapping Dialog */}
      <Dialog open={showCsvDialog} onOpenChange={setShowCsvDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-center">CSV Field Mapping</DialogTitle>
            <DialogDescription className="text-center">
              We've detected {csvData.length} records. Please confirm the field mappings below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Field Mapping Table */}
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Required Field</TableHead>
                    <TableHead className="w-3/4">CSV Column</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(requiredFields).map(([field, _]) => (
                    <TableRow key={field}>
                      <TableCell className="font-medium">
                        {field}
                        {field !== 'additionalFacilitator' && <span className="text-red-500 ml-1">*</span>}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={fieldMapping[field] || 'not_mapped'}
                          onValueChange={(value) => handleMappingChange(field, value)}
                        >
                          <SelectTrigger className="bg-white w-full">
                            <SelectValue placeholder="Select a column" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="not_mapped">Not Mapped</SelectItem>
                            {csvHeaders.map(header => (
                              <SelectItem key={header} value={header}>
                                {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Data Preview */}
            <div>
              <h3 className="text-lg font-medium mb-2 text-center">Data Preview</h3>
              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(requiredFields).map(field => (
                        <TableHead key={field}>{field}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row, index) => (
                      <TableRow key={index}>
                        {Object.keys(requiredFields).map(field => (
                          <TableCell key={field}>{row[field] || '-'}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Showing {previewData.length} of {csvData.length} records.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCsvDialog(false)}
              className="bg-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCsvSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Import Data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
