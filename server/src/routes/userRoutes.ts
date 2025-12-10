import express from "express";
import { UserController } from "../controller/userController.js";

const router = express.Router();

router.post("/google", UserController.googleAuth);
router.get("/", UserController.listUsers);
router.post("/update-stats", UserController.updateStats);
router.get("/search", UserController.searchUsers);
router.get("/credentials/:email", UserController.getUser);
router.delete("/:email", UserController.deleteUser);
router.put(
  "/:userId/increment-game-cloned",
  UserController.incrementGameGotCloned
);
router.put(
  "/:userId/decrement-games-created",
  UserController.decrementGamesCreated
);

export default router;
