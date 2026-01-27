import mongoose, { Schema, Document } from "mongoose";
import crypto from "crypto";

export interface IBetaAccessRequest extends Document {
  email: string;
  name: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  notes?: string;
  // License fields
  licenseKey?: string;
  licenseIssuedAt?: Date;
  licenseExpiredAt?: Date;
  licenseStatus: "active" | "expired" | "revoked" | "none";
  creditsGranted: number;
  creditsRemaining: number;
}

// Generate unique license key
function generateLicenseKey(): string {
  const segments = [];
  for (let i = 0; i < 4; i++) {
    segments.push(
      crypto.randomBytes(4).toString("hex").toUpperCase().substring(0, 8),
    );
  }
  return `BETA-${segments.join("-")}`;
}

const BetaAccessRequestSchema = new Schema<IBetaAccessRequest>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  approvedAt: {
    type: Date,
  },
  rejectedAt: {
    type: Date,
  },
  notes: {
    type: String,
  },
  // License fields
  licenseKey: {
    type: String,
    unique: true,
    sparse: true, // Allows null values while maintaining uniqueness
  },
  licenseIssuedAt: {
    type: Date,
  },
  licenseExpiredAt: {
    type: Date,
  },
  licenseStatus: {
    type: String,
    enum: ["active", "expired", "revoked", "none"],
    default: "none",
  },
  creditsGranted: {
    type: Number,
    default: 0,
  },
  creditsRemaining: {
    type: Number,
    default: 0,
  },
});

// Pre-save hook to generate license key when approved
BetaAccessRequestSchema.pre("save", function (next) {
  if (
    this.isModified("status") &&
    this.status === "approved" &&
    !this.licenseKey
  ) {
    this.licenseKey = generateLicenseKey();
    this.licenseIssuedAt = new Date();
    this.licenseStatus = "active";
  }
  next();
});

export const BetaAccessRequest = mongoose.model<IBetaAccessRequest>(
  "BetaAccessRequest",
  BetaAccessRequestSchema,
);
