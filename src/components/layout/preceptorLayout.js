"use client";

import PreceptorTopBar from "./preceptorTopBar";
import PreceptorSideBar from "./preceptorSideBar";

export default function PreceptorLayout({ children }) {
  return (
    <div className="bg-white min-h-screen">
      <PreceptorTopBar />
      <PreceptorSideBar />
      <main className="pt-14 md:ml-20 pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
}
