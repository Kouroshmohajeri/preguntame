import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  lastname?: string;
  phoneNumber?: string;
  email: string;
  points: number;
  credits: number;
  gamesCreated: number;
  gamesPlayed: number;
  correctAnswers: number;
  wrongAnswers: number;
  rank: number;
  topCategory?: string;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    lastname: { type: String },
    phoneNumber: { type: String },
    email: { type: String, required: true, unique: true },
    points: { type: Number, default: 0 },
    credits: { type: Number, default: 0 },

    // New fields
    gamesCreated: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    wrongAnswers: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    topCategory: { type: String, default: "" },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
