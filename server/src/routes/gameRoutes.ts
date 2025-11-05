import express from "express";
import { GameController } from "../controller/gameController.js";


const router = express.Router();

router.post("/", GameController.createGame);
router.get("/", GameController.listGames);
router.get("/:code", GameController.getGame);
router.delete("/:code", GameController.deleteGame);
router.get("/check/:code", GameController.checkGameCode);


export default router;
