"use client";

import { useEffect, useState, useMemo } from "react";
import debounce from 'lodash.debounce';
import { account, functions } from "../../appwrite";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
    const [user, setUser] = useState(null);
    const [jwtToken, setJwtToken] = useState(null);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Run once on mount: check session & get JWT
    useEffect(() => {
        const checkSession = async () => {
            try {
                const currentUser = await account.get();
                setUser(currentUser);
                const token = await account.createJWT();
                setJwtToken(token.jwt);
            } catch (err) {
                console.error("Session Error:", err);
                router.push('/auth/login');
            }
        };
        checkSession();
    }, [router]);

    // Debounced search effect
    const debouncedSearch = useMemo(() => debounce(async (value) => {
        if (!jwtToken || value.length < 2) return;

        setIsLoading(true);
        try {
            const res = await functions.createExecution(
                '67ffd00400174f76be85',
                JSON.stringify({
                    jwt: jwtToken,
                    action: 'searchStudents',
                    payload: { query: value }
                })
            );

            const data = JSON.parse(res.responseBody);
            if (data.status === 'success') {
                setStudents(data.data || []);
            } else {
                console.error("Function returned error:", data.message);
                setStudents([]);
            }
        } catch (err) {
            console.error("Search failed:", err.message);
            setStudents([]);
        } finally {
            setIsLoading(false);
        }
    }, 500), [jwtToken]);

    // Trigger search when query changes
    useEffect(() => {
        if (query.length >= 2) {
            debouncedSearch(query);
        } else {
            setStudents([]);
        }
        return () => debouncedSearch.cancel();
    }, [query]);

    if (!user) return null;

    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 p-4" >
            <Card className="w-full max-w-md mt-10" >
                <CardHeader>
                    <CardTitle className="text-center" > Welcome, {user.name || "User"}! </CardTitle>
                </CardHeader>
                < CardContent >
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)
                        }
                        placeholder="Search students by first name"
                        className="w-full border rounded p-2 mb-4"
                    />

                    {isLoading && <p className="text-gray-500 text-sm" > Searching...</p>}

                    <ul className="bg-white rounded shadow divide-y" >
                        {
                            students.map(student => (
                                <li key={student.$id} className="p-2" >
                                    {student.first_name} {student.last_name}
                                </li>
                            ))
                        }
                    </ul>

                    {
                        !isLoading && query.length >= 2 && students.length === 0 && (
                            <p className="text-sm text-gray-500 mt-4" > No students found.</p>
                        )
                    }
                </CardContent>
            </Card>
        </div>
    );
}
