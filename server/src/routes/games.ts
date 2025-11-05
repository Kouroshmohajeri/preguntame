import { Router } from "express";
import Game from "../models/Game.js";

const router = Router();

// Create a new game
router.post("/", async (req, res) => {
  try {
    const game = new Game(req.body);
    await game.save();
    res.status(201).json(game);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get all games
router.get("/", async (_, res) => {
  try {
    const games = await Game.find().populate("quiz");
    res.json(games);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
