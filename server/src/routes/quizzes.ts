import { Router } from "express";
import Quiz from "../models/Quiz.js";

const router = Router();

// Create a new quiz
router.post("/", async (req, res) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.status(201).json(quiz);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get all quizzes
router.get("/", async (_, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json(quizzes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
