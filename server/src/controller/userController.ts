// src/controller/userController.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserRepository } from "../Repo/userRepo.js";
import User from "../models/User.js";
import { enhancedEmailService } from "../services/enhancedEmailService.js";

export const UserController = {
  // Register or login via Google (if user exists → return; if not → create)
  async googleAuth(req: Request, res: Response) {
    try {
      const { name, lastname, email, phoneNumber } = req.body;

      if (!email || !name) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      let user = await UserRepository.findByEmail(email);
      let isNewUser = false;

      if (!user) {
        // ✅ NEW USER - Create account
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
        isNewUser = true;
        console.log("✅ New user created:", user._id);

        // 🎉 Send welcome email for new users
        try {
          await enhancedEmailService.sendWelcomeEmail(email, name);
          console.log(`📧 Welcome email sent to ${email}`);
        } catch (emailError) {
          console.error("⚠️ Failed to send welcome email:", emailError);
          // Don't block registration if email fails
        }
      } else {
        // ✅ EXISTING USER - Login
        console.log("✅ Existing user logged in:", user._id);

        // 👋 Send login notification
        try {
          const ip = req.ip || req.headers["x-forwarded-for"] || "Unknown";
          const userAgent = req.headers["user-agent"] || "Unknown device";

          await enhancedEmailService.sendLoginNotification(
            email,
            ip as string,
            userAgent,
          );
          console.log(`📧 Login notification sent to ${email}`);
        } catch (emailError) {
          console.error("⚠️ Failed to send login notification:", emailError);
          // Don't block login if email fails
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "30d" },
      );

      return res.status(200).json({
        success: true,
        user,
        token,
        isNewUser, // ✅ Frontend can show different UI for new users
      });
    } catch (error) {
      console.error("❌ googleAuth error:", error);
      return res.status(500).json({ error: "Server error" });
    }
  },

  // Rest of your controller methods stay the same...
  async searchUsers(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      const exclude = req.query.exclude as string;

      if (!query) return res.status(400).json([]);

      const users = await UserRepository.searchUsersForAutocomplete(
        query,
        exclude,
      );

      return res.status(200).json(users);
    } catch (err) {
      console.error(err);
      return res.status(500).json([]);
    }
  },

  async incrementGameGotCloned(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { increment = 1 } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $inc: { gameGotCloned: increment },
          $set: { updatedAt: new Date() },
        },
        { new: true },
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
        { new: true },
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
