"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import PreceptorLayout from "@/components/layout/preceptorLayout";
import { Button } from "@/components/ui/button";

export default function FeedbackSuccessPage() {
  return (
    <PreceptorLayout>
      <main className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
        {/* 对勾图标 */}
        <CheckCircle className="w-24 h-24 text-green-500 mb-6" />

        {/* 成功标题 */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Submitted Successfully
        </h2>

        {/* 返回按钮 */}
        <Link href="/preceptor/searchStudents">
          <Button className="bg-[#3A6784] hover:bg-[#2d5268] text-white text-base px-6 py-2">
            Back to Previous
          </Button>
        </Link>
      </main>
    </PreceptorLayout>
  );
}
