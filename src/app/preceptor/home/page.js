"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import PreceptorLayout from "@/components/layout/preceptorLayout";


export default function PreceptorHome() {
  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };
  const router = useRouter();

  const handleAddFeedback = () => {
    router.push("/preceptor/searchStudents");
  };

  return (
    <PreceptorLayout>
      <div className="flex flex-col items-center pt-32">
        <h1 className="text-3xl font-semibold mb-1 font-['Roboto']">HOME</h1>

        <p className="text-xl italic text-[#64748B] mb-12 font-['Roboto']">WELCOME!</p>

        <div className="grid grid-cols-2 gap-25 max-w-xl mt-30">
          <Button
            variant="default"
            className="h-auto px-6 py-2 rounded-lg bg-[#3A6784] hover:bg-[#2d5268] text-white text-base font-['Roboto']"
            onClick={handleAddFeedback}
          >
            Add Feedback
          </Button>
          <Button
            variant="default"
            className="h-auto px-6 py-2 rounded-lg bg-[#3A6784] hover:bg-[#2d5268] text-white text-base font-['Roboto']"
            asChild
          >
            <Link href="/preceptor/previousFeedbacks">View Previous Feedback</Link>
          </Button>
        </div>
      </div>
    </PreceptorLayout>
  );
}
