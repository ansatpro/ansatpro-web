"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, LogOut } from "lucide-react";
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
    <>
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Student</h1>
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
                  <span className="text-lg font-semibold">Register Student</span>
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
                  <span className="text-lg font-semibold">Student List</span>
                  <p className="text-center text-sm text-muted-foreground">
                    View and manage all students
                  </p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
