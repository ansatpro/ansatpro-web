"use client";

import { useState } from "react";
import { account } from "../../appwrite";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            // Create password recovery request
            await account.createRecovery(
                email,
                `${window.location.origin}/auth/reset-password`
            );
            setSuccess("Password reset instructions have been sent to your email.");
        } catch (err) {
            console.error("Password recovery failed:", err);
            setError(err.message || "Failed to send password reset instructions.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white p-4">
            <Card className="w-full max-w-md border-none shadow-none">
                <CardContent>
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
                        <p className="text-gray-500">Enter your email to reset your password</p>
                    </div>
                    
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    
                    {success && (
                        <Alert className="mb-4">
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="pl-10 py-6 bg-gray-50"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-6 bg-[#3A6784] hover:bg-[#2d5268] text-white font-semibold text-base"
                            disabled={isLoading}
                        >
                            {isLoading ? "Sending..." : "Send Reset Instructions"}
                        </Button>

                        <div className="flex items-center justify-center space-x-1 text-sm">
                            <span className="text-gray-500">Remember your password?</span>
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