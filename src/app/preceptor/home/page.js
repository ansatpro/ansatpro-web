/**
 * @fileoverview Preceptor Home Page Component
 * @description This is the main home page for preceptors, providing navigation to add feedback and view previous feedbacks.
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import PreceptorLayout from "@/components/layout/preceptorLayout";

/**
 * @function PreceptorHome
 * @description Main component for the Preceptor's home page
 * @returns {JSX.Element} The rendered home page component
 */
export default function PreceptorHome() {
  /**
   * @function handleAnimationComplete
   * @description Callback function triggered when animation completes
   */
  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };
  const router = useRouter();

  /**
   * @function handleAddFeedback
   * @description Navigates to the student search page for adding new feedback
   */
  const handleAddFeedback = () => {
    router.push("/preceptor/searchStudents");
  };

  return (
    <PreceptorLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <h1 className="text-3xl font-semibold mb-1 font-['Roboto'] text-center">Home</h1>
        <p className="text-xl italic text-[#64748B] mb-12 font-['Roboto'] text-center">WELCOME!</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-xs md:max-w-xl">
          <Button
            variant="default"
            className="h-auto px-6 py-3 rounded-lg bg-[#3A6784] hover:bg-[#2d5268] text-white text-base font-['Roboto'] w-full"
            onClick={handleAddFeedback}
          >
            Add Feedback
          </Button>
          <Button
            variant="default"
            className="h-auto px-6 py-3 rounded-lg bg-[#3A6784] hover:bg-[#2d5268] text-white text-base font-['Roboto'] w-full"
            asChild
          >
            <Link href="/preceptor/previousFeedbacks">View Previous Feedback</Link>
          </Button>
        </div>
      </div>
    </PreceptorLayout>
  );
}
