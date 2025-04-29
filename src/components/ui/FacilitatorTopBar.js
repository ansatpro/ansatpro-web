"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { account, realtimeClient } from "@/app/appwrite";
import { GetAllNotifications } from "../../../lib/HowToConnectToFunction";
import { useNotifications } from "@/context/NotificationsContext";

export default function FacilitatorTopBar() {
  const router = useRouter(); // Initialize useRouter
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { hasNotifications, setHasNotifications, setFinalNotification } =
    useNotifications();
  const [currentUser, setCurrentUser] = useState();
  // const [notifications, setNotifications] = useState([]);
  const [triggerGetNotifications, setTriggerGetNotifications] = useState(false);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await account.get();
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      const res = await GetAllNotifications();
      // console.log(res);

      const finalNotification = res.map((notification) => ({
        notification_DocId: notification.documentID,
        message: notification.message,
        read: notification.is_read,
        createdAt: notification.messageTime,
      }));

      console.log("finalNotification:", finalNotification);

      // Check if any notification is unread
      const hasUnread = res.some(
        (notification) => notification.is_read === false
      );

      if (hasUnread) {
        setHasNotifications(true);
      } else {
        setHasNotifications(false);
      }

      // Update the finalNotification in context
      setFinalNotification(finalNotification);
      setTriggerGetNotifications(false);
    };

    fetchNotifications();
  }, [triggerGetNotifications, setHasNotifications, setFinalNotification]);

  // Use realtime to check for notifications
  useEffect(() => {
    if (!currentUser) return; // Don't subscribe if no user or not on client side

    try {
      const unsubscribe = realtimeClient.subscribe("documents", (response) => {
        // notification is created
        if (
          response.events.includes(
            `databases.${process.env.NEXT_PUBLIC_DB_ID}.collections.notifications.documents.*.create`
          ) &&
          response.payload.recipient_id === currentUser.$id
        ) {
          setTriggerGetNotifications(true);
        } else if (
          response.events.includes(
            `databases.${process.env.NEXT_PUBLIC_DB_ID}.collections.notifications.documents.*.delete`
          ) &&
          response.payload.recipient_id === currentUser.$id
        ) {
          setTriggerGetNotifications(true);
        } else if (
          response.events.includes(
            `databases.${process.env.NEXT_PUBLIC_DB_ID}.collections.notifications.documents.*.update`
          ) &&
          response.payload.recipient_id === currentUser.$id
        ) {
          setTriggerGetNotifications(true);
        }
      });

      // Cleanup subscription
      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error("Failed to subscribe to notifications:", error);
    }
  }, [currentUser]);

  // Handle logout logic
  const handleLogout = () => {
    setIsLoading(true); // Show loading state
    setError(""); // Clear any existing errors

    try {
      // Clear any locally stored authentication data
      localStorage.removeItem("jwt"); // Remove JWT
      localStorage.removeItem("user"); // Remove user data if stored
      localStorage.removeItem("ansatpro_feedbacks"); // Remove feedback data
      localStorage.removeItem("ansatpro_current_feedback"); // Remove current feedback
      localStorage.removeItem("ansatpro_students"); // Remove student data
      localStorage.removeItem("ansatpro_selected_student"); // Remove selected student

      // Wait for state changes to complete, then navigate
      setTimeout(() => {
        router.push("/auth/login");
      }, 100); // Use a small delay to ensure router handles the change
    } catch (err) {
      // Log the error and display a friendly message
      console.error("Logout failed:", err);
      setError("Failed to log out. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white z-40 border-b border-gray-200">
      <div className="h-full px-3 md:px-6 flex justify-between items-center">
        {/* Logo and Home Link */}
        <Link href="/facilitator/home" className="flex items-center">
          <Image src="/logo.svg" alt="ANSAT Pro" width={32} height={32} />
          <span className="ml-2 font-semibold text-[#3A6784]">ANSAT Pro</span>
        </Link>

        {/* Notification and Logout Buttons */}
        <div className="flex items-center gap-2">
          {/* Notification Button */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center justify-center "
              onClick={() => router.push("/facilitator/notification")}
            >
              <Bell className="h-4 w-4" />
            </Button>

            {/* Notification indicator */}
            {hasNotifications && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </div>

          {/* Logout Button */}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={handleLogout}
            disabled={isLoading} // Disable button while logging out
          >
            <LogOut className="h-4 w-4 md:mr-2" />
            <span>{isLoading ? "Logging out..." : "Log out"}</span>
          </Button>
        </div>
      </div>

      {/* Display an error message if logout fails */}
      {error && (
        <div className="absolute top-16 left-0 right-0 text-center text-red-500">
          {error}
        </div>
      )}
    </header>
  );
}
