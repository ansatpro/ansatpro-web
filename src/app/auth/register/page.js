"use client";
import { useState } from 'react';
import { account, ID, functions } from "../../appwrite";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from 'sonner';
import { Client, Functions } from 'appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67ebc2ec000c0837dbf2'); // Replace with your project ID


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
            console.log('Name:', name); // log the name to the console
            // Register the user with Appwrite
            let newUser;
            try {
                newUser = await account.create(ID.unique(), formData.email, formData.password, name);
                console.log("✅ User created:", newUser);
            } catch (err) {
                console.error("❌ User creation failed:", err.message);
                return; // stop everything if user creation fails
            }

            // await new Promise((resolve) => setTimeout(resolve, 1000));

            try {
                await account.deleteSession("current");
                console.log("✅ Deleted previous session");
            } catch (err) {
                console.warn("⚠️ No session to delete or already deleted:", err.message);
            }

            try {
                await account.createEmailPasswordSession(formData.email, formData.password);
                console.log("✅ Session created");
            } catch (err) {
                console.error("❌ Failed to login after creation:", err.message);
            }

            console.log('This is createEmailPasswordSession')
            await account.get();
            console.log('This is get')
            const jwt = (await account.createJWT()).jwt;
            // Optional: save in memory, localStorage, or pass to context/state
            localStorage.setItem('jwt', jwt);

            const payload = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                role: formData.role,
                affiliation_id: formData.healthService || formData.university,
                nmba_confirmed: formData.isRegisteredNurse
            };

            // const user_jwt = localStorage.getItem('jwt'); // read it
            console.log('JWT:', jwt); // log it to the console


            const resp = await functions.createExecution('67ffd78c00338787f104', JSON.stringify({
                jwt,
                action: 'addMetadata',
                payload
            }));

            console.log(resp); // handle the response as needed
            toast({
                title: "Registration Successful",
                description: "Your account has been created.",
                duration: 3000,
            });

            // Redirect to success page after successful registration
            // window.location.href = '/auth/success';
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
        <div className="flex items-center justify-center min-h-screen bg-white p-4">
            <Card className="w-full max-w-md border-none shadow-none">
                <CardContent>
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold mb-2">Welcome to ANSAT Pro.</h1>
                        <p className="text-gray-500">Create your account</p>
                    </div>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    placeholder="First name"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    required
                                    className="py-6 bg-gray-50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    placeholder="Last name"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    required
                                    className="py-6 bg-gray-50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="py-6 bg-gray-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                className="py-6 bg-gray-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                            <Select name="role" onValueChange={(value) => handleSelectChange(value, 'role')} required>
                                <SelectTrigger className="py-6 bg-gray-50">
                                    <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="preceptor">Preceptor</SelectItem>
                                    <SelectItem value="facilitator">Facilitator</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.role === 'preceptor' && (
                            <div className="space-y-2">
                                <Label htmlFor="healthService" className="text-sm font-medium">Health Service</Label>
                                <Select name="healthService" onValueChange={(value) => handleSelectChange(value, 'healthService')}>
                                    <SelectTrigger className="py-6 bg-gray-50">
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

                        {formData.role === 'facilitator' && (
                            <div className="space-y-2">
                                <Label htmlFor="university" className="text-sm font-medium">University</Label>
                                <Select name="university" onValueChange={(value) => handleSelectChange(value, 'university')}>
                                    <SelectTrigger className="py-6 bg-gray-50">
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

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isRegisteredNurse"
                                name="isRegisteredNurse"
                                checked={formData.isRegisteredNurse}
                                onCheckedChange={(checked) => handleInputChange({
                                    target: { name: 'isRegisteredNurse', type: 'checkbox', checked }
                                })}
                            />
                            <label
                                htmlFor="isRegisteredNurse"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                I am a registered nurse
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-6 bg-[#3A6784] hover:bg-[#2d5268] text-white font-semibold text-base"
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating account..." : "Create Account"}
                        </Button>

                        <div className="flex items-center justify-center space-x-1 text-sm">
                            <span className="text-gray-500">Already have an account?</span>
                            <Link href="/auth/login" className="text-[#3A6784] hover:text-[#2d5268] font-medium">
                                Sign In
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}