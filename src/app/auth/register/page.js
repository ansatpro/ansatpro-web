"use client";
import { useState } from 'react';
import { account, ID } from "../../appwrite";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from 'sonner';


export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: '',
        healthService: '',
        university: '',
        isRegisteredNurse: false
    });

    // Example data - replace with your actual data
    const healthServices = [
        "Alfred Health",
        "Austin Health",
        "Eastern Health",
        "Monash Health",
        "Royal Children's Hospital",
        "Royal Melbourne Hospital",
        "St Vincent's Hospital"
    ];

    const universities = [
        "Australian Catholic University",
        "Deakin University",
        "La Trobe University",
        "Monash University",
        "RMIT University",
        "University of Melbourne",
        "Victoria University"
    ];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSelectChange = (value, field) => {
        setFormData({
            ...formData,
            [field]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.isRegisteredNurse) {
            toast({
                title: "Registration Error",
                description: "You must be a registered nurse to sign up.",
                variant: "destructive"
            });
            return;
        }

        // Check if the appropriate organization field is filled based on role
        if (formData.role === "preceptor" && !formData.healthService) {
            toast({
                title: "Registration Error",
                description: "Please select a Health Service.",
                variant: "destructive"
            });
            return;
        }

        if (formData.role === "facilitator" && !formData.university) {
            toast({
                title: "Registration Error",
                description: "Please select a University.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        try {
            // Create a name field by combining first and last name
            const name = `${formData.firstName} ${formData.lastName}`;
            
            // Register the user with Appwrite
            const newUser = await account.create(
                ID.unique(),
                formData.email,
                formData.password,
                name
            );
            
            // You can store additional user data (like role and organization) in a database or Appwrite collection
            // const userData = {
            //     userId: newUser.$id,
            //     role: formData.role,
            //     organization: formData.role === "preceptor" ? formData.healthService : formData.university
            // };
            // await database.createDocument('users', ID.unique(), userData);
            
            toast({
                title: "Registration Successful",
                description: "Your account has been created. Please log in.",
                duration: 3000,
            });
            
            // Redirect to login page after successful registration
            router.push('/auth/login');
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
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">Create an Account</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    placeholder="First name"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    placeholder="Last name"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="your.email@example.com"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                minLength={8}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role Selection</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) => handleSelectChange(value, 'role')}
                                required
                            >
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="preceptor">Preceptor</SelectItem>
                                    <SelectItem value="facilitator">Facilitator</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Show Health Service dropdown if preceptor is selected */}
                        {formData.role === "preceptor" && (
                            <div className="space-y-2">
                                <Label htmlFor="healthService">Health Service</Label>
                                <Select
                                    value={formData.healthService}
                                    onValueChange={(value) => handleSelectChange(value, 'healthService')}
                                    required
                                >
                                    <SelectTrigger id="healthService">
                                        <SelectValue placeholder="Select your health service" />
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
                        )}

                        {/* Show University dropdown if facilitator is selected */}
                        {formData.role === "facilitator" && (
                            <div className="space-y-2">
                                <Label htmlFor="university">University</Label>
                                <Select
                                    value={formData.university}
                                    onValueChange={(value) => handleSelectChange(value, 'university')}
                                    required
                                >
                                    <SelectTrigger id="university">
                                        <SelectValue placeholder="Select your university" />
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
                        )}

                        <div className="flex items-start space-x-2 pt-2">
                            <Checkbox
                                id="isRegisteredNurse"
                                name="isRegisteredNurse"
                                checked={formData.isRegisteredNurse}
                                onCheckedChange={(checked) => 
                                    setFormData({...formData, isRegisteredNurse: checked})
                                }
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label
                                    htmlFor="isRegisteredNurse"
                                    className="text-sm font-medium text-justify leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    I declare that I am a registered nurse, holding current nursing registration with Nursing and Midwifery Board of Australia (NMBA).
                                </Label>
                            </div>
                        </div>

                        <div className="text-center text-sm my-2">
                            Already have an account? <Link href="/auth/login" className="text-blue-600 hover:text-blue-800">Log in</Link>
                        </div>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? "Creating Account..." : "Sign Up"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}