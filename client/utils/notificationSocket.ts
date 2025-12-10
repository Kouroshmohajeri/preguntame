import { useEffect, useState } from "react";
import { getSocket } from "./socket"; // your SocketManager

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  icon: string;
  color: string;
  time: string;
  read: boolean;
}

export default function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!userId) return;
    const socket = getSocket();

    // Connect socket if not already connected
    if (!socket.connected) socket.connect();

    // Join the user-specific notifications room
    socket.emit("joinNotifications", { userId });

    // Listen for updates
    const handleUpdate = (list: Notification[]) => setNotifications(list);
    const handleSingleUpdate = (updated: Notification) => {
      setNotifications((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    };

    socket.on("notificationsUpdate", handleUpdate);
    socket.on("notificationUpdated", handleSingleUpdate);

    // Cleanup on unmount or userId change
    return () => {
      socket.off("notificationsUpdate", handleUpdate);
      socket.off("notificationUpdated", handleSingleUpdate);
    };
  }, [userId]);

  const markAsRead = (id: string) => getSocket()?.emit("markNotificationRead", { id, userId });
  const markAllAsRead = () => getSocket()?.emit("markAllNotificationsRead", { userId });
  const deleteNotification = (id: string) =>
    getSocket()?.emit("deleteNotification", { id, userId });
  const clearAll = () => getSocket()?.emit("clearAllNotifications", { userId });

  return { notifications, markAsRead, markAllAsRead, deleteNotification, clearAll };
}
