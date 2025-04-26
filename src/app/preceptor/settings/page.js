"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/app/appwrite";
import PreceptorLayout from "@/components/layout/preceptorLayout";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState({ name: "", email: "", role: "" });
  const [showHelp, setShowHelp] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

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
        console.error("Failed to load user", err);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      localStorage.removeItem("jwt"); // ✅ clear stored token
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <PreceptorLayout>
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold">Change Password</h2>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Current Password</label>
              <input
                type="password"
                className="border p-2 rounded"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">New Password</label>
              <input
                type="password"
                className="border p-2 rounded"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await account.updatePassword(newPassword, oldPassword);
                    alert("✅ Password updated successfully!");
                    setOldPassword("");
                    setNewPassword("");
                    setShowPasswordModal(false);
                  } catch (error) {
                    alert("❌ Failed to update password: " + error.message);
                  }
                }}
              >
                Update
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="p-8 font-['Roboto']">
        <h1 className="text-3xl font-bold text-center mb-8">Settings</h1>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile info */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Profile information</h2>
            <div className="border-t pt-2 space-y-3">
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

          {/* General settings */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">General</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Password Change</span>
                <Button variant="outline" onClick={() => setShowPasswordModal(true)}>Change</Button>
              </div>

              <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowHelp((prev) => !prev)}>
                <span>Help & Support</span>
                <span className="text-gray-400">{showHelp ? "▲" : "▼"}</span>
              </div>
              {showHelp && (
                <p className="text-sm text-gray-600 ml-2">
                  For any issues or questions, please contact the system administrator or email support@ansatpro.com.
                </p>
              )}

              <div>
                <span className="block font-medium mb-1">About</span>
                <p className="text-sm text-gray-600">
                  This system is designed to support nursing education feedback workflows, aligned with ANSAT standards. Version 1.0.0.
                </p>
              </div>

              <div className="pt-2">
                {/* <Button
                  onClick={handleLogout}
                  className="bg-[#3A6784] hover:bg-[#2d5268] text-white"
                >
                  Logout
                </Button> */}
              </div>
            </div>
          </div>
        </div>
      </main>
    </PreceptorLayout>
  );
}
