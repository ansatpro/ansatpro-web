"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function ExportSuccessPage() {
  const router = useRouter();
  const [docId, setDocId] = useState(null);

  // Move localStorage access to useEffect to ensure it only runs on client-side
  useEffect(() => {
    try {
      const selectedStudent = JSON.parse(localStorage.getItem("ansatpro_selected_student"));
      setDocId(selectedStudent?.docId);
    } catch (error) {
      console.error("Error accessing localStorage:", error);
    }
  }, []);

  const handleAddAnother = () => {
    if (docId) {
      // Use dynamic routing, replace [docId] with the actual docId
      router.push(`/facilitator/export/${docId}/studentDetail`);
    } else {
      console.error("No docId found for selected student");
      // If no docId is found, navigate to the default page or show an error
      router.push("/facilitator/export");
    }
  };

  const handleReturnHome = () => {
    router.push("/facilitator/home");
  };

  return (
    <div className="flex min-h-screen bg-background">
      
      {/* Main content */}
      <main className="flex-1 p-6">
        
        {/* Success message */}
        <div className="flex flex-col items-center justify-center space-y-8 py-12">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-6 text-green-500">
                <CheckCircle size={100} strokeWidth={1.5} />
              </div>
              
              <h2 className="mb-6 text-2xl font-bold">
              Feedback Exported Successfully!
              </h2>
              
              <div className="grid w-full gap-4">
                <Button onClick={handleAddAnother} variant="outline" size="lg">
                  Add Another Export
                </Button>
                
                <Button onClick={handleReturnHome} variant="default" size="lg">
                  Return to Home Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
