"use client";
import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";

export default function PreceptorTopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white z-40 border-b border-gray-200">
      <div className="h-full px-6 flex justify-between items-center">
        <Link href="/preceptor/home" className="flex items-center">
          <Image src="/logo.svg" alt="ANSAT Pro" width={32} height={32} />
          <span className="ml-2 font-semibold text-[#3A6784]">ANSAT Pro</span>
        </Link>
        <Link href="/preceptor/settings" className="hover:bg-gray-100 p-2 rounded-full">
          <User className="h-6 w-6 text-gray-600" />
        </Link>
      </div>
    </header>
  );
}
