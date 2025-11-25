import mongoose, { Schema, Document, Types } from "mongoose";

interface PlayerAnswer {
  questionIndex: number;
  answerId: string;
  isCorrect: boolean;
  points: number;
  timeLeft: number;
}

export interface LeaderboardPlayer {
  id: string; // player's UUID
  name: string;
  avatar?: string;
  answers: PlayerAnswer[];
  score: number;
  correct: number;
  wrong: number;
  responseTime: number;
}

export interface LeaderboardDocument extends Document {
  host: Types.ObjectId;
  gameCode: string;
  players: LeaderboardPlayer[];
  createdAt: Date;
  updatedAt: Date;
}

const PlayerAnswerSchema = new Schema<PlayerAnswer>(
  {
    questionIndex: { type: Number, required: true },
    answerId: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    points: { type: Number, required: true },
    timeLeft: { type: Number, required: true },
  },
  { _id: false }
);

const PlayerSchema = new Schema<LeaderboardPlayer>(
  {
    id: { type: String, required: true }, // player UUID
    name: { type: String, required: true },
    avatar: { type: String },
    answers: { type: [PlayerAnswerSchema], default: [] },
    score: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    wrong: { type: Number, default: 0 },
    responseTime: { type: Number, default: 0 },
  },
  { _id: false }
);

const LeaderboardSchema = new Schema<LeaderboardDocument>(
  {
    host: { type: Schema.Types.ObjectId, ref: "User", required: true },
    gameCode: { type: String, required: true, unique: true },
    players: { type: [PlayerSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<LeaderboardDocument>(
  "Leaderboard",
  LeaderboardSchema
);
