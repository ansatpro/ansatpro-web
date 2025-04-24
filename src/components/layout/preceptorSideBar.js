"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Home, PlusCircle, FileText, Settings } from "lucide-react";

const navItems = [
  { label: "Home", icon: Home, path: "/preceptor/home" },
  { label: "Add", icon: PlusCircle, path: "/preceptor/searchStudents", isButton: true },
  { label: "Feedback", icon: FileText, path: "/preceptor/previousFeedbacks" },
  { label: "Settings", icon: Settings, path: "/preceptor/settings" },
];

export default function PreceptorSideBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="fixed top-14 left-0 bottom-0 w-20 bg-white border-r border-gray-200">
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
  );
}
