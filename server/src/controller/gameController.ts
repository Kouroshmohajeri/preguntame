import { Request, Response } from "express";
import { GameRepository } from "../Repo/gameRepo.js";
import QRCode from "qrcode";

export const GameController = {
  async createGame(req: Request, res: Response) {
    try {
      const { title, questions } = req.body;

      // Must be an array of objects { text, answers }
      if (
        !title ||
        !questions ||
        !Array.isArray(questions) ||
        questions.some(
          (q: any) =>
            typeof q !== "object" ||
            typeof q.text !== "string" ||
            !Array.isArray(q.answers)
        )
      ) {
        return res.status(400).json({ error: "Invalid payload" });
      }

      // ✅ Use the questions exactly as sent
      const game = await GameRepository.createGame(title, questions);

      // Generate QR Code
      const gameUrl = `${process.env.CLIENT_URL}/play/${game.gameCode}`;
      const qrCode = await QRCode.toDataURL(gameUrl);

      return res.status(201).json({ game, qrCode, url: gameUrl });
    } catch (error) {
      console.error("❌ createGame error:", error);
      return res.status(500).json({ error: "Failed to create game" });
    }
  },

  async getGame(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const game = await GameRepository.getGameByCode(code);
      if (!game) return res.status(404).json({ error: "Game not found" });
      return res.status(200).json(game);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch game" });
    }
  },

  async listGames(req: Request, res: Response) {
    try {
      const games = await GameRepository.getAllGames();
      return res.status(200).json(games);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to load games" });
    }
  },

  async deleteGame(req: Request, res: Response) {
    try {
      const { code } = req.params;
      await GameRepository.deleteGame(code);
      return res.status(200).json({ message: "Game deleted" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to delete game" });
    }
  },
  async checkGameCode(req: Request, res: Response) {
  try {
    const { code } = req.params;
    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Invalid game code" });
    }

    const exists = !!(await GameRepository.getGameByCode(code.toUpperCase()));
    return res.status(200).json({ exists });
  } catch (error) {
    console.error("❌ checkGameCode error:", error);
    return res.status(500).json({ error: "Failed to check game code" });
  }
},

};

