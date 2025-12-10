// /actions/userActions.ts
import { API } from "../Server";

// Register or login user with Google (backend handles both)
export const googleAuth = async (userData: {
  name: string;
  lastname?: string;
  phoneNumber?: string;
  email: string;
}) => {
  const response = await API.post("/users/google", userData);
  return response.data;
};

// Get user by email
export const getUser = async (email: string) => {
  const response = await API.get(`/users/credentials/${email}`);
  return response.data;
};

// Search users by query (autocomplete)
export const searchUsers = async (query: string, excludeEmail: string) => {
  const response = await API.get(
    `/users/search?q=${encodeURIComponent(query)}&exclude=${encodeURIComponent(excludeEmail)}`
  );
  return response.data;
};

// Increment host cloned game
export const incrementGameCloned = async (userId: string, increment: number = 1) => {
  console.log(userId);
  const response = await API.put(`/users/${userId}/increment-game-cloned`, {
    increment,
  });
  return response.data;
};

// Decrement gamesCreated
export const decrementGamesCreated = async (userId: string, decrement: number = 1) => {
  const response = await API.put(`/users/${userId}/decrement-games-created`, {
    decrement,
  });
  return response.data;
};

// List all users
export const listUsers = async () => {
  const response = await API.get("/users");
  return response.data;
};

// Delete a user
export const deleteUser = async (email: string) => {
  const response = await API.delete(`/users/${email}`);
  return response.data;
};
// Update user data
export const updateUserStats = async (payload: {
  email: string;
  score: number;
  correct: number;
  wrong: number;
}) => {
  const res = await API.post("/users/update-stats", payload);
  return res.data;
};
