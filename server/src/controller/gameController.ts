import { Request, Response } from "express";
import { GameRepository } from "../Repo/gameRepo.js";
import QRCode from "qrcode";
import { UserRepository } from "../Repo/userRepo.js";

export const GameController = {
  async createGame(req: Request, res: Response) {
    try {
      const { title, questions, hostId } = req.body;

      if (!hostId) {
        return res.status(400).json({ error: "hostId is required" });
      }

      // Validate ObjectId
      if (!hostId || !hostId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: "Invalid hostId" });
      }

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

      const game = await GameRepository.createGame(title, questions, hostId);
      await UserRepository.incrementGamesCreated(hostId);

      const gameUrl = `${process.env.CLIENT_URL}/play/${game.gameCode}`;
      const qrCode = await QRCode.toDataURL(gameUrl);

      return res.status(201).json({ game, qrCode, url: gameUrl });
    } catch (error) {
      console.error("❌ createGame error:", error);
      return res.status(500).json({ error: "Failed to create game" });
    }
  },
  async updateGame(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const { title, questions, hostId } = req.body;

      if (!hostId) {
        return res.status(400).json({ error: "hostId is required" });
      }

      // Validate ObjectId
      if (!hostId || !hostId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: "Invalid hostId" });
      }

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

      // Check if game exists and belongs to the host
      const existingGame = await GameRepository.getGameByCode(code);
      if (!existingGame) {
        return res.status(404).json({ error: "Game not found" });
      }

      if (existingGame.hostId.toString() !== hostId) {
        return res
          .status(403)
          .json({ error: "Not authorized to update this game" });
      }

      const updatedGame = await GameRepository.updateGame(
        code,
        title,
        questions,
        hostId
      );

      if (!updatedGame) {
        return res
          .status(404)
          .json({ error: "Game not found or update failed" });
      }

      const gameUrl = `${process.env.CLIENT_URL}/play/guest/${updatedGame.gameCode}`;
      const qrCode = await QRCode.toDataURL(gameUrl);

      return res.status(200).json({ game: updatedGame, qrCode, url: gameUrl });
    } catch (error) {
      console.error("❌ updateGame error:", error);
      return res.status(500).json({ error: "Failed to update game" });
    }
  },
  async getGamesByHost(req: Request, res: Response) {
    try {
      const { hostId } = req.params;

      if (!hostId || !hostId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: "Invalid hostId" });
      }

      const games = await GameRepository.getGamesByHost(hostId);
      return res.status(200).json(games);
    } catch (error) {
      console.error("❌ getGamesByHost error:", error);
      return res.status(500).json({ error: "Failed to fetch games" });
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
