import { Request, Response } from "express";
import { NotificationRepo } from "../Repo/notificationRepo.js";

export const NotificationController = {
  async create(req: Request, res: Response) {
    try {
      const notification = await NotificationRepo.create(req.body);
      return res.json(notification);
    } catch (err) {
      console.error("Create notification error:", err);
      res.status(500).json({ error: "Failed to create notification" });
    }
  },

  async getUserNotifications(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const notifications = await NotificationRepo.getByUser(userId);
      res.json(notifications);
    } catch (err) {
      console.error("Get notifications error:", err);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  },

  async markRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await NotificationRepo.markAsRead(id);
      res.json(updated);
    } catch (err) {
      console.error("Mark read error:", err);
      res.status(500).json({ error: "Failed to mark as read" });
    }
  },

  async markAll(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      await NotificationRepo.markAllAsRead(userId);
      res.json({ success: true });
    } catch (err) {
      console.error("Mark all read error:", err);
      res.status(500).json({ error: "Failed to mark all as read" });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await NotificationRepo.delete(id);
      res.json({ success: true });
    } catch (err) {
      console.error("Delete notification error:", err);
      res.status(500).json({ error: "Failed to delete notification" });
    }
  },

  async clearAll(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      await NotificationRepo.clearAll(userId);
      res.json({ success: true });
    } catch (err) {
      console.error("Clear notifications error:", err);
      res.status(500).json({ error: "Failed to clear notifications" });
    }
  },
};
