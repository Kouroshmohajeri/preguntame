import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  senderId?: mongoose.Types.ObjectId;
  type: "game" | "system" | "social" | "achievement";
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  senderId: { type: Schema.Types.ObjectId, ref: "User" },
  type: {
    type: String,
    enum: ["game", "system", "social", "achievement"],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: Schema.Types.Mixed, default: {} },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Notification", NotificationSchema);
