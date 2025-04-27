"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Bell,
  MessageSquare,
  User,
  Calendar,
  Target,
  CheckCircle,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  GetAllNotifications,
  UpdateNotification,
} from "../../../../lib/HowToConnectToFunction";
import { useNotifications } from "@/context/NotificationsContext";

// 本地存储键名
const STORAGE_KEY = "ansatpro_notification_read_status";

export default function NotificationPage() {
  const router = useRouter();
  const { finalNotification, setFinalNotification } = useNotifications();
  const [showReadNotifications, setShowReadNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Update unreadCount and loading state whenever finalNotification changes
  useEffect(() => {
    const count = finalNotification.filter(
      (notification) => !notification.read
    ).length;
    setUnreadCount(count);
    setIsLoading(false); // Set loading to false when we have notifications
  }, [finalNotification]);

  // 从localStorage加载已读状态
  const loadReadStatus = () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error("Error loading read status from localStorage:", error);
    }
    return {};
  };

  // 保存已读状态到localStorage
  const saveReadStatus = (readStatusMap) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(readStatusMap));
    } catch (error) {
      console.error("Error saving read status to localStorage:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);

      // Get notifications from backend
      const res = await GetAllNotifications();
      console.log("Raw notifications:", res);

      if (res && Array.isArray(res)) {
        // Process notifications consistently with FacilitatorTopBar
        const finalNotification = res.map((notification) => ({
          notification_DocId: notification.documentID,
          message: notification.message,
          read: notification.is_read,
          createdAt: notification.messageTime,
        }));

        console.log("Processed notifications:", finalNotification);

        // Sort notifications by date (newest first)
        finalNotification.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return isNaN(dateB) ? -1 : isNaN(dateA) ? 1 : dateB - dateA;
        });

        setNotifications(finalNotification);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      if (!dateString) return "Unknown date";

      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateString);
        return "Unknown date";
      }

      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // If less than 24 hours, show relative time
      if (diffDays === 0) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours === 0) {
          const diffMinutes = Math.floor(diffTime / (1000 * 60));
          return `${diffMinutes} minutes ago`;
        }
        return `${diffHours} hours ago`;
      }
      // If less than 7 days, show days ago
      else if (diffDays < 7) {
        return `${diffDays} days ago`;
      }
      // Otherwise show full date
      else {
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown date";
    }
  };

  // Mark notification as read and navigate to feedback details
  const handleNotificationClick = (notification) => {
    try {
      if (!notification.is_read) {
        // 更新通知状态
        markAsReadInternal(notification.notification_DocId);

        // update in the backend
        const res = async () => {
          await UpdateNotification(notification.notification_DocId);
        };
        res();
      }

      // Navigate to appropriate page
      if (notification.feedbackId) {
        router.push(
          `/facilitator/feedback/${notification.feedbackId}/studentDetail`
        );
      }
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  // Internal function to mark notification as read
  const markAsReadInternal = (notificationId) => {
    // 更新状态中的通知
    const updatedNotifications = finalNotification.map((item) =>
      item.notification_DocId === notificationId
        ? { ...item, read: true }
        : item
    );

    // Update the context state
    setFinalNotification(updatedNotifications);

    // 更新本地存储
    const readStatusMap = loadReadStatus();
    readStatusMap[notificationId] = true;
    saveReadStatus(readStatusMap);
  };

  // Mark a single notification as read without navigation
  const markAsRead = (notification, e) => {
    e.stopPropagation(); // Prevent card click event
    try {
      markAsReadInternal(notification.notification_DocId);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // 已读状态映射
      const readStatusMap = loadReadStatus();

      // 更新所有通知为已读
      const updatedNotifications = finalNotification.map((item) => {
        readStatusMap[item.notification_DocId] = true;
        return { ...item, read: true };
      });

      // Update the context state
      setFinalNotification(updatedNotifications);

      // 保存更新后的状态到localStorage
      saveReadStatus(readStatusMap);

      // Update each notification in the backend
      for (const notification of finalNotification) {
        if (!notification.read) {
          await UpdateNotification(notification.notification_DocId);
        }
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // 重新加载通知
  const refreshNotifications = () => {
    // No need to fetch notifications as they come from context
  };

  // Toggle between unread and read notifications
  const toggleReadNotifications = () => {
    setShowReadNotifications(!showReadNotifications);
  };

  // Filter for unread and read notifications
  const unreadNotifications = finalNotification.filter(
    (notification) => !notification.read
  );
  const readNotifications = finalNotification.filter(
    (notification) => notification.read
  );

  // Determine which notifications to display
  const displayedNotifications = showReadNotifications
    ? readNotifications
    : unreadNotifications;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 text-foreground">
      {/* Header with back button */}
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9 border bg-background text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Notifications
          </h1>
        </div>

        {unreadCount > 0 && !showReadNotifications && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="border bg-background text-foreground text-xs md:text-sm"
          >
            Mark all as read
          </Button>
        )}
      </header>

      {/* Toggle button between unread and read */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant={!showReadNotifications ? "default" : "outline"}
            size="sm"
            onClick={() => setShowReadNotifications(false)}
            className="relative"
          >
            Unread
            {unreadCount > 0 && !showReadNotifications && (
              <Badge
                variant="destructive"
                className="ml-2 bg-red-500 text-white"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
          <Button
            variant={showReadNotifications ? "default" : "outline"}
            size="sm"
            onClick={() => setShowReadNotifications(true)}
          >
            Read
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {showReadNotifications
            ? `${readNotifications.length} read notification${
                readNotifications.length !== 1 ? "s" : ""
              }`
            : `${unreadCount} unread notification${
                unreadCount !== 1 ? "s" : ""
              }`}
        </div>
      </div>

      {/* Notifications content */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-lg text-foreground">Loading notifications...</p>
          </div>
        ) : displayedNotifications.length === 0 ? (
          <Card className="bg-card border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              {showReadNotifications ? (
                <>
                  <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-foreground">
                    No Read Notifications
                  </h3>
                  <p className="text-center text-muted-foreground">
                    You haven't read any notifications yet.
                  </p>
                  {unreadCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowReadNotifications(false)}
                      className="mt-4"
                    >
                      View unread notifications
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-foreground">
                    No Unread Notifications
                  </h3>
                  <p className="text-center text-muted-foreground">
                    You don't have any unread notifications.
                  </p>
                  {readNotifications.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowReadNotifications(true)}
                      className="mt-4"
                    >
                      View read notifications
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          displayedNotifications.map((notification) => (
            <Card
              key={notification.notification_DocId}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md bg-card border ${
                !notification.read ? "border-l-4 border-l-blue-500" : ""
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                  <div className="flex items-start gap-3 w-full md:w-auto">
                    <div
                      className={`mt-1 p-2 rounded-full ${
                        !notification.read ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      <MessageSquare
                        className={`h-5 w-5 ${
                          !notification.read ? "text-blue-600" : "text-gray-600"
                        }`}
                      />
                    </div>

                    <div className="space-y-1 overflow-hidden">
                      {/* Message content */}
                      <p className="text-base font-normal text-foreground break-words">
                        {/* 直接显示消息内容，不再尝试分离学生信息 */}
                        {notification.message}
                        {!notification.read && (
                          <Badge
                            variant="default"
                            className="ml-2 bg-blue-500 text-white"
                          >
                            New
                          </Badge>
                        )}
                      </p>

                      {/* Message time */}
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(notification.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center mt-2">
                    {!notification.read && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-sm flex items-center gap-1"
                        onClick={(e) => markAsRead(notification, e)}
                      >
                        <Check className="h-4 w-4" /> Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <footer className="mt-8 text-center text-sm text-muted-foreground hidden md:block">
        <p>© 2025 ANSAT Pro. All rights reserved.</p>
      </footer>
    </div>
  );
}
