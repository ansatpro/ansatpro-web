"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VerifyEmailSentPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-white p-4">
            <Card className="w-full max-w-md border-none shadow-none">
                <CardContent>
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
                        <p className="text-gray-500">
                            We've sent a verification link to your email address.
                            Please check your inbox and click the link to verify your account.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            If you don't see the email, please check your spam folder.
                        </p>

                        <div className="flex justify-center">
                            <Button
                                asChild
                                className="bg-[#3A6784] hover:bg-[#2d5268] text-white"
                            >
                                <Link href="/auth/login">
                                    Return to Login
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 