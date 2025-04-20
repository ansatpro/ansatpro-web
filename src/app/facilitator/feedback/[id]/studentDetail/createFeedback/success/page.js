"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Home, 
  MessageSquareText, 
  Settings, 
  Users, 
  Download, 
  Bell, 
  LogOut,
  CheckCircle,
  Plus,
  ArrowLeft
} from "lucide-react";

export default function SuccessPage() {
  const router = useRouter();
  
  // State to track if animation should play
  const [showAnimation, setShowAnimation] = useState(false);
  
  // Start animation after component mounts
  useEffect(() => {
    setShowAnimation(true);
  }, []);
  
  // Handle navigation
  const handleAddAnotherFeedback = () => {
    router.push("/facilitator/feedback");
  };
  
  const handleReturnHome = () => {
    router.push("/facilitator/dashboard");
  };
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar navigation */}
      <aside className="w-64 border-r bg-muted/40 p-6 hidden md:block">
        <div className="mb-8">
          <h1 className="text-xl font-bold">ANSAT Pro</h1>
        </div>
        <nav className="space-y-2">
          <Link
            href="/facilitator/dashboard"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
          <Link
            href="/facilitator/student"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <Users className="mr-2 h-4 w-4" />
            Student
          </Link>
          <Link
            href="/facilitator/feedback"
            className="flex items-center rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground"
          >
            <MessageSquareText className="mr-2 h-4 w-4" />
            Feedback
          </Link>
          <Link
            href="/facilitator/report"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <Download className="mr-2 h-4 w-4" />
            Report
          </Link>
          <Link
            href="/facilitator/settings"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Success</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Bell className="mr-2 h-4 w-4" />
              <span className="sr-only md:not-sr-only md:inline-block">Notifications</span>
            </Button>
            <Button variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              <span className="sr-only md:not-sr-only md:inline-block">Log out</span>
            </Button>
          </div>
        </header>

        {/* Success message card */}
        <div className="flex items-center justify-center min-h-[70vh]">
          <Card className={`w-full max-w-lg ${showAnimation ? 'animate-in fade-in-50 zoom-in-95 duration-500' : 'opacity-0'}`}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-24 w-24 text-green-500" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold">Feedback Submitted Successfully!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center text-muted-foreground text-lg">
                Your feedback has been submitted and stored. Thank you for your contribution.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  className="space-x-2" 
                  onClick={handleAddAnotherFeedback}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Another Feedback</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="space-x-2" 
                  onClick={handleReturnHome}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Return to Home</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
