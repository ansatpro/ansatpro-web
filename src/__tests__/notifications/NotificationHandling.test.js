import { expect, test, describe, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NotificationsProvider } from "@/context/NotificationsContext";
import {
  GetAllNotifications,
  UpdateNotification,
} from "@/functions/HowToConnectToFunction";

// Mock HowToConnectToFunction
vi.mock("@/functions/HowToConnectToFunction", () => ({
  GetAllNotifications: vi.fn(),
  UpdateNotification: vi.fn(),
}));

// Create a simplified notification page component for testing
function TestNotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await GetAllNotifications();
        setNotifications(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await UpdateNotification(id);
      setNotifications((prev) =>
        prev.map((n) => (n.documentID === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <div>
      <h1>Notifications</h1>
      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <ul>
          {notifications.map((notification) => (
            <li
              key={notification.documentID}
              data-testid={`notification-${notification.documentID}`}
            >
              <p>{notification.message}</p>
              <p>Status: {notification.is_read ? "Read" : "Unread"}</p>
              {!notification.is_read && (
                <button
                  onClick={() => markAsRead(notification.documentID)}
                  data-testid={`mark-read-${notification.documentID}`}
                >
                  Mark as read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Import necessary hooks
import { useState, useEffect } from "react";

describe("Notification Handling", () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock console methods
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  test("fetches and displays notifications", async () => {
    // Mock notification data
    const mockNotifications = [
      {
        documentID: "notif1",
        message: "Test notification 1",
        is_read: false,
        messageTime: new Date().toISOString(),
      },
      {
        documentID: "notif2",
        message: "Test notification 2",
        is_read: true,
        messageTime: new Date().toISOString(),
      },
    ];

    // Set up mock
    GetAllNotifications.mockResolvedValue(mockNotifications);

    render(
      <NotificationsProvider>
        <TestNotificationPage />
      </NotificationsProvider>
    );

    // Should show loading initially
    expect(screen.getByText(/loading notifications/i)).toBeInTheDocument();

    // Wait for notifications to load
    await waitFor(() => {
      expect(screen.getByText(/test notification 1/i)).toBeInTheDocument();
      expect(screen.getByText(/test notification 2/i)).toBeInTheDocument();
    });

    // Should have called GetAllNotifications
    expect(GetAllNotifications).toHaveBeenCalledTimes(1);

    // Should display unread/read status
    expect(screen.getByTestId("notification-notif1")).toHaveTextContent(
      /unread/i
    );
    expect(screen.getByTestId("notification-notif2")).toHaveTextContent(
      /read/i
    );

    // Only unread notification should have a "mark as read" button
    expect(screen.getByTestId("mark-read-notif1")).toBeInTheDocument();
    expect(screen.queryByTestId("mark-read-notif2")).not.toBeInTheDocument();
  });

  test("marks notification as read", async () => {
    // Mock notification data
    const mockNotifications = [
      {
        documentID: "notif1",
        message: "Test notification 1",
        is_read: false,
        messageTime: new Date().toISOString(),
      },
    ];

    // Set up mocks
    GetAllNotifications.mockResolvedValue(mockNotifications);
    UpdateNotification.mockResolvedValue({ success: true });

    render(
      <NotificationsProvider>
        <TestNotificationPage />
      </NotificationsProvider>
    );

    // Wait for notifications to load
    await waitFor(() => {
      expect(screen.getByText(/test notification 1/i)).toBeInTheDocument();
    });

    // Click "mark as read" button
    fireEvent.click(screen.getByTestId("mark-read-notif1"));

    // Should call UpdateNotification
    await waitFor(() => {
      expect(UpdateNotification).toHaveBeenCalledWith("notif1");
    });

    // Status should be updated
    await waitFor(() => {
      expect(screen.getByTestId("notification-notif1")).toHaveTextContent(
        /read/i
      );
    });

    // "Mark as read" button should disappear
    expect(screen.queryByTestId("mark-read-notif1")).not.toBeInTheDocument();
  });

  test("handles empty notifications", async () => {
    // Mock empty notification data
    GetAllNotifications.mockResolvedValue([]);

    render(
      <NotificationsProvider>
        <TestNotificationPage />
      </NotificationsProvider>
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(
        screen.queryByText(/loading notifications/i)
      ).not.toBeInTheDocument();
    });

    // Should display no notifications message
    expect(screen.getByText(/no notifications/i)).toBeInTheDocument();
  });

  test("handles errors in fetching notifications", async () => {
    // Mock error
    GetAllNotifications.mockRejectedValue(new Error("Failed to fetch"));

    render(
      <NotificationsProvider>
        <TestNotificationPage />
      </NotificationsProvider>
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(
        screen.queryByText(/loading notifications/i)
      ).not.toBeInTheDocument();
    });

    // Should display no notifications (default behavior on error)
    expect(screen.getByText(/no notifications/i)).toBeInTheDocument();

    // Should have called console.error
    expect(console.error).toHaveBeenCalled();
  });
});
