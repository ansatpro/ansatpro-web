"use client";

import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 px-4">
            <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center border border-gray-200">
                <div className="flex justify-center mb-4">
                    <ShieldAlert className="h-12 w-12 text-red-500" />
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
                <p className="text-gray-600 mb-6">
                    You don&apos;t have permission to view this page.
                </p>

                <Link
                    href="/"
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition"
                >
                    Return to Home
                </Link>
            </div>
        </div>
    );
}
