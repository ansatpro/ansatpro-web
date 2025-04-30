/*
 * This is the success page component that displays after successful feedback submission.
 * It provides a confirmation message and navigation back to the previous page.
 * The component includes a success icon and return button.
 */

"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import PreceptorLayout from "@/components/layout/preceptorLayout";
import { Button } from "@/components/ui/button";

/*
 * The main component that displays the success message and navigation button.
 * It shows a checkmark icon and confirmation text.
 * The component provides a simple and clear success feedback to users.
 */
export default function FeedbackSuccessPage() {
  return (
    <PreceptorLayout>
      <main className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
        {/* Checkmark icon */}
        <CheckCircle className="w-24 h-24 text-green-500 mb-6" />

        {/* Success title */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Submitted Successfully
        </h2>

        {/* Return button */}
        <Link href="/preceptor/searchStudents">
          <Button className="bg-[#3A6784] hover:bg-[#2d5268] text-white text-base px-6 py-2">
            Back to Previous
          </Button>
        </Link>
      </main>
    </PreceptorLayout>
  );
}
