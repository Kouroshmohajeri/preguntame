import { API } from "../Server";

interface PlayerAnswer {
  questionIndex: number;
  answerId: string;
  isCorrect: boolean;
  points: number;
  timeLeft: number;
}

export interface LeaderboardPlayer {
  id: string; // player UUID
  name: string;
  avatar?: string;
  answers: PlayerAnswer[];
  score: number;
  correct: number;
  wrong: number;
  responseTime: number;
}

// Create a new leaderboard
export const createLeaderboard = async (hostId: string, gameCode: string) => {
  const response = await API.post("/leaderboard", { hostId, gameCode });
  return response.data;
};

// Get leaderboard by game code
export const getLeaderboard = async (gameCode: string) => {
  const response = await API.get(`/games/leaderboard/${gameCode}`);
  return response.data;
};

// Add or update a player in leaderboard
export const addOrUpdatePlayer = async (gameCode: string, player: LeaderboardPlayer) => {
  const response = await API.put("/leaderboard/player", { gameCode, player });
  return response.data;
};
