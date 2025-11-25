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
  const response = await API.get(`/users/${email}`);
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
