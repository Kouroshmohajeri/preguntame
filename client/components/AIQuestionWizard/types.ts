export interface Answer {
  text: string;
  correct: boolean;
}

export interface Question {
  text: string;
  answers: Answer[];
  order: number;
  time: number;
}

export interface AIGeneratedQuestion {
  question: string;
  type: "multiple-choice" | "true-false";
  options: string[];
  correctAnswer: number;
  explanation?: string;
  timeLimit: number;
}

export type InputMethod = "prompt" | "file" | "url" | "youtube";
export type Difficulty = "easy" | "medium" | "hard";
export type WizardStep = 1 | 2 | 3 | 4;
