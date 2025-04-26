"use client";
import Link from "next/link";
import Image from "next/image";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { account, storage } from "@/app/appwrite";

// Helper: Add cache buster
function addCacheBuster(url) {
  if (url.includes("?")) {
    return url + `&cb=${Date.now()}`;
  } else {
    return url + `?cb=${Date.now()}`;
  }
}

export default function PreceptorTopBar() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // ✅ Move fetchAvatar outside
  const fetchAvatar = async () => {
    try {
      const user = await account.get();
      try {
        await storage.getFile(
          process.env.NEXT_PUBLIC_STORAGE_BUCKET_ID,
          user.$id
        );
        const userAvatar = storage.getFileView(
          process.env.NEXT_PUBLIC_STORAGE_BUCKET_ID,
          user.$id
        );
        setAvatarUrl(addCacheBuster(userAvatar));
      } catch (err) {
        const defaultAvatar = storage.getFileView(
          process.env.NEXT_PUBLIC_STORAGE_BUCKET_ID,
          process.env.NEXT_PUBLIC_DEFAULT_AVATAR_ID
        );
        setAvatarUrl(addCacheBuster(defaultAvatar));
      }
    } catch (err) {
      console.error("Failed to load avatar:", err);
    }
  };

  useEffect(() => {
    fetchAvatar(); // First load
  }, []);

  useEffect(() => {
    const handleAvatarRefresh = () => {
      fetchAvatar();
    };

    window.addEventListener("avatarRefresh", handleAvatarRefresh);

    return () => {
      window.removeEventListener("avatarRefresh", handleAvatarRefresh);
    };
  }, []);


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
          <Link href="/preceptor/profile" className="hover:bg-gray-100 p-2 rounded-full">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            )}
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
