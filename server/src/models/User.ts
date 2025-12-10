// Update your User model (User.ts)
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  lastname?: string;
  phoneNumber?: string;
  email: string;
  points: number;
  credits: number;
  avatar?: string;
  gamesCreated: number;
  gamesPlayed: number;
  correctAnswers: number;
  wrongAnswers: number;
  rank: number;
  topCategory?: string;

  // Add these new fields
  gameGotCloned?: number; // Number of times games were cloned by others
  emailNotifications?: boolean; // Email notifications setting
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    lastname: { type: String },
    phoneNumber: { type: String },
    avatar: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    points: { type: Number, default: 0 },
    credits: { type: Number, default: 0 },

    // Game stats
    gamesCreated: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    wrongAnswers: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    topCategory: { type: String, default: "" },

    // New fields
    gameGotCloned: { type: Number, default: 0 }, // Default to 0
    emailNotifications: { type: Boolean, default: true }, // Default to true (enabled)
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
