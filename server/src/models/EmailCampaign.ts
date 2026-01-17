import mongoose, { Schema, Document } from "mongoose";

export interface IEmailCampaign extends Document {
  name: string;
  subject: string;
  template: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  recipientFilter: {
    all?: boolean;
    emailNotifications?: boolean;
    hasSubscription?: boolean;
    customEmails?: string[];
  };
  scheduledFor?: Date;
  sentAt?: Date;
  createdBy: string;
  stats: {
    total: number;
    sent: number;
    failed: number;
    bounced: number;
    opened: number;
    clicked: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EmailCampaignSchema = new Schema<IEmailCampaign>(
  {
    name: { type: String, required: true },
    subject: { type: String, required: true },
    template: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "scheduled", "sending", "sent", "failed"],
      default: "draft",
    },
    recipientFilter: {
      all: { type: Boolean, default: false },
      emailNotifications: { type: Boolean, default: false },
      hasSubscription: { type: Boolean, default: false },
      customEmails: [{ type: String }],
    },
    scheduledFor: { type: Date },
    sentAt: { type: Date },
    createdBy: { type: String, required: true },
    stats: {
      total: { type: Number, default: 0 },
      sent: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      bounced: { type: Number, default: 0 },
      opened: { type: Number, default: 0 },
      clicked: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const EmailCampaign = mongoose.model<IEmailCampaign>(
  "EmailCampaign",
  EmailCampaignSchema
);
