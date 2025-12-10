import { Request, Response } from "express";
import { UserRepository } from "../Repo/userRepo.js";
import User from "../models/User.js";

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
  async searchUsers(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      const exclude = req.query.exclude as string; // <--- accepted from client

      if (!query) return res.status(400).json([]);

      const users = await UserRepository.searchUsersForAutocomplete(
        query,
        exclude
      );

      return res.status(200).json(users);
    } catch (err) {
      console.error(err);
      return res.status(500).json([]);
    }
  },
  // Add this to your userController.ts
  async incrementGameGotCloned(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { increment = 1 } = req.body; // Default to increment by 1

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      // Find the user by ID and increment gameGotCloned
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $inc: { gameGotCloned: increment },
          $set: { updatedAt: new Date() },
        },
        { new: true } // Return the updated document
      );

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({
        success: true,
        message: `Game cloned count incremented for ${updatedUser.name}`,
        user: updatedUser,
      });
    } catch (error) {
      console.error("❌ incrementGameGotCloned error:", error);
      return res.status(500).json({ error: "Server error" });
    }
  },
  async decrementGamesCreated(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const updatedUser = await UserRepository.decrementGamesCreated(userId);

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({
        success: true,
        message: `gamesCreated decremented for user ${updatedUser.name}`,
        user: updatedUser,
      });
    } catch (error) {
      console.error("❌ decrementGamesCreated error:", error);
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
  // userController.ts
  async updateStats(req: Request, res: Response) {
    try {
      const { email, score, correct, wrong } = req.body;

      if (!email) return res.status(400).json({ error: "Email missing" });

      const updatedUser = await User.findOneAndUpdate(
        { email },
        {
          $inc: {
            gamesPlayed: 1,
            points: score,
            correctAnswers: correct,
            wrongAnswers: wrong,
          },
        },
        { new: true }
      );

      if (!updatedUser)
        return res.status(404).json({ error: "User not found" });

      return res.status(200).json(updatedUser);
    } catch (err) {
      console.error("❌ updateStats error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  },
};
