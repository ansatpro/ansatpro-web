"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CreateStudent } from "../../../../../lib/HowToConnectToFunction";

export default function RegisterStudentPage() {
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

  // 预设值 - 大学列表
  const universities = [
    "Australian Catholic University",
    "Deakin University",
    "La Trobe University",
    "Monash University",
    "RMIT University",
    "University of Melbourne",
    "Victoria University",
  ];

  // 预设值 - 健康服务列表
  const healthServices = [
    "Alfred Health",
    "Austin Health",
    "Eastern Health",
    "Monash Health",
    "Royal Children's Hospital",
    "Royal Melbourne Hospital",
    "St Vincent's Hospital",
  ];

  // 预设值 - 临床区域
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

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData({
        ...formData,
        [name]: files[0] || null,
      });
      setFileName(files[0] ? files[0].name : "No file chosen");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 这里可以添加提交表单的逻辑
      console.log("Form submitted:", formData);
      const res = await CreateStudent(formData);
      console.log(res);

      toast({
        title: "Registration Successful",
        description: "Student has been registered successfully.",
        duration: 3000,
      });

      // 重置表单
      setFormData({
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
      setFileName("No file chosen");
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Register Student</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 名字和姓氏 - 两列 */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Input text"
                  required
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
                  required
                />
              </div>
            </div>

            {/* 学生ID - 单独一行 */}
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID Number</Label>
              <Input
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                placeholder="Input text"
                required
              />
            </div>

            {/* 大学 - 单独一行 */}
            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <Select
                value={formData.university}
                onValueChange={(value) =>
                  handleSelectChange(value, "university")
                }
                required
              >
                <SelectTrigger id="university">
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((uni) => (
                    <SelectItem key={uni} value={uni}>
                      {uni}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 健康服务和临床区域 - 同一行 */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="healthService">Health Service</Label>
                <Select
                  value={formData.healthService}
                  onValueChange={(value) =>
                    handleSelectChange(value, "healthService")
                  }
                  required
                >
                  <SelectTrigger id="healthService">
                    <SelectValue placeholder="Select health service" />
                  </SelectTrigger>
                  <SelectContent>
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
                  required
                >
                  <SelectTrigger id="clinicArea">
                    <SelectValue placeholder="Select clinic area" />
                  </SelectTrigger>
                  <SelectContent>
                    {clinicAreas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 额外指导者 - 单独一行 */}
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

            {/* 开始日期和结束日期 - 同一行 */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
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
                  required
                />
              </div>
            </div>

            {/* 文件上传 - 自定义样式 */}
            <div className="space-y-2 mt-6">
              <Label htmlFor="csvFile">
                Import a .csv file for bulk registration
              </Label>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-32"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                  <Input
                    type="file"
                    id="csvFile"
                    name="csvFile"
                    ref={fileInputRef}
                    accept=".csv"
                    onChange={handleInputChange}
                    className="hidden"
                  />
                </div>
                <span className="text-sm text-gray-500">{fileName}</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                type="submit"
                className="w-full md:w-auto"
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
