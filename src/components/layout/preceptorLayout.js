"use client";

import PreceptorTopBar from "./preceptorTopBar";
import PreceptorSideBar from "./preceptorSideBar";

export default function PreceptorLayout({ children }) {
  return (
    <div className="bg-white min-h-screen">
      <PreceptorTopBar />
      <PreceptorSideBar />
      <main className="pt-[60px] pb-[64px] md:pt-14 md:pb-0 md:ml-20 min-h-[calc(100vh-72px-64px)] md:min-h-screen">
        {children}
      </main>
    </div>
  );
}
