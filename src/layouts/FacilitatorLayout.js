"use client";

import FacilitatorTopBar from "@/components/ui/FacilitatorTopBar";
import FacilitatorSideBar from "@/components/ui/FacilitatorSideBar";

export default function FacilitatorLayout({ children }) {
  return (
    <div className="bg-white min-h-screen">
      <FacilitatorTopBar />
      <FacilitatorSideBar />
      <main className="pt-20 md:pl-24 px-4 md:pr-6 pb-20 md:pb-6 min-h-screen">
        {children}
      </main>
    </div>
  );
}