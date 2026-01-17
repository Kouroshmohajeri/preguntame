import { Request, Response } from "express";
import { enhancedEmailService } from "../services/enhancedEmailService.js";

// Transparent 1x1 pixel GIF (base64 encoded)
const TRACKING_PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
  "base64",
);

// Track email open
export const trackEmailOpen = async (req: Request, res: Response) => {
  try {
    const { trackingId } = req.params;
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    // Log the open event in database
    await enhancedEmailService.trackOpen(
      trackingId,
      ip as string,
      userAgent as string,
    );

    // Return the invisible 1x1 pixel
    res.set({
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      Expires: "0",
      Pragma: "no-cache",
    });

    res.send(TRACKING_PIXEL);
  } catch (error) {
    console.error("Error tracking email open:", error);
    // Still send pixel even on error (don't break email display)
    res.set("Content-Type", "image/gif");
    res.send(TRACKING_PIXEL);
  }
};

// Track link clicks (optional but useful)
export const trackEmailClick = async (req: Request, res: Response) => {
  try {
    const { trackingId } = req.params;
    const { url } = req.query;
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    // Log the click event
    await enhancedEmailService.trackClick(
      trackingId,
      ip as string,
      userAgent as string,
    );

    // Redirect to the actual URL
    if (url) {
      res.redirect(url as string);
    } else {
      res.status(400).json({ error: "URL parameter required" });
    }
  } catch (error) {
    console.error("Error tracking email click:", error);
    res.status(500).json({ error: "Failed to track click" });
  }
};

// Get email statistics
export const getEmailStats = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.query;
    const stats = await enhancedEmailService.getEmailStats(
      campaignId as string,
    );
    res.json(stats);
  } catch (error: any) {
    console.error("Error fetching email stats:", error);
    res.status(500).json({ error: error.message });
  }
};
