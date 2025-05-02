"use client";

import { useState, Suspense } from "react";
import { account } from "../../appwrite";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const TextPressure = dynamic(() => import("@/components/TextPressure"), {
    ssr: false,
});

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            const userId = searchParams.get("userId");
            const secret = searchParams.get("secret");

            await account.updateRecovery(userId, secret, password, password);
            setSuccess("Password has been reset successfully!");

            setTimeout(() => {
                router.push("/auth/login");
            }, 2000);
        } catch (err) {
            console.error("Password reset failed:", err);
            setError(err.message || "Failed to reset password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
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
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            className="pl-10 pr-10 py-4 bg-gray-50 rounded-xl focus:ring-2 focus:ring-[#3A6784] transition duration-200"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            className="pl-10 pr-10 py-4 bg-gray-50 rounded-xl focus:ring-2 focus:ring-[#3A6784] transition duration-200"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-[#3A6784] hover:bg-[#2d5268] text-white font-semibold text-base rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                >
                    {isLoading ? "Resetting..." : "Reset Password"}
                </Button>

                <div className="flex items-center justify-center space-x-1 text-sm">
                    <span className="text-gray-500">Remember your password?</span>
                    <Link href="/auth/login" className="text-[#3A6784] hover:text-[#2d5268] font-medium">
                        Sign In
                    </Link>
                </div>
            </form>
        </>
    );
}

export default function ResetPasswordPage() {
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
                            <p className="text-gray-500 mt-1">Reset your password</p>
                        </div>

                        <Suspense fallback={<div>Loading...</div>}>
                            <ResetPasswordForm />
                        </Suspense>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
