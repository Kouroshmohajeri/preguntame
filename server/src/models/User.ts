import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  lastname?: string;
  phoneNumber?: string;
  email: string;
  points: number;
  credits: number;
  avatar?: string;
  gamesCreated: number;
  gamesPlayed: number;
  correctAnswers: number;
  wrongAnswers: number;
  rank: number;
  topCategory?: string;
  gameGotCloned?: number;
  emailNotifications?: boolean;
  // Subscription related
  hasUsedFreeTrial?: boolean; // Track if free trial has been used
  stripeCustomerId?: string; // Stripe customer ID
  currentSubscription?: Schema.Types.ObjectId;
  aiCredits?: number;
  hasBetaAccess?: boolean;
  isOGUser?: boolean;
  isAdmin?: boolean;
  role?: "user" | "admin" | "moderator";
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    lastname: { type: String },
    phoneNumber: { type: String },
    avatar: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    points: { type: Number, default: 0 },
    credits: { type: Number, default: 0 },

    // Game stats
    gamesCreated: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    wrongAnswers: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    topCategory: { type: String, default: "" },
    gameGotCloned: { type: Number, default: 0 }, // Default to 0
    emailNotifications: { type: Boolean, default: true }, // Default to true (enabled)
    hasUsedFreeTrial: { type: Boolean, default: false },
    stripeCustomerId: { type: String },
    currentSubscription: { type: Schema.Types.ObjectId, ref: "Subscription" },
    aiCredits: {
      type: Number,
      default: 0,
    },
    hasBetaAccess: {
      type: Boolean,
      default: false,
    },
    isOGUser: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
  },
  { timestamps: true },
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
