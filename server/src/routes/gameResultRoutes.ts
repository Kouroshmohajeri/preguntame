import { Router } from "express";
import {
  assignPlayerStats,
  createGameResult,
  deleteGameResult,
  getGameResult,
} from "../controller/gameResultController.js";

const router = Router();

router.post("/", createGameResult);
router.get("/:gameCode", getGameResult);
router.post("/assign", assignPlayerStats);
router.delete("/:gameCode", deleteGameResult);

export default router;
