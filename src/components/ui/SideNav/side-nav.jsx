"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useNavigation } from "@/context/NavigationContext";

import { links } from "./links";

/**
 * SideNav component that provides navigation for the application
 * Responsive design: displays as bottom navigation bar on mobile and left sidebar on large screens
 * Uses NavigationContext to highlight active links
 *
 */
export default function SideNav() {
  const { isLinkActive } = useNavigation();

  return (
    <>
      <nav
        className="fixed bottom-0 z-50 flex w-full items-center justify-around bg-background text-gray-600 font-light py-5 border-t-1 
    lg:border-0 lg:left-0 lg:top-36 lg:h-auto lg:w-20 lg:flex-col lg:justify-start lg:pt-6 lg:gap-8"
      >
        {links.map((link) => {
          const isActive = isLinkActive(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs",
                isActive ? "text-teal-400" : " hover:text-teal-400"
              )}
              prefetch={false}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
