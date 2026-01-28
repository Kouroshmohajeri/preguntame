import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Language name mapping for better prompts
const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish (Español)",
  fr: "French (Français)",
  fa: "Persian (فارسی)",
  de: "German (Deutsch)",
  it: "Italian (Italiano)",
  pt: "Portuguese (Português)",
  ja: "Japanese (日本語)",
  ko: "Korean (한국어)",
  zh: "Chinese (中文)",
  ar: "Arabic (العربية)",
  ru: "Russian (Русский)",
  hi: "Hindi (हिन्दी)",
  bn: "Bengali (বাংলা)",
  nl: "Dutch (Nederlands)",
  tr: "Turkish (Türkçe)",
  pl: "Polish (Polski)",
  uk: "Ukrainian (Українська)",
  vi: "Vietnamese (Tiếng Việt)",
  th: "Thai (ไทย)",
  sv: "Swedish (Svenska)",
  no: "Norwegian (Norsk)",
  da: "Danish (Dansk)",
  fi: "Finnish (Suomi)",
  cs: "Czech (Čeština)",
  sk: "Slovak (Slovenčina)",
  ro: "Romanian (Română)",
  hu: "Hungarian (Magyar)",
  el: "Greek (Ελληνικά)",
  he: "Hebrew (עברית)",
  id: "Indonesian (Bahasa Indonesia)",
  bg: "Bulgarian (Български)",
  hr: "Croatian (Hrvatski)",
  sr: "Serbian (Српски)",
  sl: "Slovenian (Slovenščina)",
  et: "Estonian (Eesti)",
  lv: "Latvian (Latviešu)",
  lt: "Lithuanian (Lietuvių)",
  sw: "Swahili (Kiswahili)",
};

export async function generateQuestions(
  content: string,
  numberOfQuestions: number,
  difficulty: string,
  questionTypes: string[],
  language: string = "en",
): Promise<any[]> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // ✅ Use Gemini 2.0 Flash (current free tier model as of 2026)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // ✅ Get language name for better context
    const languageName = LANGUAGE_NAMES[language] || language;

    const prompt = `You are an expert quiz creator. Generate ${numberOfQuestions} ${difficulty} level quiz questions based on the following content.

Question types to include: ${questionTypes.join(", ")}

Content:
${content}

IMPORTANT REQUIREMENTS:
- Generate ALL content (questions, options, explanations) in ${languageName}
- Create exactly ${numberOfQuestions} questions
- Difficulty level: ${difficulty}
- For multiple-choice questions: provide 4 options
- For true/false questions: provide 2 options (True, False)
- Mark the correct answer
- Include a brief explanation for each answer
- Time limit should be appropriate for difficulty (easy: 10s, medium: 20s, hard: 30s)

Return ONLY a valid JSON array with this exact structure:
[
  {
    "question": "Question text in ${languageName}",
    "type": "multiple-choice",
    "options": ["Option 1 in ${languageName}", "Option 2", "Option 3", "Option 4"],
    "correctAnswer": 0,
    "explanation": "Brief explanation in ${languageName}",
    "timeLimit": 20
  }
]

Make sure:
1. ALL text is in ${languageName}
2. The response is valid JSON that can be parsed directly
3. No code blocks or markdown formatting`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let jsonText = text.trim();

    // Clean up potential markdown formatting
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }

    const questions = JSON.parse(jsonText);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid response format from AI");
    }

    // ✅ Validate that we got the requested number of questions
    if (questions.length < numberOfQuestions) {
      console.warn(
        `Requested ${numberOfQuestions} questions but got ${questions.length}`,
      );
    }

    return questions;
  } catch (error: any) {
    console.error("Error generating questions:", error);

    // More detailed error message
    if (error.message?.includes("API key")) {
      throw new Error(
        "Invalid API key. Please check your GEMINI_API_KEY in .env file",
      );
    }
    if (error.status === 404) {
      throw new Error(
        "Model not found. Please try using a different model version.",
      );
    }
    if (error.name === "SyntaxError") {
      throw new Error(
        "Failed to parse AI response. The model may have returned invalid JSON.",
      );
    }

    throw new Error(
      error.message || "Failed to generate questions. Please try again.",
    );
  }
}
