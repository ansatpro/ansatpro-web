"use client";
import Link from "next/link";
import Image from "next/image";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PreceptorTopBar() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = () => {
    setIsLoading(true);
    setError("");
    try {
      localStorage.removeItem("jwt");
      setTimeout(() => {
        router.push("/auth/login");
      }, 100);
    } catch (err) {
      setError("Failed to log out. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white z-40 border-b border-gray-200">
      <div className="h-full px-6 flex justify-between items-center">
        <Link href="/preceptor/home" className="flex items-center">
          <Image src="/logo.svg" alt="ANSAT Pro" width={32} height={32} />
          <span className="ml-2 font-semibold text-[#3A6784]">ANSAT Pro</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/preceptor/settings" className="hover:bg-gray-100 p-2 rounded-full">
            <User className="h-6 w-6 text-gray-600" />
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={handleLogout}
            disabled={isLoading}
          >
            <LogOut className="h-4 w-4 md:mr-2" />
            <span>{isLoading ? "Logging out..." : "Log out"}</span>
          </Button>
        </div>
      </div>
      {error && (
        <div className="absolute top-16 left-0 right-0 text-center text-red-500">
          {error}
        </div>
      )}
    </header>
  );
}
