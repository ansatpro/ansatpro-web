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
import dynamic from "next/dynamic";

const TextPressure = dynamic(() => import("@/components/TextPressure"), {
    ssr: false,
});

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
        <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-white">
            <div className="relative z-10 w-full max-w-md px-6 sm:px-0">
                <Card className="rounded-2xl border border-gray-200 shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="text-center mb-6">
                            <TextPressure
                                text="ANSATPRO"
                                flex={true}
                                alpha={false}
                                stroke={false}
                                width={true}
                                weight={true}
                                italic={true}
                                textColor="#3A6784"
                                strokeColor="#ff0000"
                                minFontSize={36}
                            />
                            <p className="text-gray-500 mt-1">Enter your email to reset your password</p>
                        </div>
                        
                        {error && (
                            <Alert variant="destructive" className="mb-4 rounded-xl border-l-4 border-red-600 bg-red-50">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        
                        {success && (
                            <Alert className="mb-4 rounded-xl border-l-4 border-green-600 bg-green-50">
                                <AlertDescription>{success}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        className="pl-10 py-4 bg-gray-50 rounded-xl focus:ring-2 focus:ring-[#3A6784] transition duration-200"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-[#3A6784] hover:bg-[#2d5268] text-white font-semibold text-base rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
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
        </div>
    );
}