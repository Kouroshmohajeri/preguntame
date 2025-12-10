import { Server, Socket } from "socket.io";
import { NotificationRepo } from "../Repo/notificationRepo.js";

export function registerNotificationSocket(io: Server, socket: Socket) {
  socket.on("joinNotifications", async ({ userId }) => {
    socket.join(`notifications:${userId}`);

    const notifications = await NotificationRepo.getByUser(userId);
    socket.emit("notificationsUpdate", notifications);
  });

  socket.on("markNotificationRead", async ({ id, userId }) => {
    const updated = await NotificationRepo.markAsRead(id);
    io.to(`notifications:${userId}`).emit("notificationUpdated", updated);
  });

  socket.on("markAllNotificationsRead", async ({ userId }) => {
    await NotificationRepo.markAllAsRead(userId);
    const list = await NotificationRepo.getByUser(userId);
    io.to(`notifications:${userId}`).emit("notificationsUpdate", list);
  });

  socket.on("deleteNotification", async ({ id, userId }) => {
    await NotificationRepo.delete(id);
    const list = await NotificationRepo.getByUser(userId);
    io.to(`notifications:${userId}`).emit("notificationsUpdate", list);
  });

  socket.on("clearAllNotifications", async ({ userId }) => {
    await NotificationRepo.clearAll(userId);
    io.to(`notifications:${userId}`).emit("notificationsUpdate", []);
  });
}
