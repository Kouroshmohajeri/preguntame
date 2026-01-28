import { useState } from "react";
import { InputMethod, Difficulty, WizardStep, AIGeneratedQuestion } from "../types";

export const useWizardState = () => {
  const [step, setStep] = useState<WizardStep>(1);
  const [inputMethod, setInputMethod] = useState<InputMethod>("prompt");
  const [error, setError] = useState("");

  // Form data
  const [gameTitle, setGameTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [questionTypes, setQuestionTypes] = useState<string[]>(["multiple-choice"]);
  const [language, setLanguage] = useState<string>("en");

  // Generated questions
  const [generatedQuestions, setGeneratedQuestions] = useState<AIGeneratedQuestion[]>([]);

  // Bulk selection
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  const [bulkTime, setBulkTime] = useState<number>(20);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Drag and drop
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleNext = () => {
    if (step === 1 && !gameTitle.trim()) {
      setError("Please enter a game title");
      return;
    }
    if (step === 2 && !inputMethod) {
      setError("Please select an input method");
      return;
    }
    setError("");
    setStep((prev) => Math.min(4, prev + 1) as WizardStep);
  };

  const handleBack = () => {
    setError("");
    setStep((prev) => Math.max(1, prev - 1) as WizardStep);
  };

  return {
    // State
    step,
    inputMethod,
    error,
    gameTitle,
    prompt,
    url,
    file,
    numberOfQuestions,
    difficulty,
    questionTypes,
    language,
    generatedQuestions,
    selectedQuestions,
    bulkTime,
    showBulkActions,
    draggedIndex,

    // Setters
    setStep,
    setInputMethod,
    setError,
    setGameTitle,
    setPrompt,
    setUrl,
    setFile,
    setNumberOfQuestions,
    setDifficulty,
    setQuestionTypes,
    setLanguage,
    setGeneratedQuestions,
    setSelectedQuestions,
    setBulkTime,
    setShowBulkActions,
    setDraggedIndex,

    // Actions
    handleNext,
    handleBack,
  };
};
