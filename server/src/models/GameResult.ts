import mongoose, { Schema, Document, Types } from "mongoose";

export interface PlayerAnswer {
  questionIndex: number;
  answerId: string;
  isCorrect: boolean;
  points: number;
  timeLeft: number;
}

export interface PlayerResult {
  playerId: string;
  name: string;
  avatar?: string;
  uuid?: string;

  score: number;
  correct: number;
  wrong: number;
  isAssigned: boolean;
  responseTime?: number;

  answers: PlayerAnswer[];
}

export interface GameResultDocument extends Document {
  gameCode: string;
  hostId: Types.ObjectId; // MongoDB User ObjectId
  players: PlayerResult[];
  createdAt: Date;
}

const PlayerAnswerSchema = new Schema<PlayerAnswer>({
  questionIndex: Number,
  answerId: String,
  isCorrect: Boolean,
  points: Number,
  timeLeft: Number,
});

const PlayerResultSchema = new Schema<PlayerResult>({
  playerId: String,
  name: String,
  avatar: String,
  uuid: String,
  score: Number,
  correct: Number,
  wrong: Number,
  isAssigned: { type: Boolean, default: false },
  responseTime: Number,
  answers: [PlayerAnswerSchema],
});

const GameResultSchema = new Schema<GameResultDocument>({
  gameCode: { type: String, required: true },
  hostId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  players: [PlayerResultSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<GameResultDocument>(
  "GameResult",
  GameResultSchema
);
