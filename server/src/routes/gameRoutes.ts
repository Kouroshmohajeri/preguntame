import express from "express";
import { GameController } from "../controller/gameController.js";
import { redis } from "../config/redis.js";

const router = express.Router();

router.post("/", GameController.createGame);
router.get("/", GameController.listGames);
router.get("/check/:code", GameController.checkGameCode);
router.get("/host/:hostId", GameController.getGamesByHost);
router.put("/:code", GameController.updateGame);
router.get("/hostid/:gameCode", GameController.getHostIdentifier);
router.post("/clone/:code", GameController.cloneGame);
router.get("/room/:code", async (req, res) => {
  const { code } = req.params;

  try {
    const data = await redis.get(`room:${code}`);
    if (!data) return res.status(404).json({ players: {} });
    const room = JSON.parse(data);
    res.json(room);
  } catch (err) {
    console.error("Redis error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/leaderboard/:code", async (req, res) => {
  const { code } = req.params;

  try {
    const data = await redis.get(`leaderboard:${code}`);
    if (!data) return res.status(404).json({ error: "Leaderboard not found" });
    const leaderboard = JSON.parse(data);
    res.json(leaderboard);
  } catch (err) {
    console.error("Redis error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:code", GameController.getGame);
router.delete("/:code", GameController.deleteGame);

export default router;
