import mongoose, { Schema, Document } from "mongoose";

export interface IEmailBlacklist extends Document {
  email: string;
  reason: "bounced" | "complained" | "unsubscribed" | "manual";
  addedAt: Date;
  addedBy?: string;
  notes?: string;
}

const EmailBlacklistSchema = new Schema<IEmailBlacklist>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    reason: {
      type: String,
      enum: ["bounced", "complained", "unsubscribed", "manual"],
      required: true,
    },
    addedAt: { type: Date, default: Date.now },
    addedBy: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export const EmailBlacklist = mongoose.model<IEmailBlacklist>(
  "EmailBlacklist",
  EmailBlacklistSchema
);
