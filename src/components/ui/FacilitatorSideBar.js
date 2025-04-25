"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Home, Users, MessageSquareText, Download, Settings } from "lucide-react";

const navItems = [
  { href: "/facilitator/home", label: "Home", icon: <Home /> },
  { href: "/facilitator/student", label: "Students", icon: <Users /> },
  { href: "/facilitator/feedback", label: "Feedback", icon: <MessageSquareText /> },
  { href: "/facilitator/export", label: "Export", icon: <Download /> },
  { href: "/facilitator/settings", label: "Settings", icon: <Settings /> },
];

export default function FacilitatorSideBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar - Left side */}
      <aside className="fixed top-14 left-0 bottom-0 w-20 bg-white border-r border-gray-200 hidden md:block z-30">
        <nav className="h-[45vh] mt-4 flex flex-col items-center justify-between">
          {navItems.map((item, index) => {
            const isActive = pathname.startsWith(item.href);

            const baseStyle =
              "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200";
            const activeStyle = isActive
              ? "bg-blue-50 text-[#3A6784]"
              : "text-gray-500 hover:text-[#3A6784] hover:bg-gray-100";

            return (
              <Link key={index} href={item.href} className={`${baseStyle} ${activeStyle}`}>
                {item.icon}
                <span className="text-xs font-medium mt-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar - Bottom */}
      <aside className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-30">
        <nav className="flex items-center justify-around py-2">
          {navItems.map((item, index) => {
            const isActive = pathname.startsWith(item.href);

            const baseStyle =
              "flex flex-col items-center justify-center py-1 px-2 w-16 transition-all duration-200";
            const activeStyle = isActive
              ? "text-[#3A6784]"
              : "text-gray-500 hover:text-[#3A6784]";

            return (
              <Link key={index} href={item.href} className={`${baseStyle} ${activeStyle}`}>
                {item.icon}
                <span className="text-xs font-medium mt-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}