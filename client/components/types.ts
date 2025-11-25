// types.ts
export type Question = {
  id: string;
  text: string;
  time: number;
  answers: Answer[];
};

export type Answer = {
  id: string;
  text: string;
  correct: boolean;
};
