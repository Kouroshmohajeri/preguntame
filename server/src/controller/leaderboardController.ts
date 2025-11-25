import { Request, Response } from "express";
import * as leaderboardRepo from "../Repo/leaderboardRepo.js";

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { gameCode } = req.params;
    const leaderboard = await leaderboardRepo.getLeaderboard(gameCode);

    if (!leaderboard)
      return res.status(404).json({ message: "Leaderboard not found" });

    res.json(leaderboard.players);
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createLeaderboard = async (req: Request, res: Response) => {
  try {
    const { hostId, gameCode } = req.body;
    const leaderboard = await leaderboardRepo.createLeaderboard(
      hostId,
      gameCode
    );
    res.status(201).json(leaderboard);
  } catch (err) {
    console.error("Error creating leaderboard:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addOrUpdatePlayer = async (req: Request, res: Response) => {
  try {
    const { gameCode, player } = req.body;
    const leaderboard = await leaderboardRepo.addOrUpdatePlayer(
      gameCode,
      player
    );

    if (!leaderboard)
      return res.status(404).json({ message: "Leaderboard not found" });

    res.json(leaderboard.players);
  } catch (err) {
    console.error("Error updating player:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
