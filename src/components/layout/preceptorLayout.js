"use client";

import PreceptorTopBar from "./preceptorTopBar";
import PreceptorSideBar from "./preceptorSideBar";

export default function PreceptorLayout({ children }) {
  return (
    <div className="bg-white min-h-screen">
      <PreceptorTopBar />
      <PreceptorSideBar />
      <main className="pt-14 ml-16 min-h-screen">
        {children}
      </main>
    </div>
  );
}
