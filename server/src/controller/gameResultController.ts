import { Request, Response } from "express";
import {
  saveGameResult,
  getGameResultByCode,
  markPlayerAsAssigned,
  deleteGameResultByCode,
  checkGameCodeExists,
} from "../Repo/gameResultRepo.js";

export const createGameResult = async (req: Request, res: Response) => {
  try {
    const result = await saveGameResult(req.body);
    return res.status(201).json(result);
  } catch (err) {
    console.error("❌ Failed to save game result", err);
    return res.status(500).json({ error: "Failed to save game result" });
  }
};
export const deleteGameResult = async (req: Request, res: Response) => {
  try {
    const { gameCode } = req.params;

    if (!gameCode) {
      return res.status(400).json({ error: "gameCode is required" });
    }

    const deleted = await deleteGameResultByCode(gameCode);

    if (!deleted) {
      return res.status(404).json({ error: "GameResult not found" });
    }

    return res.json({ success: true, message: "GameResult deleted" });
  } catch (err) {
    console.error("Delete GameResult Error:", err);
    res.status(500).json({ error: "Failed to delete GameResult" });
  }
};
export const checkGameResult = async (req: Request, res: Response) => {
  try {
    const { gameCode } = req.params;

    if (!gameCode) {
      return res.sendStatus(400);
    }

    const exists = await checkGameCodeExists(gameCode);

    if (exists) {
      return res.sendStatus(200);
    } else {
      return res.sendStatus(404);
    }
  } catch (err) {
    console.error("❌ Failed to check game result", err);
    return res.sendStatus(500);
  }
};

export const assignPlayerStats = async (req: Request, res: Response) => {
  try {
    const { gameCode, uuid } = req.body;

    if (!gameCode || !uuid) {
      return res.status(400).json({ error: "gameCode or uuid missing" });
    }

    const updated = await markPlayerAsAssigned(gameCode, uuid);

    if (!updated) {
      return res.status(404).json({ error: "Game result or player not found" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ assignPlayerStats error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getGameResult = async (req: Request, res: Response) => {
  try {
    const gameCode = req.params.gameCode;
    const result = await getGameResultByCode(gameCode);

    if (!result) {
      return res.status(404).json({ error: "Game result not found" });
    }

    return res.json(result);
  } catch (err) {
    console.error("❌ Failed to fetch game result", err);
    return res.status(500).json({ error: "Failed to fetch game result" });
  }
};
