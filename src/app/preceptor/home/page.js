"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import PreceptorLayout from "@/components/layout/preceptorLayout";

export default function PreceptorHome() {
  const router = useRouter();

  return (
    <PreceptorLayout>
      <div className="flex flex-col items-center pt-32">
        <h1 className="text-3xl font-semibold mb-1 font-['Roboto']">HOME</h1>
        <p className="text-xl italic text-[#64748B] mb-12 font-['Roboto']">WELCOME!</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-xs md:max-w-xl px-4">
          <Button
            variant="default"
            className="h-auto px-6 py-2 rounded-lg bg-[#3A6784] hover:bg-[#2d5268] text-white text-base font-['Roboto'] w-full"
            onClick={() => router.push("/preceptor/searchStudents")}
          >
            Add Feedback
          </Button>
          <Button
            variant="default"
            className="h-auto px-6 py-2 rounded-lg bg-[#3A6784] hover:bg-[#2d5268] text-white text-base font-['Roboto'] w-full"
            onClick={() => router.push("/preceptor/previousFeedbacks")}
          >
            View Previous Feedback
          </Button>
        </div>
      </div>
    </PreceptorLayout>
  );
}
