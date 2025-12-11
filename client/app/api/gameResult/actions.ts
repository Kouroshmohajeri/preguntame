import { API } from "../Server";

export interface PlayerAnswer {
  questionIndex: number;
  answerId: string;
  isCorrect: boolean;
  points: number;
  timeLeft: number;
}

export interface PlayerResult {
  isAssigned: any;
  uuid: any;
  playerId: string; // socket uuid
  name: string;
  avatar?: string;
  score: number;
  correct: number;
  wrong: number;
  responseTime?: number;
  answers: PlayerAnswer[];
}

export interface GameResult {
  _id?: string;
  gameCode: string;
  hostId: string;
  players: PlayerResult[];
  createdAt?: string;
}

// Create/save a game result
export const createGameResult = async (
  gameCode: string,
  hostId: string,
  players: PlayerResult[]
) => {
  const response = await API.post("/gameResults", {
    gameCode,
    hostId,
    players,
  });
  return response.data;
};

// Get a game result by game code
export const getGameResult = async (gameCode: string) => {
  const response = await API.get(`/gameResults/${gameCode}`);
  return response.data as GameResult;
};
export const assignPlayer = async (gameCode: string, uuid: string) => {
  const res = await API.post(`/gameResults/assign`, { gameCode, uuid });
  return res.data;
};

// Check if a gameCode exists (returns only 200 or 404)
export const checkGameCode = async (gameCode: string) => {
  try {
    const res = await API.get(`/gameResults/check/${gameCode}`);
    return res.status === 200; // true = exists
  } catch (err: any) {
    if (err.response?.status === 404) return false; // does not exist
    throw err; // other errors should bubble up
  }
};

// Deleting game result
export const deleteGameResult = async (gameCode: string) => {
  const response = await API.delete(`/gameResults/${gameCode}`);
  return response.data;
};
