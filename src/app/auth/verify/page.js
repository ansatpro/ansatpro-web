"use client";

import { useState, useEffect } from "react";
import { account } from "../../appwrite";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState("verifying");
    const [error, setError] = useState("");

    useEffect(() => {
        const verifyEmail = async () => {
            const userId = searchParams.get("userId");
            const secret = searchParams.get("secret");

            if (!userId || !secret) {
                setError("Invalid verification link");
                setStatus("error");
                return;
            }

            try {
                await account.updateVerification(userId, secret);
                setStatus("success");
                setTimeout(() => {
                    router.push("/auth/login");
                }, 3000);
            } catch (err) {
                console.error("Verification failed:", err);
                setError(err.message || "Failed to verify email");
                setStatus("error");
            }
        };

        verifyEmail();
    }, [router, searchParams]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-white p-4">
            <Card className="w-full max-w-md border-none shadow-none">
                <CardContent>
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold mb-2">Email Verification</h1>
                        {status === "verifying" && (
                            <p className="text-gray-500">Verifying your email...</p>
                        )}
                    </div>

                    {status === "success" && (
                        <Alert className="mb-4">
                            <AlertDescription>
                                Email verified successfully! Redirecting to login page...
                            </AlertDescription>
                        </Alert>
                    )}

                    {status === "error" && (
                        <>
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                            <div className="flex justify-center">
                                <Button
                                    onClick={() => router.push("/auth/login")}
                                    className="bg-[#3A6784] hover:bg-[#2d5268] text-white"
                                >
                                    Return to Login
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 