import { API } from "../Server";

export interface NotificationData {
  userId: string;
  senderId: string;
  type:
    | "game"
    | "system"
    | "social"
    | "achievement"
    | "beta_request"
    | "beta_approved"
    | "beta_rejected"
    | "beta_revoked";
  title: string;
  message: string;
  icon?: string;
  color?: string;
  data?: {
    gameCode?: string;
    gameTitle?: string;
    [key: string]: any;
  };
  from?: string; // sender email
  to?: string; // receiver email
}

// Create a notification
export const createNotification = async (data: NotificationData) => {
  try {
    const response = await API.post("/notifications", data);
    return response.data;
  } catch (error: any) {
    console.error("Create notification error:", error?.response?.data || error.message);
    throw new Error(error?.response?.data?.error || "Failed to create notification");
  }
};

// Get notifications for a user
export const getUserNotifications = async (userId: string) => {
  try {
    const response = await API.get(`/notifications/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Get notifications error:", error?.response?.data || error.message);
    throw new Error(error?.response?.data?.error || "Failed to fetch notifications");
  }
};

// ✅ UPDATED: Send notification with proper validation
export const sendNotification = async (payload: NotificationData) => {
  try {
    // Validate required fields
    if (!payload.userId || !payload.senderId || !payload.type) {
      throw new Error("Missing required fields: userId, senderId, or type");
    }

    const response = await API.post("/notifications", payload);
    return response.data;
  } catch (error: any) {
    console.error("Send notification error:", error?.response?.data || error.message);
    throw new Error(error?.response?.data?.error || "Failed to send notification");
  }
};

// Mark a notification as read
export const markNotificationRead = async (id: string) => {
  try {
    const response = await API.put(`/notifications/read/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Mark notification read error:", error?.response?.data || error.message);
    throw new Error(error?.response?.data?.error || "Failed to mark notification as read");
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsRead = async (userId: string) => {
  try {
    const response = await API.put(`/notifications/read-all/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Mark all notifications read error:", error?.response?.data || error.message);
    throw new Error(error?.response?.data?.error || "Failed to mark all notifications as read");
  }
};

// Delete a notification
export const deleteNotification = async (id: string) => {
  try {
    const response = await API.delete(`/notifications/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Delete notification error:", error?.response?.data || error.message);
    throw new Error(error?.response?.data?.error || "Failed to delete notification");
  }
};

// Clear all notifications for a user
export const clearAllNotifications = async (userId: string) => {
  try {
    const response = await API.delete(`/notifications/clear/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Clear notifications error:", error?.response?.data || error.message);
    throw new Error(error?.response?.data?.error || "Failed to clear notifications");
  }
};
