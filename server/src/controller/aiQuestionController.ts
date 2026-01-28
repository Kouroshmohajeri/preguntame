import { Request, Response } from "express";
import { generateQuestions } from "../services/aiQuestionService.js";
import {
  extractFromYoutube,
  extractFromWebsite,
  extractFromPDF,
  extractFromWord,
  extractFromText,
} from "../services/contentExtractorService.js";

// Add this interface to extend Request with file property
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export async function generateFromPrompt(req: Request, res: Response) {
  try {
    const {
      prompt,
      numberOfQuestions = 5,
      difficulty = "medium",
      questionTypes = ["multiple-choice"],
      language = "en", // ✅ Default to English
    } = req.body;

    if (!prompt || prompt.trim().length < 10) {
      return res
        .status(400)
        .json({ error: "Prompt must be at least 10 characters long" });
    }

    // ✅ Pass all parameters including language
    const questions = await generateQuestions(
      prompt,
      numberOfQuestions,
      difficulty,
      questionTypes,
      language
    );

    res.json({ questions });
  } catch (error: any) {
    console.error("Generate from prompt error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to generate questions" });
  }
}

export async function generateFromFile(req: MulterRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const {
      numberOfQuestions = 5,
      difficulty = "medium",
      questionTypes = ["multiple-choice"],
      language = "en", // ✅ Default to English
    } = req.body;

    let content: string;
    const fileExtension = req.file.originalname.split(".").pop()?.toLowerCase();

    switch (fileExtension) {
      case "pdf":
        content = await extractFromPDF(req.file.buffer);
        break;
      case "docx":
      case "doc":
        content = await extractFromWord(req.file.buffer);
        break;
      case "txt":
        content = await extractFromText(req.file.buffer);
        break;
      default:
        return res.status(400).json({
          error:
            "Unsupported file type. Please upload PDF, DOCX, or TXT files.",
        });
    }

    if (content.length < 50) {
      return res.status(400).json({ error: "Insufficient content in file" });
    }

    // ✅ Parse questionTypes if it's a string, and add language
    const parsedQuestionTypes =
      typeof questionTypes === "string"
        ? JSON.parse(questionTypes)
        : questionTypes;

    const questions = await generateQuestions(
      content,
      parseInt(numberOfQuestions.toString()),
      difficulty,
      parsedQuestionTypes,
      language // ✅ Added language parameter
    );

    res.json({ questions });
  } catch (error: any) {
    console.error("Generate from file error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate questions from file",
    });
  }
}

export async function generateFromUrl(req: Request, res: Response) {
  try {
    const {
      url,
      numberOfQuestions = 5,
      difficulty = "medium",
      questionTypes = ["multiple-choice"],
      language = "en", // ✅ Default to English
    } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    let content: string;

    // Detect if it's a YouTube URL
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      content = await extractFromYoutube(url);
    } else {
      content = await extractFromWebsite(url);
    }

    if (content.length < 50) {
      return res
        .status(400)
        .json({ error: "Insufficient content extracted from URL" });
    }

    // ✅ Pass all parameters including language
    const questions = await generateQuestions(
      content,
      numberOfQuestions,
      difficulty,
      questionTypes,
      language
    );

    res.json({ questions });
  } catch (error: any) {
    console.error("Generate from URL error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate questions from URL",
    });
  }
}
