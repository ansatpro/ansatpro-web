"use client";

import FacilitatorTopBar from "@/components/ui/FacilitatorTopBar";
import FacilitatorSideBar from "@/components/ui/FacilitatorSideBar";
import { useId } from "react";
import DuplicateContentDetector from "@/components/DuplicateContentDetector";

export default function FacilitatorLayout({ children }) {
  // 生成唯一ID以识别布局实例
  const layoutId = useId();
  
  return (
    <div className="bg-white min-h-screen" data-layout-id={layoutId}>
      <DuplicateContentDetector />
      <FacilitatorTopBar />
      <FacilitatorSideBar />
      <main className="pt-20 md:pl-24 px-4 md:pr-6 pb-20 md:pb-6 min-h-screen">
        {children}
      </main>
    </div>
  );
}