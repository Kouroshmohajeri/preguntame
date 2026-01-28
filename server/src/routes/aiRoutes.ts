import express from "express";
import multer from "multer";
import {
  generateFromPrompt,
  generateFromFile,
  generateFromUrl,
} from "../controller/aiQuestionController.js";
import { aiGenerationLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Apply rate limiting to all AI routes
router.post("/generate/prompt", aiGenerationLimiter, generateFromPrompt);
router.post(
  "/generate/file",
  aiGenerationLimiter,
  upload.single("file"),
  generateFromFile
);
router.post("/generate/url", aiGenerationLimiter, generateFromUrl);

export default router;
