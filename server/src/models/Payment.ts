// src/models/Payment.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IPayment extends Document {
  user: Schema.Types.ObjectId;
  subscription: Schema.Types.ObjectId;
  stripePaymentId: string;
  amount: number; // in cents
  currency: string;
  status: "succeeded" | "failed" | "pending";
  paymentDate: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subscription: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    stripePaymentId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: {
      type: String,
      enum: ["succeeded", "failed", "pending"],
      required: true,
    },
    paymentDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);
export default Payment;
