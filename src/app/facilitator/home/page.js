"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { account } from "../../appwrite";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Get current time to determine greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 4) return "Good Evening"; // 18:00-3:59
    if (hour < 12) return "Good Morning"; // 4:00-11:59
    return "Good Afternoon"; // 12:00-17:59
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
      {/* Main content */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Home</h1>
      </header>

      {/* Welcome section */}
      <section className="mb-8">
        <Card className="bg-card">
          <CardContent className="p-6">
            <h2 className="mb-6 text-2xl font-semibold text-card-foreground">
              {getGreeting()}, {firstName}!
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Button
                asChild
                className="h-auto p-6 bg-background hover:bg-muted border"
                variant="outline"
              >
                <Link href="/facilitator/student/studentRegister">
                  <div className="flex flex-col items-center gap-2 w-full">
                    <span className="text-lg font-semibold text-foreground break-words whitespace-normal text-center">
                      Register Student
                    </span>
                    <p className="text-center text-sm text-muted-foreground line-clamp-3 overflow-hidden">
                      Add a new student to the system
                    </p>
                  </div>
                </Link>
              </Button>

              <Button
                asChild
                className="h-auto p-6 bg-background hover:bg-muted border"
                variant="outline"
              >
                <Link href="/facilitator/feedback">
                  <div className="flex flex-col items-center gap-2 w-full">
                    <span className="text-lg font-semibold text-foreground break-words whitespace-normal text-center">
                      Review Feedback
                    </span>
                    <p className="text-center text-sm text-muted-foreground line-clamp-3 overflow-hidden">
                      View and manage student feedback
                    </p>
                  </div>
                </Link>
              </Button>

              <Button
                asChild
                className="h-auto p-6 bg-background hover:bg-muted border"
                variant="outline"
              >
                <Link href="/facilitator/export">
                  <div className="flex flex-col items-center gap-2 w-full">
                    <span className="text-lg font-semibold text-foreground break-words whitespace-normal text-center">
                      Export Report
                    </span>
                    <p className="text-center text-sm text-muted-foreground line-clamp-3 overflow-hidden">
                      Generate and download reports
                    </p>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Recent activity or summary section could be added here */}

      <footer className="mt-auto text-center text-sm text-muted-foreground hidden md:block absolute left-0 bottom-0 w-full">
        <p>© 2025 ANSAT Pro. All rights reserved.</p>
      </footer>
    </>
  );
}
