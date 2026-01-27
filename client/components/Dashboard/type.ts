export interface UserData {
  _id: string;
  name: string;
  lastname: string;
  avatar: string;
  email: string;
  points: number;
  credits: number;
  gamesCreated: number;
  gamesPlayed: number;
  correctAnswers: number;
  wrongAnswers: number;
  rank: number;
  topCategory: string;
  createdAt: string;
  updatedAt: string;
  gameGotCloned?: number;
  emailNotifications?: boolean;
}

export interface Notification {
  _id: string;
  userId: string;
  senderId: string;
  type: "achievement" | "game" | "social" | "system";
  title: string;
  message: string;
  data?: {
    gameCode?: string;
    gameTitle?: string;
    [key: string]: any;
  };
  read: boolean;
  createdAt: string;
  __v?: number;
}

export interface Game {
  _id: string;
  title: string;
  gameCode: string;
  isAi: boolean;
  hasPlayed: boolean;
  hostId: string;
  questions: Array<{
    text: string;
    answers: Array<{
      text: string;
      correct: boolean;
      _id: string;
    }>;
    order: number;
    time: number;
    _id: string;
  }>;
  createdAt: string;
  __v: number;
}

export type FilterType =
  | "all"
  | "recent"
  | "oldest"
  | "manyQuestions"
  | "fewQuestions"
  | "aiGenerated";
export type SortType = "title" | "date" | "questions" | "code";
export type TabType = "games" | "notifications" | "subscription" | "settings";
