export interface Player {
  currentQuestion: number;
  id: string;
  name: string;
  avatar: string;
  isReady: boolean;
  score: number;
  userId: string;
  isHost: boolean;
  uuid: string;
  answers?: {
    questionIndex: number;
    answerId: string;
    isCorrect: boolean;
    points: number;
    timeLeft?: number;
  }[];
}

export interface Room {
  currentQuestion: number;
  players: Record<string, Player>;
  viewers: string[];
  hostId: string;
  createdAt: string;
  gameStarted?: boolean;
}
