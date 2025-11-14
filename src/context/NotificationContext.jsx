import { createContext, useContext, useEffect, useState } from "react";
import { listenNotifications, markNotificationRead, sendNotification } from "../services/notificationService";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const unsubscribe = listenNotifications(user.uid, (list) => {
      setNotifications(list);
      setLoading(false);
    });

    return () => unsubscribe && unsubscribe();
  }, [user?.uid]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      loading,
      send: sendNotification,
      markAsRead: markNotificationRead,
      unreadCount: notifications.filter(n => !n.read).length
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
