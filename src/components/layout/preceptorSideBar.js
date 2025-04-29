/**
 * @fileoverview Preceptor Side Bar Component
 * @description Navigation sidebar component for the preceptor interface, providing navigation links to different sections.
 */

"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Home, PlusCircle, FileText, Settings } from "lucide-react";

/**
 * @constant {Array} navItems
 * @description Navigation items configuration for the sidebar
 * @type {Array<{label: string, icon: React.Component, path: string, isButton?: boolean}>}
 */
const navItems = [
  { label: "Home", icon: Home, path: "/preceptor/home" },
  { label: "Add", icon: PlusCircle, path: "/preceptor/searchStudents", isButton: true },
  { label: "Feedback", icon: FileText, path: "/preceptor/previousFeedbacks" },
  { label: "Settings", icon: Settings, path: "/preceptor/settings" },
];

/**
 * @function PreceptorSideBar
 * @description Sidebar navigation component for preceptor interface
 * @returns {JSX.Element} The sidebar component with navigation links
 */
export default function PreceptorSideBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar - Left side */}
      <aside className="fixed top-14 left-0 bottom-0 w-20 bg-white border-r border-gray-200 hidden md:block z-30">
        <nav className="h-[45vh] mt-4 flex flex-col items-center justify-between">
          {navItems.map((item, index) => {
            const isActive = pathname.startsWith(item.path);
            const Icon = item.icon;

            const baseStyle =
              "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 hover:cursor-pointer";
            const activeStyle = isActive
              ? "bg-blue-50 text-[#3A6784]"
              : "text-gray-500 hover:text-[#3A6784] hover:bg-gray-100";

            const content = (
              <>
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium mt-1">{item.label}</span>
              </>
            );

            return item.isButton ? (
              <button
                key={index}
                onClick={() => router.push(item.path)}
                className={`${baseStyle} ${activeStyle}`}
              >
                {content}
              </button>
            ) : (
              <Link key={index} href={item.path} className={`${baseStyle} ${activeStyle}`}>
                {content}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar - Bottom */}
      <aside className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-30">
        <nav className="flex items-center justify-around py-2">
          {navItems.map((item, index) => {
            const isActive = pathname.startsWith(item.path);
            const Icon = item.icon;

            const baseStyle =
              "flex flex-col items-center justify-center py-1 px-2 w-16 transition-all duration-200 hover:cursor-pointer";
            const activeStyle = isActive
              ? "text-[#3A6784]"
              : "text-gray-500 hover:text-[#3A6784]";

            const content = (
              <>
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium mt-1">{item.label}</span>
              </>
            );

            return item.isButton ? (
              <button
                key={index}
                onClick={() => router.push(item.path)}
                className={`${baseStyle} ${activeStyle}`}
              >
                {content}
              </button>
            ) : (
              <Link key={index} href={item.path} className={`${baseStyle} ${activeStyle}`}>
                {content}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
