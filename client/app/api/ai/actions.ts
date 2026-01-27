// actions/aiActions.ts
import { API } from "../Server";
import { AIGeneratedQuestion } from "@/components/AIQuestionWizard/types";

// ========================================
// TYPE DEFINITIONS
// ========================================

export interface GenerateFromPromptParams {
  prompt: string;
  numberOfQuestions?: number;
  difficulty?: "easy" | "medium" | "hard";
  questionTypes?: string[];
  language?: string;
}

export interface GenerateFromUrlParams {
  url: string;
  numberOfQuestions?: number;
  difficulty?: "easy" | "medium" | "hard";
  questionTypes?: string[];
  language?: string;
}

export interface GenerateFromFileParams {
  file: File;
  numberOfQuestions?: number;
  difficulty?: "easy" | "medium" | "hard";
  questionTypes?: string[];
  language?: string;
}

export interface AIGenerationResponse {
  success?: boolean;
  questions: AIGeneratedQuestion[];
  error?: string;
}

// ========================================
// AI GENERATION ACTIONS
// ========================================

/**
 * Generate questions from a text prompt
 */
export const generateQuestionsFromPrompt = async (
  params: GenerateFromPromptParams
): Promise<AIGenerationResponse> => {
  try {
    const {
      prompt,
      numberOfQuestions = 5,
      difficulty = "medium",
      questionTypes = ["multiple-choice"],
      language = "en",
    } = params;

    const response = await API.post("/ai/generate/prompt", {
      prompt,
      numberOfQuestions,
      difficulty,
      questionTypes,
      language,
    });

    return response.data;
  } catch (error: any) {
    console.error("Generate from prompt error:", error);
    throw new Error(
      error.response?.data?.error || error.message || "Failed to generate questions from prompt"
    );
  }
};

/**
 * Generate questions from a URL (website or YouTube)
 */
export const generateQuestionsFromUrl = async (
  params: GenerateFromUrlParams
): Promise<AIGenerationResponse> => {
  try {
    const {
      url,
      numberOfQuestions = 5,
      difficulty = "medium",
      questionTypes = ["multiple-choice"],
      language = "en",
    } = params;

    const response = await API.post("/ai/generate/url", {
      url,
      numberOfQuestions,
      difficulty,
      questionTypes,
      language,
    });

    return response.data;
  } catch (error: any) {
    console.error("Generate from URL error:", error);
    throw new Error(
      error.response?.data?.error || error.message || "Failed to generate questions from URL"
    );
  }
};

/**
 * Generate questions from a file (PDF, DOCX, TXT)
 */
export const generateQuestionsFromFile = async (
  params: GenerateFromFileParams
): Promise<AIGenerationResponse> => {
  try {
    const {
      file,
      numberOfQuestions = 5,
      difficulty = "medium",
      questionTypes = ["multiple-choice"],
      language = "en",
    } = params;

    // Create FormData for file upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("numberOfQuestions", numberOfQuestions.toString());
    formData.append("difficulty", difficulty);
    formData.append("questionTypes", JSON.stringify(questionTypes));
    formData.append("language", language);

    const response = await API.post("/ai/generate/file", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Generate from file error:", error);
    throw new Error(
      error.response?.data?.error || error.message || "Failed to generate questions from file"
    );
  }
};

/**
 * Universal question generator - automatically routes based on input method
 */
export const generateQuestions = async (
  inputMethod: "prompt" | "url" | "youtube" | "file",
  params: {
    prompt?: string;
    url?: string;
    file?: File;
    numberOfQuestions?: number;
    difficulty?: "easy" | "medium" | "hard";
    questionTypes?: string[];
    language?: string;
  }
): Promise<AIGenerationResponse> => {
  const {
    prompt,
    url,
    file,
    numberOfQuestions = 5,
    difficulty = "medium",
    questionTypes = ["multiple-choice"],
    language = "en",
  } = params;

  switch (inputMethod) {
    case "prompt":
      if (!prompt) {
        throw new Error("Prompt is required for text input");
      }
      return generateQuestionsFromPrompt({
        prompt,
        numberOfQuestions,
        difficulty,
        questionTypes,
        language,
      });

    case "url":
    case "youtube":
      if (!url) {
        throw new Error("URL is required for URL/YouTube input");
      }
      return generateQuestionsFromUrl({
        url,
        numberOfQuestions,
        difficulty,
        questionTypes,
        language,
      });

    case "file":
      if (!file) {
        throw new Error("File is required for file input");
      }
      return generateQuestionsFromFile({
        file,
        numberOfQuestions,
        difficulty,
        questionTypes,
        language,
      });

    default:
      throw new Error(`Invalid input method: ${inputMethod}`);
  }
};

/**
 * Validate file before upload
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/msword", // .doc
    "text/plain", // .txt
  ];
  const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc", ".txt"];

  // Check file size
  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: "File size must be less than 10MB",
    };
  }

  // Check file type
  const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));

  if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
    return {
      valid: false,
      error: "Only PDF, DOCX, DOC, and TXT files are allowed",
    };
  }

  if (!ALLOWED_TYPES.includes(file.type) && file.type !== "") {
    return {
      valid: false,
      error: "Invalid file type. Please upload PDF, DOCX, or TXT files",
    };
  }

  return { valid: true };
};

/**
 * Validate URL format
 */
export const validateUrl = (url: string): { valid: boolean; error?: string } => {
  try {
    const urlObj = new URL(url);

    // Check if it's HTTP or HTTPS
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return {
        valid: false,
        error: "URL must use HTTP or HTTPS protocol",
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: "Invalid URL format",
    };
  }
};

/**
 * Validate YouTube URL
 */
export const validateYouTubeUrl = (
  url: string
): { valid: boolean; error?: string; videoId?: string } => {
  const urlValidation = validateUrl(url);
  if (!urlValidation.valid) {
    return urlValidation;
  }

  // YouTube URL patterns
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return {
        valid: true,
        videoId: match[1],
      };
    }
  }

  return {
    valid: false,
    error: "Invalid YouTube URL format",
  };
};

/**
 * Validate prompt length
 */
export const validatePrompt = (prompt: string): { valid: boolean; error?: string } => {
  const MIN_LENGTH = 10;
  const MAX_LENGTH = 5000;

  if (!prompt || prompt.trim().length === 0) {
    return {
      valid: false,
      error: "Prompt cannot be empty",
    };
  }

  if (prompt.trim().length < MIN_LENGTH) {
    return {
      valid: false,
      error: `Prompt must be at least ${MIN_LENGTH} characters long`,
    };
  }

  if (prompt.trim().length > MAX_LENGTH) {
    return {
      valid: false,
      error: `Prompt must be less than ${MAX_LENGTH} characters`,
    };
  }

  return { valid: true };
};

/**
 * Get file type icon/description
 */
export const getFileTypeInfo = (
  file: File
): {
  icon: string;
  type: string;
  color: string;
} => {
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));

  switch (extension) {
    case ".pdf":
      return { icon: "📄", type: "PDF Document", color: "#ff6b6b" };
    case ".docx":
    case ".doc":
      return { icon: "📝", type: "Word Document", color: "#4ecdc4" };
    case ".txt":
      return { icon: "📋", type: "Text File", color: "#95a5a6" };
    default:
      return { icon: "📁", type: "File", color: "#7f8c8d" };
  }
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

/**
 * Detect input method from URL
 */
export const detectInputMethodFromUrl = (url: string): "url" | "youtube" => {
  const youtubeValidation = validateYouTubeUrl(url);
  return youtubeValidation.valid ? "youtube" : "url";
};

/**
 * Get estimated generation time based on parameters
 */
export const getEstimatedGenerationTime = (
  numberOfQuestions: number,
  inputMethod: "prompt" | "url" | "youtube" | "file"
): string => {
  // Base time in seconds
  let baseTime = 10;

  // Add time per question
  baseTime += numberOfQuestions * 3;

  // Add time based on input method
  switch (inputMethod) {
    case "file":
      baseTime += 15; // Extra time for file processing
      break;
    case "url":
      baseTime += 10; // Extra time for web scraping
      break;
    case "youtube":
      baseTime += 20; // Extra time for YouTube transcript extraction
      break;
    case "prompt":
      baseTime += 5;
      break;
  }

  return `${baseTime}-${baseTime + 10} seconds`;
};

/**
 * Retry failed generation with exponential backoff
 */
export const retryGeneration = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1} after ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
};
