import express from "express";
import {
  createTemplate,
  getTemplates,
  updateTemplate,
  deleteTemplate,
  createCampaign,
  sendCampaign,
  getCampaigns,
  getCampaignStats,
  getBlacklist,
  addToBlacklist,
  removeFromBlacklist,
  trackOpen,
  trackClick,
  getEmailLogs,
  getEmailOverview,
  // Add these new imports
  getInboxEmails,
  getSentEmailsMicrosoft,
  getEmailByIdMicrosoft,
  sendEmailMicrosoft,
  markEmailAsReadMicrosoft,
  deleteEmailMicrosoft,
  getSentEmailsIMAP,
  getDraftEmailsIMAP,
  sendSingleEmail,
  getSentEmailsFromLogs,
} from "../controller/emailController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getEmailStats,
  trackEmailClick,
  trackEmailOpen,
} from "../controller/emailTrackingController.js";

const router = express.Router();

// Templates
router.post("/templates", authMiddleware, createTemplate);
router.get("/templates", authMiddleware, getTemplates);
router.put("/templates/:id", authMiddleware, updateTemplate);
router.delete("/templates/:id", authMiddleware, deleteTemplate);

// Campaigns
router.post("/campaigns", authMiddleware, createCampaign);
router.get("/campaigns", authMiddleware, getCampaigns);
router.post("/campaigns/:id/send", authMiddleware, sendCampaign);
router.get("/campaigns/:id/stats", authMiddleware, getCampaignStats);

// Blacklist
router.get("/blacklist", authMiddleware, getBlacklist);
router.post("/blacklist", authMiddleware, addToBlacklist);
router.delete("/blacklist/:email", authMiddleware, removeFromBlacklist);

// Tracking (public endpoints)
router.get("/track/open/:trackingId", trackOpen);
router.get("/track/click/:trackingId", trackClick);

// Logs
router.get("/logs", authMiddleware, getEmailLogs);

// Overview
router.get("/overview", authMiddleware, getEmailOverview);

// ============= MICROSOFT 365 ROUTES =============

// Get inbox emails from Microsoft 365
router.get("/inbox", authMiddleware, getInboxEmails);

// Get sent emails from Microsoft 365
router.get("/sent", authMiddleware, getSentEmailsMicrosoft);

// Get specific email by ID from Microsoft 365
router.get("/message/:id", authMiddleware, getEmailByIdMicrosoft);

// Send individual email via Microsoft 365
router.post("/send", authMiddleware, sendEmailMicrosoft);

// Mark email as read in Microsoft 365
router.patch("/message/:id/read", authMiddleware, markEmailAsReadMicrosoft);

// Delete email from Microsoft 365
router.delete("/message/:id", authMiddleware, deleteEmailMicrosoft);

router.get("/sent-imap", authMiddleware, getSentEmailsFromLogs);
router.get("/drafts-imap", authMiddleware, getDraftEmailsIMAP);
router.post("/send-single", authMiddleware, sendSingleEmail);

// Email tracking pixel route (public)
router.get("/track/open/:trackingId", authMiddleware, trackEmailOpen);
router.get("/track/click/:trackingId", authMiddleware, trackEmailClick);

// Stats route (protected if needed)
router.get("/stats", authMiddleware, getEmailStats);

export default router;
