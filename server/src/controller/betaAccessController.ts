// server/src/controller/betaAccessController.ts
import { Request, Response } from "express";
import { BetaAccessRequest } from "../models/BetaAccessRequest.js";
import User from "../models/User.js";
import { enhancedEmailService } from "../services/enhancedEmailService.js";
import { betaAccessScheduler } from "../services/betaAccessScheduler.js";
import Notification from "../models/Notification.js";

// ========================================
// CREDIT MANAGEMENT METHODS
// ========================================

// Get user credits and license info
export const getUserCredits = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const betaRequest = await BetaAccessRequest.findOne({ email });

    if (!betaRequest) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = await User.findOne({ email });

    res.json({
      success: true,
      credits: user?.credits || 0,
      betaCredits: betaRequest.creditsRemaining || 0,
      status: betaRequest.status,
      licenseStatus: betaRequest.licenseStatus,
      licenseKey: betaRequest.licenseKey,
    });
  } catch (error: any) {
    console.error("Get credits error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch credits",
    });
  }
};

// Deduct credits (use before AI generation)
export const deductCredits = async (req: Request, res: Response) => {
  try {
    const { email, amount } = req.body;

    if (!email || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid email and positive amount required",
      });
    }

    // Find beta request and user
    const betaRequest = await BetaAccessRequest.findOne({ email });
    const user = await User.findOne({ email });

    if (!betaRequest || !user) {
      return res.status(404).json({
        success: false,
        message: "User or beta access not found",
      });
    }

    // Check if user has beta access
    if (betaRequest.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Beta access required to use AI features",
      });
    }

    // Check license status
    if (betaRequest.licenseStatus !== "active") {
      return res.status(403).json({
        success: false,
        message: `License is ${betaRequest.licenseStatus}. Active license required to use AI features`,
      });
    }

    // Check User credits first
    const userCredits = user.credits || 0;
    if (userCredits < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient credits",
        creditsAvailable: userCredits,
        creditsRequired: amount,
      });
    }

    // Deduct from both User and BetaAccessRequest
    user.credits = userCredits - amount;
    betaRequest.creditsRemaining = Math.max(
      0,
      betaRequest.creditsRemaining - amount,
    );

    await user.save();
    await betaRequest.save();

    console.log("✅ Credits deducted:", {
      email,
      amount,
      userCreditsRemaining: user.credits,
      betaCreditsRemaining: betaRequest.creditsRemaining,
    });

    res.json({
      success: true,
      creditsDeducted: amount,
      creditsRemaining: user.credits,
      betaCreditsRemaining: betaRequest.creditsRemaining,
      message: `${amount} credits deducted successfully`,
    });
  } catch (error: any) {
    console.error("Deduct credits error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to deduct credits",
    });
  }
};

// Refund credits (use when AI generation fails)
export const refundCredits = async (req: Request, res: Response) => {
  try {
    const { email, amount } = req.body;

    if (!email || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid email and positive amount required",
      });
    }

    const betaRequest = await BetaAccessRequest.findOne({ email });
    const user = await User.findOne({ email });

    if (!betaRequest || !user) {
      return res.status(404).json({
        success: false,
        message: "User or beta access not found",
      });
    }

    // Refund to both User and BetaAccessRequest
    user.credits = (user.credits || 0) + amount;
    betaRequest.creditsRemaining = (betaRequest.creditsRemaining || 0) + amount;

    await user.save();
    await betaRequest.save();

    console.log("✅ Credits refunded:", {
      email,
      amount,
      userCreditsRemaining: user.credits,
      betaCreditsRemaining: betaRequest.creditsRemaining,
    });

    res.json({
      success: true,
      creditsRefunded: amount,
      creditsRemaining: user.credits,
      betaCreditsRemaining: betaRequest.creditsRemaining,
      message: `${amount} credits refunded successfully`,
    });
  } catch (error: any) {
    console.error("Refund credits error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to refund credits",
    });
  }
};

// Check if user can generate (has credits, status, license)
export const checkGenerationEligibility = async (
  req: Request,
  res: Response,
) => {
  try {
    const { email } = req.params;
    const { creditsRequired = 10 } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const betaRequest = await BetaAccessRequest.findOne({ email });
    const user = await User.findOne({ email });

    if (!betaRequest || !user) {
      return res.status(404).json({
        success: false,
        eligible: false,
        message: "User or beta access not found",
      });
    }

    const credits = user.credits || 0;
    const hasAccess = betaRequest.status === "approved";
    const hasLicense = betaRequest.licenseStatus === "active";
    const hasCredits = credits >= Number(creditsRequired);

    const eligible = hasAccess && hasLicense && hasCredits;

    res.json({
      success: true,
      eligible,
      credits,
      status: betaRequest.status,
      licenseStatus: betaRequest.licenseStatus,
      licenseKey: betaRequest.licenseKey,
      reasons: {
        hasAccess,
        hasLicense,
        hasCredits,
      },
    });
  } catch (error: any) {
    console.error("Check eligibility error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to check eligibility",
    });
  }
};

// ========================================
// EXISTING BETA ACCESS METHODS
// ========================================

// Create beta access request
export const createBetaRequest = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        error: "Email and name are required",
      });
    }

    // Check if user already has beta access
    const user = await User.findOne({ email });
    if (user?.hasBetaAccess) {
      return res.status(400).json({
        success: false,
        error: "You already have beta access!",
      });
    }

    // Check if request already exists
    const existingRequest = await BetaAccessRequest.findOne({ email });

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return res.status(400).json({
          success: false,
          error:
            "You already have a pending beta access request. Please check your email.",
        });
      }

      if (existingRequest.status === "approved") {
        return res.status(400).json({
          success: false,
          error: "You already have beta access",
        });
      }

      // If previously rejected, allow resubmission
      if (existingRequest.status === "rejected") {
        existingRequest.status = "pending";
        existingRequest.requestedAt = new Date();
        existingRequest.rejectedAt = undefined;
        existingRequest.notes = "";
        await existingRequest.save();

        // Send beta access request email to user
        await enhancedEmailService.sendBetaAccessRequest(email, name);

        // Send admin notification immediately
        await enhancedEmailService.sendAdminBetaNotification(email, name);

        // Schedule reminder for 2 hours
        const requestTime = new Date().toLocaleString("es-ES", {
          timeZone: "Europe/Madrid",
          dateStyle: "full",
          timeStyle: "medium",
        });
        betaAccessScheduler.scheduleReminder(email, name, requestTime);

        // Send in-app notification to user
        if (user) {
          await Notification.create({
            userId: user._id,
            type: "beta_request",
            title: "Beta Access Request Submitted! 🚀",
            message:
              "Your request is being reviewed! We will notify you shortly when your access is approved.",
            link: "/dashboard#ai-access",
            read: false,
          });
        }

        return res.json({
          success: true,
          message: "Beta access request resubmitted successfully",
          request: existingRequest,
        });
      }
    }

    // Create new request
    const betaRequest = await BetaAccessRequest.create({
      email,
      name,
      status: "pending",
      requestedAt: new Date(),
    });

    // Send beta access request email to user
    await enhancedEmailService.sendBetaAccessRequest(email, name);

    // Send admin notification immediately
    await enhancedEmailService.sendAdminBetaNotification(email, name);

    // Schedule reminder for 2 hours
    const requestTime = new Date().toLocaleString("es-ES", {
      timeZone: "Europe/Madrid",
      dateStyle: "full",
      timeStyle: "medium",
    });
    betaAccessScheduler.scheduleReminder(email, name, requestTime);

    // Send in-app notification to user
    if (user) {
      await Notification.create({
        userId: user._id,
        type: "beta_request",
        title: "Beta Access Request Submitted! 🚀",
        message:
          "Your request is being reviewed! We will notify you shortly when your access is approved.",
        link: "/dashboard#ai-access",
        read: false,
      });
    }

    res.status(201).json({
      success: true,
      message: "Beta access request sent! Check your email for instructions.",
      request: betaRequest,
    });
  } catch (error: any) {
    console.error("Error creating beta request:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create beta access request",
    });
  }
};

// Get all beta access requests (Admin only)
export const getAllBetaRequests = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const requests = await BetaAccessRequest.find(query)
      .sort({ requestedAt: -1 })
      .lean();

    res.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error: any) {
    console.error("Error fetching beta requests:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch beta requests",
    });
  }
};

// Get beta request by email
export const getBetaRequestByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    const request = await BetaAccessRequest.findOne({ email });

    if (!request) {
      return res.json({
        success: true,
        status: "none",
        request: null,
      });
    }

    res.json({
      success: true,
      status: request.status,
      request,
    });
  } catch (error: any) {
    console.error("Error fetching beta request:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch beta request",
    });
  }
};

// Approve beta access request (Admin only) - Issues license with 500 credits
export const approveBetaRequest = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const { notes } = req.body;

    // Find and update request
    const betaRequest = await BetaAccessRequest.findOne({ email });

    if (!betaRequest) {
      return res.status(404).json({
        success: false,
        error: "Beta request not found",
      });
    }

    if (betaRequest.status === "approved") {
      return res.status(400).json({
        success: false,
        error: "Request already approved",
      });
    }

    // Update beta request status and issue license
    betaRequest.status = "approved";
    betaRequest.approvedAt = new Date();
    betaRequest.creditsGranted = 500;
    betaRequest.creditsRemaining = 500;
    if (notes) betaRequest.notes = notes;

    // License key is auto-generated in pre-save hook
    await betaRequest.save();

    // Grant 500 credits to user
    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        $inc: { credits: 500 },
        $set: {
          hasBetaAccess: true,
          isOGUser: true,
        },
      },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    console.log("✅ Beta access granted with license:", {
      email: updatedUser.email,
      credits: updatedUser.credits,
      licenseKey: betaRequest.licenseKey,
      licenseStatus: betaRequest.licenseStatus,
    });

    // Cancel reminder
    betaAccessScheduler.cancelReminderOnApproval(email);

    // Send approval notification
    await Notification.create({
      userId: updatedUser._id,
      type: "beta_approved",
      title: "🎉 Congrats! Your Beta Access Has Been Granted!",
      message:
        "Congrats! Your access has been granted. You received 500 AI credits with unlimited validity!",
      link: "/dashboard#ai-access",
      read: false,
    });

    // Send confirmation email with license key
    await enhancedEmailService.sendCustomEmail(
      email,
      updatedUser.name,
      "🎉 Beta Access Approved - 500 AI Credits Activated!",
      `
        <h2 style="color: #4ecdc4; font-size: 28px; margin-bottom: 20px; font-weight: 900;">
          Welcome to Pregúntame Wizard Beta! 🚀
        </h2>
        <p style="font-size: 16px; line-height: 1.7; color: #334155;">
          Thank you for leaving a review! Your beta access has been approved.
        </p>
        <div style="background: linear-gradient(135deg, rgba(78, 205, 196, 0.1) 0%, rgba(14, 165, 233, 0.1) 100%); border: 3px solid #4ecdc4; border-left: 6px solid #4ecdc4; padding: 24px; margin: 25px 0; box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.1);">
          <p style="margin: 0 0 15px 0; color: #0f172a; font-weight: 700; font-size: 18px;">
            ✅ <strong>Your License Details:</strong>
          </p>
          <div style="background: #000; color: #4ecdc4; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 14px; margin: 15px 0;">
            LICENSE KEY: ${betaRequest.licenseKey}
          </div>
          <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 16px; line-height: 2;">
            <li><strong>500 AI Credits</strong> granted (No expiration)</li>
            <li><strong>Current Balance:</strong> ${updatedUser.credits} credits</li>
            <li><strong>Full Beta Access</strong> to Pregúntame Wizard (AI)</li>
            <li><strong>OG Status</strong> for future early access</li>
            <li><strong>Exclusive Discounts</strong> on premium features</li>
          </ul>
        </div>
        <p style="font-size: 16px; line-height: 1.7; color: #334155; margin-top: 25px;">
          Head to your dashboard to start creating AI-powered quizzes!
        </p>
        <p style="font-size: 14px; color: #64748b; margin-top: 20px;">
          <strong>Note:</strong> Your license is valid indefinitely. Keep your license key safe!
        </p>
      `,
      "🎮 Go to Dashboard",
      "https://preguntame.eu/dashboard#ai-access",
    );

    res.json({
      success: true,
      message: "Beta access approved successfully",
      request: {
        ...betaRequest.toObject(),
        licenseKey: betaRequest.licenseKey,
        licenseStatus: betaRequest.licenseStatus,
        creditsGranted: betaRequest.creditsGranted,
        creditsRemaining: betaRequest.creditsRemaining,
      },
      user: {
        email: updatedUser.email,
        name: updatedUser.name,
        credits: updatedUser.credits,
        hasBetaAccess: updatedUser.hasBetaAccess,
        isOGUser: updatedUser.isOGUser,
      },
    });
  } catch (error: any) {
    console.error("Error approving beta request:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to approve beta request",
    });
  }
};

// Reject beta access request (Admin only)
export const rejectBetaRequest = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const { notes } = req.body;

    // Find and update request
    const betaRequest = await BetaAccessRequest.findOne({ email });

    if (!betaRequest) {
      return res.status(404).json({
        success: false,
        error: "Beta request not found",
      });
    }

    if (betaRequest.status === "rejected") {
      return res.status(400).json({
        success: false,
        error: "Request already rejected",
      });
    }

    betaRequest.status = "rejected";
    betaRequest.rejectedAt = new Date();
    if (notes) betaRequest.notes = notes;
    await betaRequest.save();

    // Find user
    const user = await User.findOne({ email });

    if (user) {
      // Cancel reminder
      betaAccessScheduler.cancelReminderOnApproval(email);

      // Send rejection notification
      await Notification.create({
        userId: user._id,
        type: "beta_rejected",
        title: "Beta Access Request Update",
        message:
          "Unfortunately we cannot grant you access at this moment. We will notify you when you are eligible!",
        link: "/dashboard#ai-access",
        read: false,
      });

      // Send rejection email
      await enhancedEmailService.sendCustomEmail(
        email,
        user.name,
        "Beta Access Request Update",
        `
          <h2 style="color: #ff6b6b; font-size: 28px; margin-bottom: 20px; font-weight: 900;">
            Beta Access Request Update
          </h2>
          <p style="font-size: 16px; line-height: 1.7; color: #334155;">
            Thank you for your interest in Pregúntame Wizard (AI).
          </p>
          <p style="font-size: 16px; line-height: 1.7; color: #334155;">
            Unfortunately, we cannot grant you access at this moment. ${notes || "We will notify you when you are eligible!"}
          </p>
          <p style="font-size: 16px; line-height: 1.7; color: #334155; margin-top: 25px;">
            We appreciate your patience and will keep you updated on future opportunities.
          </p>
        `,
        "Back to Dashboard",
        "https://preguntame.eu/dashboard",
      );
    }

    res.json({
      success: true,
      message: "Beta access request rejected successfully",
      request: betaRequest,
    });
  } catch (error: any) {
    console.error("Error rejecting beta request:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to reject beta request",
    });
  }
};

// Delete beta access request (Admin only) - Revokes license and resets credits
export const deleteBetaRequest = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    const request = await BetaAccessRequest.findOne({ email });

    if (!request) {
      return res.status(404).json({
        success: false,
        error: "Beta request not found",
      });
    }

    // If the request was approved, revoke license and reset credits
    if (request.status === "approved") {
      const user = await User.findOne({ email });

      if (user && user.hasBetaAccess) {
        // Calculate how many credits user spent
        const creditsUsed =
          request.creditsGranted -
          Math.min(user.credits, request.creditsGranted);

        // Expire the license
        request.licenseStatus = "revoked";
        request.licenseExpiredAt = new Date();
        request.creditsRemaining = 0;
        await request.save();

        // Reset user credits to 0 and remove beta access
        const updatedUser = await User.findOneAndUpdate(
          { email },
          {
            $set: {
              credits: 0,
              hasBetaAccess: false,
              isOGUser: false,
            },
          },
          { new: true },
        );

        console.log("✅ License revoked:", {
          email: email,
          licenseKey: request.licenseKey,
          creditsGranted: request.creditsGranted,
          creditsUsed: creditsUsed,
          licenseStatus: "revoked",
        });

        // Send revocation notification
        await Notification.create({
          userId: user._id,
          type: "beta_revoked",
          title: "Beta Access Revoked",
          message:
            "Your beta license has been revoked. All AI credits have been removed from your account.",
          link: "/dashboard#ai-access",
          read: false,
        });

        // Send revocation email
        await enhancedEmailService.sendCustomEmail(
          email,
          user.name,
          "Beta License Revoked",
          `
            <h2 style="color: #ff6b6b; font-size: 28px; margin-bottom: 20px; font-weight: 900;">
              Beta License Revoked
            </h2>
            <p style="font-size: 16px; line-height: 1.7; color: #334155;">
              Your beta license to Pregúntame Wizard (AI) has been revoked.
            </p>
            <div style="background: rgba(239, 68, 68, 0.1); border: 3px solid #ef4444; border-left: 6px solid #ef4444; padding: 24px; margin: 25px 0;">
              <p style="margin: 0 0 10px 0; color: #0f172a; font-weight: 700;">
                License Details:
              </p>
              <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14px; line-height: 1.8;">
                <li>License Key: <code>${request.licenseKey}</code></li>
                <li>Credits Granted: ${request.creditsGranted}</li>
                <li>Credits Used: ${creditsUsed}</li>
                <li>Status: <strong>REVOKED</strong></li>
              </ul>
            </div>
            <p style="font-size: 16px; line-height: 1.7; color: #334155;">
              All AI credits have been removed from your account.
            </p>
            <p style="font-size: 16px; line-height: 1.7; color: #334155; margin-top: 25px;">
              If you believe this was a mistake, please contact support.
            </p>
          `,
          "Contact Support",
          "https://preguntame.eu/contact",
        );
      }
    }

    // Delete the beta request
    await BetaAccessRequest.findOneAndDelete({ email });

    // Cancel reminder if pending
    if (request.status === "pending") {
      betaAccessScheduler.cancelReminderOnApproval(email);
    }

    res.json({
      success: true,
      message: "Beta access request and license deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting beta request:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to delete beta request",
    });
  }
};

// Validate license for wizard access (called by middleware)
export const validateLicenseForWizard = async (req: Request, res: Response) => {
  try {
    const { licenseKey } = req.params;
    const { email } = req.body;

    if (!licenseKey || !email) {
      return res.status(400).json({
        success: false,
        error: "invalid_license",
        message: "License key and email are required",
      });
    }

    // Find beta request by license key
    const betaRequest = await BetaAccessRequest.findOne({ licenseKey });

    if (!betaRequest) {
      return res.status(404).json({
        success: false,
        error: "invalid_license",
        message: "License key not found",
      });
    }

    // 1. Check if license belongs to the user
    if (betaRequest.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: "unauthorized_license",
        message: "This license does not belong to your account",
      });
    }

    // 2. Check if status is approved
    if (betaRequest.status !== "approved") {
      return res.status(403).json({
        success: false,
        error: "not_approved",
        message: "Beta access request is not approved",
      });
    }

    // 3. ✅ CHECK IF LICENSE IS ACTIVE (THIS IS THE CRITICAL CHECK!)
    if (betaRequest.licenseStatus !== "active") {
      return res.status(403).json({
        success: false,
        error: "license_inactive",
        message: `License is ${betaRequest.licenseStatus}`,
      });
    }

    // 4. Check if user has credits in beta request
    if (betaRequest.creditsRemaining <= 0) {
      return res.status(403).json({
        success: false,
        error: "no_credits",
        message: "You have no AI credits remaining",
      });
    }

    // Find user to check credits in User model as well
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "user_not_found",
        message: "User account not found",
      });
    }

    // 5. Check if user has credits in User model
    if (!user.credits || user.credits <= 0) {
      return res.status(403).json({
        success: false,
        error: "no_credits",
        message: "You have no AI credits remaining in your account",
      });
    }

    // All validations passed
    res.json({
      success: true,
      message: "License is valid",
      license: {
        key: betaRequest.licenseKey,
        creditsRemaining: betaRequest.creditsRemaining,
        userCredits: user.credits,
        status: betaRequest.licenseStatus,
      },
    });
  } catch (error: any) {
    console.error("❌ Error validating license:", error);
    res.status(500).json({
      success: false,
      error: "validation_error",
      message: error.message || "Failed to validate license",
    });
  }
};

// Track credit usage (called when user uses AI credits)
export const trackCreditUsage = async (email: string, creditsUsed: number) => {
  const betaRequest = await BetaAccessRequest.findOne({
    email,
    licenseStatus: "active",
  });

  if (betaRequest) {
    betaRequest.creditsRemaining = Math.max(
      0,
      betaRequest.creditsRemaining - creditsUsed,
    );
    await betaRequest.save();
  }
};

// Get beta access statistics (Admin only)
export const getBetaAccessStats = async (req: Request, res: Response) => {
  try {
    const [total, pending, approved, rejected] = await Promise.all([
      BetaAccessRequest.countDocuments(),
      BetaAccessRequest.countDocuments({ status: "pending" }),
      BetaAccessRequest.countDocuments({ status: "approved" }),
      BetaAccessRequest.countDocuments({ status: "rejected" }),
    ]);

    res.json({
      success: true,
      stats: {
        total,
        pending,
        approved,
        rejected,
        approvalRate:
          total > 0 ? ((approved / total) * 100).toFixed(2) : "0.00",
      },
    });
  } catch (error: any) {
    console.error("Error fetching beta stats:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch beta access statistics",
    });
  }
};
