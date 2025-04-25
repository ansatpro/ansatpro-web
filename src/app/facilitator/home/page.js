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
        router.push("src/app/auth/login");
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
      router.push("src/app/auth/login");
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
    <div className="flex min-h-screen bg-background">
      {/* Sidebar navigation */}
      <aside className="w-64 border-r bg-muted/40 p-6">
        <div className="mb-8">
          <h1 className="text-xl font-bold">ANSAT Pro</h1>
        </div>
        <nav className="space-y-2">
          <Link
            href="/facilitator/home"
            className="flex items-center rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground"
          >
            Home
          </Link>
          <Link
            href="/facilitator/student/studentList"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Student
          </Link>
          <Link
            href="/facilitator/feedback"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Feedback
          </Link>
          <Link
            href="/facilitator/report"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Report
          </Link>
          <Link
            href="/facilitator/settings"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Home</h1>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Log out
          </Button>
        </header>

        {/* Welcome section */}
        <section className="mb-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-6 text-2xl font-semibold">
                {getGreeting()}, {firstName}!
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Button asChild className="h-auto p-6" variant="outline">
                  <Link href="/facilitator/student/studentRegister">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-lg font-medium">
                        Register Student
                      </span>
                      <p className="text-center text-sm text-muted-foreground">
                        Add a new student to the system
                      </p>
                    </div>
                  </Link>
                </Button>

                <Button asChild className="h-auto p-6" variant="outline">
                  <Link href="/facilitator/feedback/review">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-lg font-medium">
                        Review Feedback
                      </span>
                      <p className="text-center text-sm text-muted-foreground">
                        View and manage student feedback
                      </p>
                    </div>
                  </Link>
                </Button>

                <Button asChild className="h-auto p-6" variant="outline">
                  <Link href="/facilitator/report/export">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-lg font-medium">Export Report</span>
                      <p className="text-center text-sm text-muted-foreground">
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

        <footer className="mt-auto text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ANSAT Pro. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
