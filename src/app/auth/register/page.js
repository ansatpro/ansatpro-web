"use client";

import { useState, useEffect } from "react";
import { account, functions, ID } from "../../appwrite";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [healthServices, setHealthServices] = useState([]);
  const [universities, setUniversities] = useState([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "",
    healthService: "",
    university: "",
    isRegisteredNurse: false,
  });
  useEffect(() => {
    const fetchAffiliations = async () => {
      try {
        const res = await functions.createExecution(
          process.env.NEXT_PUBLIC_FN_GUEST_REQUEST,
          JSON.stringify({
            action: "getAffiliations",
          })
        );
        const parsed = JSON.parse(res.responseBody);
        const all = parsed.affiliations || [];

        setHealthServices(
          all.filter((item) => item.affiliation_type === "health_service")
        );
        setUniversities(
          all.filter((item) => item.affiliation_type === "university")
        );
      } catch (err) {
        console.error("❌ Failed to fetch affiliations:", err.message);
      }
    };
    fetchAffiliations();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSelectChange = (value, field) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.isRegisteredNurse) {
      toast({
        title: "Registration Error",
        description: "You must be a registered nurse to sign up.",
        variant: "destructive",
      });
      return;
    }

    if (formData.role === "preceptor" && !formData.healthService) {
      toast({
        title: "Registration Error",
        description: "Please select a Health Service.",
        variant: "destructive",
      });
      return;
    }

    if (formData.role === "facilitator" && !formData.university) {
      toast({
        title: "Registration Error",
        description: "Please select a University.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const name = `${formData.firstName} ${formData.lastName}`;
      let newUser;
      try {
        newUser = await account.create(
          ID.unique(),
          formData.email,
          formData.password,
          name
        );
      } catch (err) {
        console.error("❌ User creation failed:", err.message);
        return;
      }

      try {
        await account.deleteSession("current");
      } catch (err) {
        console.warn(
          "⚠️ No session to delete or already deleted:",
          err.message
        );
      }

      try {
        await account.createEmailPasswordSession(
          formData.email,
          formData.password
        );
      } catch (err) {
        console.error("❌ Failed to login after creation:", err.message);
      }

      await account.get();
      const jwt = (await account.createJWT()).jwt;
      localStorage.setItem("jwt", jwt);
      console.log("JWT:", jwt);

      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        role: formData.role,
        affiliation_id: formData.healthService || formData.university,
        nmba_confirmed: formData.isRegisteredNurse,
      };

      await functions.createExecution(
        process.env.NEXT_PUBLIC_FN_USER_METADATA,
        JSON.stringify({
          jwt,
          action: "addMetadata",
          payload,
        })
      );

      toast({
        title: "Registration Successful",
        description: "Your account has been created.",
        duration: 3000,
      });

      if (formData.role === "facilitator") {
        toast({
          title: "Facilitator Registration",
          description: "You will be redirected to the facilitator home page.",
          duration: 3000,
        });
        router.push("/facilitator/home");
      } else if (formData.role === "preceptor") {
        toast({
          title: "Preceptor Registration",
          description: "You will redirected to the preceptor home page.",
          duration: 3000,
        });
        router.push("/preceptor/home");
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-white overflow-hidden">
      <Card className="relative z-10 w-full max-w-md w-full max-w-md border border-gray-200 shadow-xl rounded-2xl bg-white">
        <CardContent>
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold mt-2 mb-2 text-[#3A6784]">
              Welcome to ANSAT Pro.
            </h1>
            <p className="text-gray-500">Create your account</p>
          </div>
          <form
            autoComplete="off"
            className="space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  autoComplete="off"
                  id="firstName"
                  name="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="py-4 bg-gray-50 rounded-xl focus:ring-2 focus:ring-[#3A6784] transition duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  autoComplete="off"
                  id="lastName"
                  name="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="py-4 bg-gray-50 rounded-xl focus:ring-2 focus:ring-[#3A6784] transition duration-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                autoComplete="off"
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="py-4 bg-gray-50 rounded-xl focus:ring-2 focus:ring-[#3A6784] transition duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                autoComplete="off"
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="py-4 bg-gray-50 rounded-xl focus:ring-2 focus:ring-[#3A6784] transition duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                name="role"
                onValueChange={(value) => handleSelectChange(value, "role")}
                required
              >
                <SelectTrigger className="py-4 bg-gray-50 rounded-xl focus:ring-2 focus:ring-[#3A6784] transition duration-200">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preceptor">Preceptor</SelectItem>
                  <SelectItem value="facilitator">Facilitator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === "preceptor" && (
              <div className="space-y-2">
                <Label htmlFor="healthService">Health Service</Label>
                <Select
                  name="healthService"
                  onValueChange={(value) =>
                    handleSelectChange(value, "healthService")
                  }
                >
                  <SelectTrigger className="py-4 bg-gray-50 rounded-xl focus:ring-2 focus:ring-[#3A6784] transition duration-200">
                    <SelectValue placeholder="Select your health service" />
                  </SelectTrigger>
                  <SelectContent>
                    {healthServices.map((service) => (
                      <SelectItem key={service.$id} value={service.$id}>
                        {service.affiliation_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.role === "facilitator" && (
              <div className="space-y-2">
                <Label htmlFor="university">University</Label>
                <Select
                  name="university"
                  onValueChange={(value) =>
                    handleSelectChange(value, "university")
                  }
                >
                  <SelectTrigger className="py-4 bg-gray-50 rounded-xl focus:ring-2 focus:ring-[#3A6784] transition duration-200">
                    <SelectValue placeholder="Select your university" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((uni) => (
                      <SelectItem key={uni.$id} value={uni.$id}>
                        {uni.affiliation_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRegisteredNurse"
                name="isRegisteredNurse"
                checked={formData.isRegisteredNurse}
                onCheckedChange={(checked) =>
                  handleInputChange({
                    target: {
                      name: "isRegisteredNurse",
                      type: "checkbox",
                      checked,
                    },
                  })
                }
              />
              <label
                htmlFor="isRegisteredNurse"
                className="text-sm font-medium text-gray-700"
              >
                I declare that I am a registered nurse, holding current nursing
                registration with Nursing and Midwifery Board of Australia
                (NMBA).
              </label>
            </div>

            <Button
              type="submit"
              className="w-full py-4 bg-[#3A6784] hover:bg-[#2d5268] text-white font-semibold text-base rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>

            <div className="flex items-center justify-center space-x-1 text-sm text-gray-600 mt-2">
              <span>Already have an account?</span>
              <Link
                href="/auth/login"
                className="text-[#3A6784] hover:text-[#2d5268] font-medium"
              >
                Sign In
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
