import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  senderId?: mongoose.Types.ObjectId;
  from?: string; // ✅ NEW: Sender's email (optional)
  to?: string; // ✅ NEW: Receiver's email (optional)
  type:
    | "game"
    | "system"
    | "social"
    | "achievement"
    | "beta_request"
    | "beta_approved"
    | "beta_rejected"
    | "beta_revoked";
  title: string;
  message: string;
  data?: any;
  read: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  senderId: { type: Schema.Types.ObjectId, ref: "User" },
  from: { type: String }, // ✅ NEW: Sender's email
  to: { type: String }, // ✅ NEW: Receiver's email
  type: {
    type: String,
    enum: [
      "game",
      "system",
      "social",
      "achievement",
      "beta_request",
      "beta_approved",
      "beta_rejected",
      "beta_revoked",
    ],
    required: true,
  },
  link: { type: String },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: Schema.Types.Mixed, default: {} },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Notification", NotificationSchema);
