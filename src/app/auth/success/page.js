"use client";

import { useEffect, useState } from "react";
import { account, client } from "../../appwrite";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Functions } from "appwrite";

export default function SuccessPage() {
    const [user, setUser] = useState(null);
    const [jwtToken, setJwtToken] = useState(null);
    const [res, setRes] = useState(null);
    const [error, setError] = useState(null);
    const router = useRouter();

    const functions = new Functions(client);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const currentUser = await account.get();
                setUser(currentUser);
                const token = await account.createJWT();
                setJwtToken(token);

                try {
                    console.log(currentUser.$id)
                    const requestBody = JSON.stringify({
                        jwt: token.jwt,
                        action: 'getStudentsList',
                    });

                    const response = await functions.createExecution('function_jwt_require', requestBody);
                    console.log("Raw function response:", response);

                    if (response) {
                        console.log("Response status:", response.status);
                        console.log("Response id:", response);
                        setRes(response);
                    } else {
                        setError("No response received from function");
                    }
                } catch (apiError) {
                    console.error("API Error:", apiError);
                    setError(apiError.message || "Failed to execute function");
                }
            } catch (error) {
                console.error("Session Error:", error);
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
                    {error && (
                        <div className="mt-6">
                            <p className="text-sm text-red-500">Error:</p>
                            <p className="text-xs break-all">{error}</p>
                        </div>
                    )}
                    {res && (
                        <div className="mt-6">
                            <p className="text-sm text-gray-500">Response:</p>
                            <pre className="text-xs break-all whitespace-pre-wrap">
                                {JSON.stringify(res, null, 2)}
                            </pre>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}