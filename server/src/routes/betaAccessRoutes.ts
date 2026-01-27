import express from "express";
import {
  createBetaRequest,
  getAllBetaRequests,
  getBetaRequestByEmail,
  approveBetaRequest,
  rejectBetaRequest,
  deleteBetaRequest,
  getBetaAccessStats,
  validateLicenseForWizard,
  getUserCredits,
  checkGenerationEligibility,
  deductCredits,
  refundCredits,
} from "../controller/betaAccessController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// ============= PUBLIC ROUTES =============

// Create beta access request (public - anyone can request)
router.post("/request", createBetaRequest);

// Check beta access status by email (public - users can check their own status)
router.get("/status/:email", getBetaRequestByEmail);

// ============= ADMIN ROUTES =============

// Get all beta access requests (admin only)
router.get("/all", authMiddleware, isAdmin, getAllBetaRequests);

// Get beta access statistics (admin only)
router.get("/stats", authMiddleware, isAdmin, getBetaAccessStats);

// Approve beta access request (admin only)
router.post("/approve/:email", authMiddleware, isAdmin, approveBetaRequest);

// Reject beta access request (admin only)
router.post("/reject/:email", authMiddleware, isAdmin, rejectBetaRequest);

// Delete beta access request (admin only)
router.delete("/:email", authMiddleware, isAdmin, deleteBetaRequest);

// ============= WIZARD LICENSE VALIDATION =============
router.post("/validate-license/:licenseKey", validateLicenseForWizard);
// Credit management routes
router.get("/credits/:email", getUserCredits);
router.get(
  "/credits/:email/eligibility",
  authMiddleware,
  checkGenerationEligibility,
);
router.post("/credits/deduct", authMiddleware, deductCredits);
router.post("/credits/refund", authMiddleware, refundCredits);

export default router;
