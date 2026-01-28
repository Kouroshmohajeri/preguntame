import { useState } from "react";
import { AIGeneratedQuestion, InputMethod, Difficulty } from "../types";
import { generateQuestions } from "@/app/api/ai/actions";

export const useQuestionGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateQuestionsFromWizard = async (
    inputMethod: InputMethod,
    prompt: string,
    url: string,
    file: File | null,
    numberOfQuestions: number,
    difficulty: Difficulty,
    questionTypes: string[],
    language: string
  ): Promise<AIGeneratedQuestion[]> => {
    setLoading(true);
    setError("");

    try {
      // Use the centralized generateQuestions from aiActions
      const result = await generateQuestions(inputMethod, {
        prompt: inputMethod === "prompt" ? prompt : undefined,
        url: inputMethod === "url" || inputMethod === "youtube" ? url : undefined,
        file: inputMethod === "file" ? file! : undefined,
        numberOfQuestions,
        difficulty,
        questionTypes,
        language,
      });

      setLoading(false);
      return result.questions;
    } catch (err: any) {
      setError(err.message || "Failed to generate questions");
      setLoading(false);
      throw err;
    }
  };

  return {
    loading,
    error,
    generateQuestions: generateQuestionsFromWizard,
  };
};
