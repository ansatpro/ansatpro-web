"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function ReviewSuccessPage() {
  const router = useRouter();

  const handleAddAnother = () => {
    router.push("/facilitator/feedback");
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
                Feedback Review Submitted Successfully!
              </h2>
              
              <div className="grid w-full gap-4">
                <Button onClick={handleAddAnother} variant="outline" size="lg">
                  Add Another Review
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


