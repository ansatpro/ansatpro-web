"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    Home,
    PlusCircle,
    FileText,
    Settings,
    Bell,
    User,
    LayoutDashboard
} from "lucide-react";
import { useRouter } from 'next/navigation';

export default function PreceptorHome() {
    const router = useRouter();

    const handleAddFeedback = () => {
        router.push('/preceptor/searchStudents');
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Top Bar */}
            <header className="fixed top-0 left-0 right-0 h-14 bg-white z-50">
                <div className="h-full px-6 flex justify-between items-center">
                    <Link href="/preceptor/home" className="flex items-center">
                        <LayoutDashboard className="h-8 w-8 text-[#3A6784]" />
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link href="/preceptor/notifications" className="hover:bg-gray-50 p-2 rounded-full transition-colors">
                            <Bell className="h-5 w-5 text-gray-600" />
                        </Link>
                        <Link href="/preceptor/settings" className="hover:bg-gray-50 p-2 rounded-full transition-colors">
                            <User className="h-5 w-5 text-gray-600" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Side Bar */}
            <aside className="fixed left-0 top-14 bottom-0 w-16 bg-white">
                <nav className="h-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-12">
                        <Link
                            href="/preceptor/home"
                            className="p-2 rounded-lg bg-blue-50"
                        >
                            <Home className="h-6 w-6 text-[#3A6784]" />
                        </Link>
                        <button
                            onClick={handleAddFeedback}
                            className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <PlusCircle className="h-6 w-6 text-gray-600" />
                        </button>
                        <Link
                            href="/preceptor/view-feedback"
                            className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <FileText className="h-6 w-6 text-gray-600" />
                        </Link>
                        <Link
                            href="/preceptor/settings"
                            className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Settings className="h-6 w-6 text-gray-600" />
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="pt-14 ml-16 min-h-screen">
                <div className="flex flex-col items-center pt-20">
                    <h1 className="text-4xl font-bold mb-3">HOME</h1>
                    <p className="text-2xl text-[#64748B]">WELCOME!</p>

                    <div className="mt-24 grid grid-cols-2 gap-8 max-w-2xl">
                        <Button
                            variant="default"
                            className="h-auto py-4 px-8 bg-[#3A6784] hover:bg-[#2d5268] text-white text-lg"
                            onClick={handleAddFeedback}
                        >
                            Add Feedback
                        </Button>
                        <Button
                            variant="default"
                            className="h-auto py-4 px-8 bg-[#3A6784] hover:bg-[#2d5268] text-white text-lg"
                            asChild
                        >
                            <Link href="/preceptor/previousFeedbacks">View Previous Feedback</Link>
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
} 