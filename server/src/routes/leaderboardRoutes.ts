import { Router } from "express";
import {
  addOrUpdatePlayer,
  createLeaderboard,
  getLeaderboard,
} from "../controller/leaderboardController.js";

const router = Router();

router.get("/:gameCode", getLeaderboard);
router.post("/", createLeaderboard);
router.put("/player", addOrUpdatePlayer);

export default router;
