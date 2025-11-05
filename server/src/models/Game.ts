import mongoose, { Schema, Document } from "mongoose";

export interface IAnswer {
  text: string;
  correct: boolean;
}

export interface IQuestion {
  text: string;
  answers: IAnswer[];
  order:Number,
}

export interface IGame extends Document {
  title: string;
  gameCode: string;
  questions: IQuestion[];
  createdAt: Date;
}

const AnswerSchema = new Schema<IAnswer>({
  text: { type: String, required: true },
  correct: { type: Boolean, default: false },
});

const QuestionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  answers: { type: [AnswerSchema], required: true },
  order: { type: Number, required: true }, 
});

const GameSchema = new Schema<IGame>({
  title: { type: String, required: true },
  gameCode: { type: String, unique: true, required: true },
  questions: { type: [QuestionSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Game || mongoose.model<IGame>("Game", GameSchema);
