"use client";

import { createContext, useContext, useState } from "react";

const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
  const [hasNotifications, setHasNotifications] = useState(false);
  const [finalNotification, setFinalNotification] = useState([]);

  return (
    <NotificationsContext.Provider
      value={{
        hasNotifications,
        setHasNotifications,
        finalNotification,
        setFinalNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
}
