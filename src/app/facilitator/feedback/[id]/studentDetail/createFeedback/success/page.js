"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
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
    router.push("/facilitator/home");
  };
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Main content */}
      <main className="flex-1 p-6">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Success</h1>
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
