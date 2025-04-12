"use client";

import { useEffect, useState } from "react";
import { account } from "../../appwrite";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
    const [user, setUser] = useState(null);
    const [jwtToken, setJwtToken] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            try {
                const currentUser = await account.get();
                setUser(currentUser);
                const token = await account.createJWT();
                setJwtToken(token);
            } catch (error) {
                // If no valid session, redirect to login
                router.push('/auth/login');
            }
        };

        checkSession();
    }, [router]);

    if (!user) {
        return null; // or a loading spinner
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">Welcome!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-gray-600 mb-4">
                        You have successfully logged in to your account.
                    </p>
                    {user.name && (
                        <p className="text-center font-medium">Hello, {user.name}!</p>
                    )}
                    <div className="mt-6 flex justify-center">
                        <Button
                            onClick={() => router.push('/')}
                            className="w-full"
                        >
                            Go to Home
                        </Button>
                    </div>
                    {jwtToken && (
                        <div className="mt-6">
                            <p className="text-sm text-gray-500">JWT Token:</p>
                            <p className="text-xs break-all">{jwtToken.jwt}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 