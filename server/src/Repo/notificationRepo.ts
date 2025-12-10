import Notification from "../models/Notification.js";

export const NotificationRepo = {
  async create(payload: any, io?: any) {
    const newNotification = await Notification.create(payload);

    // Emit real-time update if io is provided
    if (io && payload.userId) {
      io.to(`notifications:${payload.userId}`).emit(
        "notificationUpdated",
        newNotification
      );
    }

    return newNotification;
  },

  async getByUser(userId: string) {
    return await Notification.find({ userId }).sort({ createdAt: -1 });
  },

  async markAsRead(id: string) {
    return await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );
  },

  async markAllAsRead(userId: string) {
    return await Notification.updateMany({ userId }, { read: true });
  },

  async delete(id: string) {
    return await Notification.findByIdAndDelete(id);
  },

  async clearAll(userId: string) {
    return await Notification.deleteMany({ userId });
  },
};
