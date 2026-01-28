import { Request, Response } from "express";
import { NotificationRepo } from "../Repo/notificationRepo.js";
import User from "../models/User.js";

export const NotificationController = {
  async create(req: Request, res: Response) {
    try {
      const { userId, senderId, from, to, type } = req.body;

      // ✅ If sharing a game, validate from and to emails
      if (type === "game" || type === "social") {
        if (!from || !to) {
          return res.status(400).json({
            error:
              "Both 'from' and 'to' email addresses are required for game sharing notifications",
          });
        }

        // ✅ Optional: Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(from) || !emailRegex.test(to)) {
          return res.status(400).json({
            error: "Invalid email format for 'from' or 'to' field",
          });
        }

        // ✅ Optional: Verify users exist
        const [sender, receiver] = await Promise.all([
          User.findOne({ email: from }),
          User.findOne({ email: to }),
        ]);

        if (!sender) {
          return res.status(404).json({
            error: `Sender with email '${from}' not found`,
          });
        }

        if (!receiver) {
          return res.status(404).json({
            error: `Receiver with email '${to}' not found`,
          });
        }
      }

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
