"use client";

import PreceptorTopBar from "./preceptorTopBar";
import PreceptorSideBar from "./preceptorSideBar";

export default function PreceptorLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 顶栏固定 */}
      <div className="h-14 shrink-0">
        <PreceptorTopBar />
      </div>

      {/* 主体区域弹性撑满 */}
      <main className="flex-grow overflow-hidden md:ml-20">
        {children}
      </main>

      {/* 底栏只在移动端显示 */}
      <div className="h-16 shrink-0 md:hidden">
        <PreceptorSideBar />
      </div>

      {/* 侧边栏在大屏显示 */}
      <div className="hidden md:block">
        <PreceptorSideBar />
      </div>
    </div>
  );
} 