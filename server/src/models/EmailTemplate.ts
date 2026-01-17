import mongoose, { Schema, Document } from "mongoose";

export interface IEmailTemplate extends Document {
  name: string;
  description?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  category: "marketing" | "transactional" | "notification" | "announcement";
  variables: string[]; // e.g., ["name", "email", "customField"]
  isActive: boolean;
  createdBy: string;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const EmailTemplateSchema = new Schema<IEmailTemplate>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    subject: { type: String, required: true },
    htmlContent: { type: String, required: true },
    textContent: { type: String },
    category: {
      type: String,
      enum: ["marketing", "transactional", "notification", "announcement"],
      default: "marketing",
    },
    variables: [{ type: String }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, required: true },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const EmailTemplate = mongoose.model<IEmailTemplate>(
  "EmailTemplate",
  EmailTemplateSchema
);
