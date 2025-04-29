/**
 * @fileoverview Preceptor Layout Component
 * @description Main layout component for the preceptor interface, combining top bar, side bar and main content area.
 */

"use client";

import PreceptorTopBar from "./preceptorTopBar";
import PreceptorSideBar from "./preceptorSideBar";

/**
 * @function PreceptorLayout
 * @description Layout component that provides the basic structure for preceptor pages
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be rendered in the main content area
 * @returns {JSX.Element} The layout component with top bar, side bar and main content area
 */
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
