import { API } from "../Server";

// Create a new game
export const createGame = async (title: string, questions: any[], hostId: string) => {
  const response = await API.post("/games", { title, questions, hostId });
  return response.data;
};

// Get a game by code
export const getGame = async (code: string) => {
  const response = await API.get(`/games/${code}`);
  return response.data;
};
// Get games by host ID
export const getGamesByHost = async (hostId: string) => {
  const response = await API.get(`/games/host/${hostId}`);
  return response.data;
};

// Clone a game
export const cloneGame = async (gameCode: string, hostId: string) => {
  const response = await API.post(`/games/clone/${gameCode}`, { hostId });
  return response.data;
};

// Update game
export const updateGame = async (
  gameCode: string,
  title: string,
  questions: any[],
  hostId: string
) => {
  const response = await API.put(`/games/${gameCode}`, {
    title,
    questions,
    hostId,
  });

  return response.data;
};

// List all games
export const listGames = async () => {
  const response = await API.get("/games");
  return response.data;
};

// Delete a game by code
export const deleteGame = async (code: string) => {
  const response = await API.delete(`/games/${code}`);
  return response.data;
};

// Check if a game code exists
export const checkGameCode = async (code: string) => {
  const response = await API.get(`/games/check/${code}`);
  return response.data; // { exists: true | false }
};
