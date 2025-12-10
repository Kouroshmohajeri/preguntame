import express from "express";
import { NotificationController } from "../controller/notificationController.js";

const router = express.Router();

router.post("/", NotificationController.create);
router.get("/:userId", NotificationController.getUserNotifications);
router.put("/read/:id", NotificationController.markRead);
router.put("/read-all/:userId", NotificationController.markAll);
router.delete("/:id", NotificationController.delete);
router.delete("/clear/:userId", NotificationController.clearAll);

export default router;
