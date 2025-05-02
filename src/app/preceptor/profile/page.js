"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account, storage } from "@/app/appwrite";
import PreceptorLayout from "@/components/layout/preceptorLayout";
import Image from "next/image"; 

// Helper: Add cache buster
function addCacheBuster(url) {
  if (url.includes("?")) {
    return url + `&cb=${Date.now()}`;
  } else {
    return url + `?cb=${Date.now()}`;
  }
}

export default function PreceptorProfilePage() {
  const [user, setUser] = useState({ name: "", email: "", role: "" });
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await account.get();
        setUser({
          name: res.name || "N/A",
          email: res.email || "N/A",
        });

        const avatar = await loadUserAvatar(res.$id);
        setAvatarUrl(avatar);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, []);

  async function loadUserAvatar(userId) {
    try {
      await storage.getFile(
        process.env.NEXT_PUBLIC_STORAGE_BUCKET_ID,
        userId
      );

      const rawUrl = storage.getFileView(
        process.env.NEXT_PUBLIC_STORAGE_BUCKET_ID,
        userId
      );
      return addCacheBuster(rawUrl);
    } catch (err) {
      console.warn("No custom avatar found, using default.");

      const fallbackUrl = storage.getFileView(
        process.env.NEXT_PUBLIC_STORAGE_BUCKET_ID,
        process.env.NEXT_PUBLIC_DEFAULT_AVATAR_ID
      );
      return addCacheBuster(fallbackUrl);
    }
  }

  async function replaceUserAvatar(userId, file) {
    try {
      await storage.deleteFile(
        process.env.NEXT_PUBLIC_STORAGE_BUCKET_ID,
        userId
      );
    } catch (err) {
      if (err.code !== 404) {
        console.error("Failed to delete old avatar:", err.message);
        throw err;
      }
    }

    const uploaded = await storage.createFile(
      process.env.NEXT_PUBLIC_STORAGE_BUCKET_ID,
      userId,
      file
    );
    // After successful avatar upload
    window.dispatchEvent(new Event("avatarRefresh"));
    console.log("✅ avatarRefresh event dispatched!");

    const rawUrl = storage.getFileView(
      process.env.NEXT_PUBLIC_STORAGE_BUCKET_ID,
      uploaded.$id
    );
    return addCacheBuster(rawUrl);
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const userInfo = await account.get();
      const newAvatar = await replaceUserAvatar(userInfo.$id, file);
      setAvatarUrl(newAvatar);
      alert("✅ Avatar updated!");
    } catch (err) {
      alert("❌ Failed to upload avatar: " + err.message);
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <PreceptorLayout>
      <main className="p-8 font-['Roboto']">
        <div className="max-w-xl mx-auto">
          <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
            <div className="relative mb-4">
              <label className="cursor-pointer group">
                {avatarUrl && (
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 group-hover:opacity-80 transition"
                    unoptimized
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={isUploading}
                />
                <span className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow group-hover:bg-gray-100 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 002.828 2.828L18 10.828M7 17h.01M5 19a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12z" />
                  </svg>
                </span>
              </label>
            </div>

            <h2 className="text-lg font-semibold mb-4">Profile information</h2>

            <div className="border-t pt-2 space-y-3 w-full">
              <div className="flex justify-between">
                <span className="text-gray-600">Name</span>
                <span>{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email Address</span>
                <span>{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role</span>
                <span>preceptor</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PreceptorLayout>
  );
}
