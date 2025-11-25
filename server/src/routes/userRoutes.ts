import express from "express";
import { UserController } from "../controller/userController.js";

const router = express.Router();

router.post("/google", UserController.googleAuth); // Register/login with Google
router.get("/", UserController.listUsers);
router.post("/update-stats", UserController.updateStats);
router.get("/:email", UserController.getUser);
router.delete("/:email", UserController.deleteUser);

export default router;
