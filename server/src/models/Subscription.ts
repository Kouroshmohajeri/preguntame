import mongoose, { Document, Schema } from "mongoose";

export interface ISubscription extends Document {
  user: Schema.Types.ObjectId;
  stripeSubscriptionId: string;
  plan: "starter" | "pro";
  status: "active" | "canceled" | "trialing";
  startDate: Date;
  currentPeriodEnd: Date;
  trialEnd?: Date;
  cancelAtPeriodEnd?: boolean;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    stripeSubscriptionId: { type: String, required: true },
    plan: { type: String, enum: ["starter", "pro"], required: true },
    status: {
      type: String,
      enum: ["active", "canceled", "trialing"],
      required: true,
    },
    startDate: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
    trialEnd: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Subscription = mongoose.model<ISubscription>(
  "Subscription",
  SubscriptionSchema
);
export default Subscription;
