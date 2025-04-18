"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, MessageSquareText, Settings, Users, Download, Bell, LogOut } from "lucide-react";
import { account } from "../../appwrite";

export default function StudentDashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Get current time to determine greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };
  
  // Fetch current user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching user:", error);
        // Redirect to login if not authenticated
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Handle direct navigation
  const navigateToRegister = () => {
    router.push("/facilitator/student/studentRegister");
  };

  const navigateToList = () => {
    router.push("/facilitator/student/studentList");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  // Extract first name from full name
  const firstName = user?.name ? user.name.split(" ")[0] : "User";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar navigation */}
      <aside className="w-64 border-r bg-muted/40 p-6">
        <div className="mb-8">
          <h1 className="text-xl font-bold">ANSAT Pro</h1>
        </div>
        <nav className="space-y-2">
          <Link href="/facilitator/home" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
          <Link href="/facilitator/student" className="flex items-center rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">
            <Users className="mr-2 h-4 w-4" />
            Student
          </Link>
          <Link href="/facilitator/feedback" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            <MessageSquareText className="mr-2 h-4 w-4" />
            Feedback
          </Link>
          <Link href="/facilitator/report" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            <Download className="mr-2 h-4 w-4" />
            Report
          </Link>
          <Link href="/facilitator/settings" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </nav>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 p-6">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Student</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </header>
        
        {/* Welcome section */}
        <section className="mb-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-6 text-2xl font-semibold">
                {getGreeting()}, {firstName}!
              </h2>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Button 
                  onClick={navigateToRegister}
                  className="h-auto p-6" 
                  variant="outline"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-lg font-medium">Register Student</span>
                    <p className="text-center text-sm text-muted-foreground">
                      Add a new student to the system
                    </p>
                  </div>
                </Button>
                
                <Button 
                  onClick={navigateToList}
                  className="h-auto p-6" 
                  variant="outline"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-lg font-medium">Student List</span>
                    <p className="text-center text-sm text-muted-foreground">
                      View and manage all students
                    </p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
