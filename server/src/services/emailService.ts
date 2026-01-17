import { mailTransporter } from "../config/mail.js";
import { EmailLog } from "../models/EmailLog.js";
import { EmailBlacklist } from "../models/EmailBlacklist.js";
import { EmailTemplate } from "../models/EmailTemplate.js";
import crypto from "crypto";

interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  campaignId?: string;
  trackOpens?: boolean;
  trackClicks?: boolean;
}

interface BulkEmailOptions {
  recipients: Array<{ email: string; name: string; customData?: any }>;
  templateId: string;
  subject: string;
  campaignId?: string;
}

class EmailService {
  transporter: any;
  baseUrl: string;

  constructor() {
    this.transporter = mailTransporter;
    this.baseUrl = process.env.BASE_URL || "https://preguntame.eu";
  }

  // Generate tracking pixel for open tracking
  private generateTrackingPixel(trackingId: string): string {
    return `<img src="${this.baseUrl}/api/email/track/open/${trackingId}" width="1" height="1" style="display:none;" />`;
  }

  // Wrap links for click tracking
  private wrapLinksForTracking(html: string, trackingId: string): string {
    const linkRegex = /<a\s+href="([^"]+)"/gi;
    return html.replace(
      linkRegex,
      `<a href="${this.baseUrl}/api/email/track/click/${trackingId}?url=$1"`
    );
  }

  // Check if email is blacklisted
  private async isBlacklisted(email: string): Promise<boolean> {
    const blacklisted = await EmailBlacklist.findOne({
      email: email.toLowerCase(),
    });
    return !!blacklisted;
  }

  // Replace template variables
  private replaceVariables(
    template: string,
    variables: Record<string, any>
  ): string {
    let result = template;
    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      result = result.replace(regex, variables[key] || "");
    });
    return result;
  }

  async sendMail(options: SendEmailOptions): Promise<void> {
    const { to, subject, text, html, campaignId, trackOpens, trackClicks } =
      options;

    // Check blacklist
    if (await this.isBlacklisted(to)) {
      console.log(`Email ${to} is blacklisted. Skipping.`);
      return;
    }

    const trackingId = crypto.randomBytes(16).toString("hex");
    let finalHtml = html || "";

    // Add tracking
    if (trackOpens && html) {
      finalHtml += this.generateTrackingPixel(trackingId);
    }

    if (trackClicks && html) {
      finalHtml = this.wrapLinksForTracking(finalHtml, trackingId);
    }

    try {
      await this.transporter.sendMail({
        from: `Pregúntame <${process.env.MAIL_FROM}>`,
        to,
        subject,
        text,
        html: finalHtml,
      });

      // Log successful send
      await EmailLog.create({
        campaignId,
        recipient: to,
        subject,
        status: "sent",
        sentAt: new Date(),
        metadata: {
          trackingId,
        },
      });
    } catch (error: any) {
      // Log failed send
      await EmailLog.create({
        campaignId,
        recipient: to,
        subject,
        status: "failed",
        sentAt: new Date(),
        errorMessage: error.message,
        metadata: {
          trackingId,
        },
      });

      // Check if it's a hard bounce and add to blacklist
      if (
        error.responseCode === 550 ||
        error.message.includes("does not exist")
      ) {
        await EmailBlacklist.create({
          email: to.toLowerCase(),
          reason: "bounced",
          notes: `Auto-blacklisted: ${error.message}`,
        });
      }

      throw error;
    }
  }

  // Send bulk emails with rate limiting
  async sendBulkEmails(options: BulkEmailOptions): Promise<{
    sent: number;
    failed: number;
    skipped: number;
  }> {
    const { recipients, templateId, subject, campaignId } = options;

    // Get template
    const template = await EmailTemplate.findById(templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    // Send emails with delay to avoid spam filters
    for (const recipient of recipients) {
      try {
        // Check if blacklisted
        if (await this.isBlacklisted(recipient.email)) {
          skipped++;
          continue;
        }

        // Replace variables in template
        const htmlContent = this.replaceVariables(template.htmlContent, {
          name: recipient.name,
          email: recipient.email,
          ...recipient.customData,
        });

        const textContent = template.textContent
          ? this.replaceVariables(template.textContent, {
              name: recipient.name,
              email: recipient.email,
              ...recipient.customData,
            })
          : undefined;

        await this.sendMail({
          to: recipient.email,
          subject,
          html: htmlContent,
          text: textContent,
          campaignId,
          trackOpens: true,
          trackClicks: true,
        });

        sent++;

        // Rate limiting: wait 100ms between emails
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to send to ${recipient.email}:`, error);
        failed++;
      }
    }

    // Update template usage count
    await EmailTemplate.findByIdAndUpdate(templateId, {
      $inc: { usageCount: sent },
    });

    return { sent, failed, skipped };
  }

  // Send using template by name
  async sendTemplateEmail(
    email: string,
    templateName: string,
    variables: Record<string, any>
  ) {
    const template = await EmailTemplate.findOne({
      name: templateName,
      isActive: true,
    });
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    const htmlContent = this.replaceVariables(template.htmlContent, variables);
    const textContent = template.textContent
      ? this.replaceVariables(template.textContent, variables)
      : undefined;

    return this.sendMail({
      to: email,
      subject: this.replaceVariables(template.subject, variables),
      html: htmlContent,
      text: textContent,
      trackOpens: true,
      trackClicks: true,
    });
  }

  // Track email open
  async trackOpen(trackingId: string, ip?: string, userAgent?: string) {
    await EmailLog.findOneAndUpdate(
      { "metadata.trackingId": trackingId, status: "sent" },
      {
        status: "opened",
        openedAt: new Date(),
        "metadata.ip": ip,
        "metadata.userAgent": userAgent,
      }
    );
  }

  // Track email click
  async trackClick(trackingId: string, ip?: string, userAgent?: string) {
    await EmailLog.findOneAndUpdate(
      { "metadata.trackingId": trackingId },
      {
        status: "clicked",
        clickedAt: new Date(),
        "metadata.ip": ip,
        "metadata.userAgent": userAgent,
      }
    );
  }

  // Add email to blacklist
  async addToBlacklist(
    email: string,
    reason: "bounced" | "complained" | "unsubscribed" | "manual",
    addedBy?: string,
    notes?: string
  ) {
    return EmailBlacklist.create({
      email: email.toLowerCase(),
      reason,
      addedBy,
      notes,
    });
  }

  // Remove from blacklist
  async removeFromBlacklist(email: string) {
    return EmailBlacklist.deleteOne({ email: email.toLowerCase() });
  }

  // Get email statistics
  async getEmailStats(campaignId?: string) {
    const query = campaignId ? { campaignId } : {};

    const [total, sent, failed, bounced, opened, clicked] = await Promise.all([
      EmailLog.countDocuments(query),
      EmailLog.countDocuments({ ...query, status: "sent" }),
      EmailLog.countDocuments({ ...query, status: "failed" }),
      EmailLog.countDocuments({ ...query, status: "bounced" }),
      EmailLog.countDocuments({ ...query, status: "opened" }),
      EmailLog.countDocuments({ ...query, status: "clicked" }),
    ]);

    return {
      total,
      sent,
      failed,
      bounced,
      opened,
      clicked,
      openRate: sent > 0 ? ((opened / sent) * 100).toFixed(2) : "0.00",
      clickRate: sent > 0 ? ((clicked / sent) * 100).toFixed(2) : "0.00",
    };
  }
}

export const emailService = new EmailService();
