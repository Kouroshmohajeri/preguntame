import mongoose, { Schema, Document } from "mongoose";

export interface IAnswer {
  _id?: any; // Mongoose adds _id to subdocuments
  text: string;
  correct: boolean;
}

export interface IQuestion {
  text: string;
  answers: IAnswer[];
  order: Number;
  time: number; // Time moved to question level
}

export interface IGame extends Document {
  title: string;
  gameCode: string;
  questions: IQuestion[];
  createdAt: Date;
  hostId: mongoose.Types.ObjectId;
}

const AnswerSchema = new Schema<IAnswer>(
  {
    text: { type: String, required: true },
    correct: { type: Boolean, default: false },
  },
  { _id: true }
); // Explicitly enable _id for subdocuments

const QuestionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  answers: { type: [AnswerSchema], required: true },
  order: { type: Number, required: true },
  time: { type: Number, default: 10 }, // Default time for each question
});

const GameSchema = new Schema<IGame>({
  title: { type: String, required: true },
  gameCode: { type: String, unique: true, required: true },
  hostId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  questions: { type: [QuestionSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Game ||
  mongoose.model<IGame>("Game", GameSchema);
