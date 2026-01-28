import express from "express";
import { redis } from "../config/redis.js";

const router = express.Router();

// Clear a specific room
router.delete("/room/:gameCode", async (req, res) => {
  try {
    const { gameCode } = req.params;
    const roomKey = `room:${gameCode}`;

    const deleted = await redis.del(roomKey);

    res.json({
      success: true,
      gameCode,
      cleared: deleted > 0,
      message:
        deleted > 0
          ? `Room ${gameCode} cleared`
          : `Room ${gameCode} didn't exist`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get room info (for debugging)
router.get("/room/:gameCode", async (req, res) => {
  try {
    const { gameCode } = req.params;
    const roomKey = `room:${gameCode}`;

    const data = await redis.get(roomKey);

    if (data) {
      const room = JSON.parse(data);
      res.json({
        success: true,
        gameCode,
        playerCount: Object.keys(room.players || {}).length,
        viewerCount: (room.viewers || []).length,
        gameStarted: room.gameStarted || false,
        room,
      });
    } else {
      res.status(404).json({
        success: false,
        message: `Room ${gameCode} not found`,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
