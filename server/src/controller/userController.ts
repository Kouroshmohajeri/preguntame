import { Request, Response } from "express";
import { UserRepository } from "../Repo/userRepo.js";

export const UserController = {
  // Register or login via Google (if user exists → return; if not → create)
  async googleAuth(req: Request, res: Response) {
    try {
      const { name, lastname, email, phoneNumber } = req.body;

      if (!email || !name) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      let user = await UserRepository.findByEmail(email);

      if (!user) {
        user = await UserRepository.createUser({
          name,
          lastname,
          email,
          phoneNumber,
          points: 0,
          credits: 0,
          gamesCreated: 0,
          gamesPlayed: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          rank: 0,
          topCategory: "",
        });
      }

      return res.status(200).json({ success: true, user });
    } catch (error) {
      console.error("❌ googleAuth error:", error);
      return res.status(500).json({ error: "Server error" });
    }
  },

  async getUser(req: Request, res: Response) {
    try {
      const { email } = req.params;
      const user = await UserRepository.findByEmail(email);
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch user" });
    }
  },

  async listUsers(req: Request, res: Response) {
    try {
      const users = await UserRepository.getAllUsers();
      return res.status(200).json(users);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to load users" });
    }
  },

  async deleteUser(req: Request, res: Response) {
    try {
      const { email } = req.params;
      await UserRepository.deleteUserByEmail(email);
      return res.status(200).json({ message: "User deleted" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to delete user" });
    }
  },
};
