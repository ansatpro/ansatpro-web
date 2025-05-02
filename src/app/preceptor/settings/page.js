"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { account } from "@/app/appwrite";
import PreceptorLayout from "@/components/layout/preceptorLayout";
import { Button } from "@/components/ui/button";


function hasSequentialChars(str) {
  const sequences = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const reversed = sequences.split('').reverse().join('');
  for (let i = 0; i <= str.length - 4; i++) {
    const part = str.slice(i, i + 4).toLowerCase();
    if (sequences.includes(part) || reversed.includes(part)) {
      return true;
    }
  }
  return false;
}

function isStrongPassword(pw) {
  const lengthOK = pw.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const noSeq = !hasSequentialChars(pw);
  return lengthOK && hasLetter && hasNumber && noSeq;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState({ name: "", email: "", role: "" });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showHelp, setShowHelp] = useState(false);

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
      localStorage.removeItem("jwt");
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

            {error && <p className="text-red-600 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}

            <div className="flex flex-col gap-2 relative">
              <label className="text-sm font-medium">Current Password</label>
              <input
                type={showOldPassword ? "text" : "password"}
                className="border p-2 rounded pr-10"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-[38px] text-gray-500"
              >
                {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex flex-col gap-2 relative">
              <label className="text-sm font-medium">New Password</label>
              <input
                type={showNewPassword ? "text" : "password"}
                className="border p-2 rounded pr-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-[38px] text-gray-500"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex flex-col gap-2 relative">
              <label className="text-sm font-medium">Confirm New Password</label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="border p-2 rounded pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[38px] text-gray-500"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordModal(false);
                  setOldPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setError("");
                  setSuccess("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  setError("");
                  setSuccess("");
                  if (newPassword !== confirmPassword) {
                    setError("❌ Passwords do not match.");
                    return;
                  }
                  if (!isStrongPassword(newPassword)) {
                    setError("❌ Password must be at least 8 characters, contain letters and numbers, and not include 4+ sequential characters.");
                    return;
                  }
                  try {
                    await account.updatePassword(newPassword, oldPassword);
                    setSuccess("✅ Password updated successfully!");
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setShowPasswordModal(false);
                  } catch (err) {
                    setError("❌ Failed to update password: " + err.message);
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
        <div className="max-w-xl mx-auto">
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
            </div>
          </div>
        </div>
      </main>
    </PreceptorLayout>
  );
}
