"use client";

import { useEffect, useState } from "react";
import { account } from "@/app/appwrite";
import PreceptorLayout from "@/components/layout/preceptorLayout";

export default function PreceptorProfilePage() {
  const [user, setUser] = useState({ name: "", email: "", role: "" });
  const [avatarUrl, setAvatarUrl] = useState("https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"); // Default avatar

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await account.get();
        setUser({
          name: res.name || "N/A",
          email: res.email || "N/A",
          role: res.labels?.includes("Facilitator") ? "Facilitator" : "Preceptor",
        });
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    // 先取本地保存的头像
    const savedAvatar = localStorage.getItem("preceptor-avatar");
    if (savedAvatar) {
      setAvatarUrl(savedAvatar);
    }

    fetchUser();
  }, []);

  // Handle avatar file change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarUrl(event.target.result);
        localStorage.setItem("preceptor-avatar", event.target.result); // 保存到 localStorage
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <PreceptorLayout>
      <main className="p-8 font-['Roboto']">
        <div className="max-w-xl mx-auto">
          <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
            <div className="relative mb-4">
              <label className="cursor-pointer group">
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 group-hover:opacity-80 transition"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
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
                <span>{user.role}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PreceptorLayout>
  );
}
