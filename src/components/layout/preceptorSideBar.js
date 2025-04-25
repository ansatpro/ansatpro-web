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
    <aside className="
      fixed 
      left-0 
      bg-white 
      border-t md:border-r border-gray-200 
      z-50 
      w-full md:w-20 
      bottom-0 md:top-14 
      md:bottom-auto
    ">
      <nav className="
        flex 
        flex-row md:flex-col 
        items-center 
        justify-evenly 
        h-16 md:h-[45vh] 
        px-4 md:mt-4
      ">
        {navItems.map((item, index) => {
          const isActive = pathname.startsWith(item.path);
          const Icon = item.icon;

          const baseStyle = "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 hover:cursor-pointer";
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
