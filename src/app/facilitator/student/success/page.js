"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function RegistrationSuccessPage() {
  const router = useRouter();

  const handleAddAnother = () => {
    router.push("/facilitator/student/studentRegister");
  };

  const handleReturnHome = () => {
    router.push("/facilitator/home");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar navigation */}
      <aside className="w-64 border-r bg-muted/40 p-6">
        <div className="mb-8">
          <h1 className="text-xl font-bold">ANSAT Pro</h1>
        </div>
        <nav className="space-y-2">
          <Link href="/facilitator/home" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            Home
          </Link>
          <Link href="/facilitator/student/studentList" className="flex items-center rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">
            Student
          </Link>
          <Link href="/facilitator/feedback" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            Feedback
          </Link>
          <Link href="/facilitator/report" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            Report
          </Link>
          <Link href="/facilitator/settings" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            Settings
          </Link>
        </nav>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 p-6">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Registration Success</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              Notifications
            </Button>
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                Log out
              </Button>
            </Link>
          </div>
        </header>
        
        {/* Success message */}
        <div className="flex flex-col items-center justify-center space-y-8 py-12">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-6 text-green-500">
                <CheckCircle size={100} strokeWidth={1.5} />
              </div>
              
              <h2 className="mb-6 text-2xl font-bold">
                Student information successfully registered!
              </h2>
              
              <div className="grid w-full gap-4">
                <Button onClick={handleAddAnother} variant="outline" size="lg">
                  Add Another Registration
                </Button>
                
                <Button onClick={handleReturnHome} variant="default" size="lg">
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
