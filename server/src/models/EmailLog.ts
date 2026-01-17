import mongoose, { Schema, Document } from "mongoose";

export interface IEmailLog extends Document {
  campaignId?: mongoose.Types.ObjectId;
  recipient: string;
  subject: string;
  body?: string;
  status: "sent" | "failed" | "bounced" | "opened" | "clicked";
  sentAt: Date;
  openedAt?: Date;
  clickedAt?: Date;
  errorMessage?: string;
  metadata: {
    ip?: string;
    userAgent?: string;
    trackingId: string;
    htmlContent?: string; // Store full HTML content
  };
}

const EmailLogSchema = new Schema<IEmailLog>(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: "EmailCampaign" },
    recipient: { type: String, required: true, index: true },
    subject: { type: String, required: true },
    body: { type: String },
    status: {
      type: String,
      enum: ["sent", "failed", "bounced", "opened", "clicked"],
      default: "sent",
    },
    sentAt: { type: Date, default: Date.now },
    openedAt: { type: Date },
    clickedAt: { type: Date },
    errorMessage: { type: String },
    metadata: {
      ip: { type: String },
      userAgent: { type: String },
      trackingId: { type: String, required: true, unique: true },
      htmlContent: { type: String },
    },
  },
  { timestamps: true },
);
EmailLogSchema.index({ "metadata.trackingId": 1 });
EmailLogSchema.index({ status: 1, sentAt: -1 });
EmailLogSchema.index({ recipient: 1, sentAt: -1 });

// Index for efficient querying
EmailLogSchema.index({ campaignId: 1, status: 1 });
EmailLogSchema.index({ "metadata.trackingId": 1 });

export const EmailLog = mongoose.model<IEmailLog>("EmailLog", EmailLogSchema);
