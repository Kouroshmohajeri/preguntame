import express from "express";
import User from "../models/User.js";
import Game from "../models/Game.js";
import GameResult from "../models/GameResult.js";

const router = express.Router();

// Simple API key middleware
const adminAuth = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const apiKey = req.headers.authorization?.replace("Bearer ", "");

  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};

router.get("/stats", adminAuth, async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments();

    // Total games created
    const totalGames = await Game.countDocuments();

    // Total game results
    const totalGameResults = await GameResult.countDocuments();

    // Users created this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const usersThisWeek = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo },
    });

    // Users created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const usersToday = await User.countDocuments({
      createdAt: { $gte: today },
    });

    res.json({
      totalUsers,
      totalGames,
      totalGameResults,
      usersThisWeek,
      usersToday,
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
