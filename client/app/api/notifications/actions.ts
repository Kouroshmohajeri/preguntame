import { API } from "../Server";

// Create a notification
export const createNotification = async (data: any) => {
  const response = await API.post("/notifications", data);
  return response.data;
};

// Get notifications for a user
export const getUserNotifications = async (userId: string) => {
  const response = await API.get(`/notifications/${userId}`);
  return response.data;
};

// Send notifications
export const sendNotification = async (payload: any) => {
  const res = await API.post("/notifications", payload);
  return res.data;
};

// Mark a notification as read
export const markNotificationRead = async (id: string) => {
  const response = await API.put(`/notifications/read/${id}`);
  return response.data;
};

// Mark all notifications as read for a user
export const markAllNotificationsRead = async (userId: string) => {
  const response = await API.put(`/notifications/read-all/${userId}`);
  return response.data;
};

// Delete a notification
export const deleteNotification = async (id: string) => {
  const response = await API.delete(`/notifications/${id}`);
  return response.data;
};

// Clear all notifications for a user
export const clearAllNotifications = async (userId: string) => {
  const response = await API.delete(`/notifications/clear/${userId}`);
  return response.data;
};
