import { Request, Response } from "express";
import { emailService } from "../services/emailService.js";
import { EmailTemplate } from "../models/EmailTemplate.js";
import { EmailCampaign } from "../models/EmailCampaign.js";
import { EmailBlacklist } from "../models/EmailBlacklist.js";
import { EmailLog } from "../models/EmailLog.js";
import User, { IUser } from "../models/User.js";
import mongoose from "mongoose";
import {
  deleteEmail,
  getEmailById,
  getEmails,
  getSentEmails,
  markAsRead,
  sendEmail,
} from "../services/microsoftGraphService.js";
import { enhancedEmailService } from "../services/enhancedEmailService.js";

// ============= EMAIL TEMPLATES =============

export const createTemplate = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      subject,
      htmlContent,
      textContent,
      category,
      variables,
    } = req.body;

    const template = await EmailTemplate.create({
      name,
      description,
      subject,
      htmlContent,
      textContent,
      category,
      variables,
      createdBy: req.user?.email || "admin",
    });

    res.status(201).json(template);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await EmailTemplate.find().sort({ createdAt: -1 });
    res.json(templates);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const template = await EmailTemplate.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(template);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await EmailTemplate.findByIdAndDelete(id);
    res.json({ message: "Template deleted" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ============= EMAIL CAMPAIGNS =============

export const createCampaign = async (req: Request, res: Response) => {
  try {
    const { name, subject, templateId, recipientFilter, scheduledFor } =
      req.body;

    const template = await EmailTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    const campaign = await EmailCampaign.create({
      name,
      subject,
      template: template.htmlContent,
      recipientFilter,
      scheduledFor,
      createdBy: req.user?.email || "admin",
      status: scheduledFor ? "scheduled" : "draft",
    });

    res.status(201).json(campaign);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const sendCampaign = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const campaign = await EmailCampaign.findById(id);

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Get recipients based on filter
    let query: any = {};
    if (campaign.recipientFilter.emailNotifications) {
      query.emailNotifications = true;
    }
    if (campaign.recipientFilter.hasSubscription) {
      query.currentSubscription = { $exists: true };
    }

    let recipients: Array<{ email: string; name: string }> = [];

    if (
      campaign.recipientFilter.customEmails &&
      campaign.recipientFilter.customEmails.length > 0
    ) {
      recipients = campaign.recipientFilter.customEmails.map((email) => ({
        email,
        name: "User",
      }));
    } else {
      const users = await User.find(query).select("email name");
      recipients = users.map((u: IUser) => ({
        email: u.email,
        name: u.name,
      }));
    }

    // Update campaign status
    campaign.status = "sending";
    campaign.stats.total = recipients.length;
    await campaign.save();

    // Send emails in background
    const result = await emailService.sendBulkEmails({
      recipients,
      templateId: req.body.templateId,
      subject: campaign.subject,
      campaignId: (campaign._id as mongoose.Types.ObjectId).toString(),
    });

    // Update campaign stats
    campaign.status = "sent";
    campaign.sentAt = new Date();
    campaign.stats.sent = result.sent;
    campaign.stats.failed = result.failed;
    await campaign.save();

    res.json({ message: "Campaign sent", stats: result });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const campaigns = await EmailCampaign.find().sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCampaignStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const stats = await emailService.getEmailStats(id);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ============= EMAIL BLACKLIST =============

export const getBlacklist = async (req: Request, res: Response) => {
  try {
    const blacklist = await EmailBlacklist.find().sort({ addedAt: -1 });
    res.json(blacklist);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addToBlacklist = async (req: Request, res: Response) => {
  try {
    const { email, reason, notes } = req.body;
    const entry = await emailService.addToBlacklist(
      email,
      reason,
      req.user?.email,
      notes,
    );
    res.status(201).json(entry);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const removeFromBlacklist = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    await emailService.removeFromBlacklist(email);
    res.json({ message: "Removed from blacklist" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ============= EMAIL TRACKING =============

export const trackOpen = async (req: Request, res: Response) => {
  try {
    const { trackingId } = req.params;
    await emailService.trackOpen(trackingId, req.ip, req.get("user-agent"));

    // Return 1x1 transparent pixel
    const pixel = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64",
    );
    res.writeHead(200, {
      "Content-Type": "image/gif",
      "Content-Length": pixel.length,
    });
    res.end(pixel);
  } catch (error: any) {
    res.status(400).send();
  }
};

export const trackClick = async (req: Request, res: Response) => {
  try {
    const { trackingId } = req.params;
    const { url } = req.query;

    await emailService.trackClick(trackingId, req.ip, req.get("user-agent"));

    // Redirect to original URL
    res.redirect(url as string);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ============= EMAIL LOGS & OVERVIEW =============

export const getEmailLogs = async (req: Request, res: Response) => {
  try {
    const { campaignId, status, limit = 100 } = req.query;

    const query: any = {};
    if (campaignId) query.campaignId = campaignId;
    if (status) query.status = status;

    const logs = await EmailLog.find(query)
      .sort({ sentAt: -1 })
      .limit(Number(limit));

    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmailOverview = async (req: Request, res: Response) => {
  try {
    const [
      totalTemplates,
      totalCampaigns,
      totalSent,
      blacklistCount,
      recentLogs,
    ] = await Promise.all([
      EmailTemplate.countDocuments(),
      EmailCampaign.countDocuments(),
      EmailLog.countDocuments({ status: "sent" }),
      EmailBlacklist.countDocuments(),
      EmailLog.find()
        .sort({ sentAt: -1 })
        .limit(10)
        .select("recipient subject status sentAt"),
    ]);

    const stats = await emailService.getEmailStats();

    res.json({
      overview: {
        totalTemplates,
        totalCampaigns,
        totalSent,
        blacklistCount,
      },
      stats,
      recentLogs,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ============= MICROSOFT 365 / GRAPH API FUNCTIONS =============

// Get inbox emails from Microsoft 365
export const getInboxEmails = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const emails = await getEmails("inbox", limit);
    res.json(emails);
  } catch (error: any) {
    console.error("Error fetching inbox:", error);
    res.status(500).json({ error: error.message || "Failed to fetch emails" });
  }
};

// Get sent emails from Microsoft 365
export const getSentEmailsMicrosoft = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const emails = await getSentEmails(limit);
    res.json(emails);
  } catch (error: any) {
    console.error("Error fetching sent emails:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch sent emails" });
  }
};

// Get specific email by ID from Microsoft 365
export const getEmailByIdMicrosoft = async (req: Request, res: Response) => {
  try {
    const email = await getEmailById(req.params.id);
    res.json(email);
  } catch (error: any) {
    console.error("Error fetching email:", error);
    res.status(500).json({ error: error.message || "Failed to fetch email" });
  }
};

// Send individual email via Microsoft 365
export const sendEmailMicrosoft = async (req: Request, res: Response) => {
  try {
    const { to, subject, body, isHtml } = req.body;

    if (!to || !subject || !body) {
      return res
        .status(400)
        .json({ error: "Missing required fields: to, subject, body" });
    }

    const result = await sendEmail({ to, subject, body, isHtml });

    // Log the sent email
    await EmailLog.create({
      recipient: Array.isArray(to) ? to.join(", ") : to,
      subject,
      status: "sent",
      sentAt: new Date(),
      metadata: {
        sentVia: "Microsoft 365",
        sentBy: req.user?.email || "system",
      },
    });

    res.json(result);
  } catch (error: any) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: error.message || "Failed to send email" });
  }
};

// Mark email as read in Microsoft 365
export const markEmailAsReadMicrosoft = async (req: Request, res: Response) => {
  try {
    const result = await markAsRead(req.params.id);
    res.json(result);
  } catch (error: any) {
    console.error("Error marking email as read:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to mark email as read" });
  }
};

// Delete email from Microsoft 365
export const deleteEmailMicrosoft = async (req: Request, res: Response) => {
  try {
    const result = await deleteEmail(req.params.id);
    res.json(result);
  } catch (error: any) {
    console.error("Error deleting email:", error);
    res.status(500).json({ error: error.message || "Failed to delete email" });
  }
};

// ============= IMAP FUNCTIONS (Enhanced Email Service) =============

// Get sent emails via IMAP
export const getSentEmailsIMAP = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const emails = await enhancedEmailService.getSentEmails(limit);
    res.json(emails);
  } catch (error: any) {
    console.error("Error fetching sent emails:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch sent emails" });
  }
};

// Get draft emails via IMAP
export const getDraftEmailsIMAP = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const emails = await enhancedEmailService.getDraftEmails(limit);
    res.json(emails);
  } catch (error: any) {
    console.error("Error fetching draft emails:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch draft emails" });
  }
};

// Get sent emails from EmailLog (our database)
export const getSentEmailsFromLogs = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    const logs = await EmailLog.find({
      status: { $in: ["sent", "opened", "clicked"] },
    })
      .sort({ sentAt: -1 })
      .limit(limit)
      .lean();

    const emails = logs.map((log) => ({
      id: log._id.toString(),
      subject: log.subject,
      from: {
        emailAddress: {
          address:
            process.env.EMAIL_FROM ||
            process.env.EMAIL_USER ||
            "info@preguntame.eu",
        },
      },
      to: [
        {
          emailAddress: {
            address: log.recipient,
          },
        },
      ],
      receivedDateTime: log.sentAt.toISOString(),
      bodyPreview: log.body?.substring(0, 150) || `Sent to ${log.recipient}`,
      body: {
        content:
          log.metadata?.htmlContent ||
          log.body ||
          `<p>Email sent to <strong>${log.recipient}</strong></p>`,
        contentType: "HTML",
      },
      isRead: true,
      status: log.status,
      trackingId: log.metadata?.trackingId,
    }));

    res.json(emails);
  } catch (error: any) {
    console.error("Error fetching sent emails from logs:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch sent emails" });
  }
};

// Send single email with beautiful template (for compose in UI)
export const sendSingleEmail = async (req: Request, res: Response) => {
  try {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res
        .status(400)
        .json({ error: "Missing required fields: to, subject, body" });
    }

    // Get recipient name from user context or extract from email
    const recipientName = req.user?.name || to.split("@")[0] || "Usuario";

    // Send with beautiful template
    await enhancedEmailService.sendComposedEmail(
      to,
      subject,
      body,
      recipientName,
    );

    res.json({ success: true, message: "Email sent successfully" });
  } catch (error: any) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: error.message || "Failed to send email" });
  }
};
