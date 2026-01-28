import { mailTransporter } from "../config/mail.js";
import { EmailLog } from "../models/EmailLog.js";
import { EmailBlacklist } from "../models/EmailBlacklist.js";
import { EmailTemplate } from "../models/EmailTemplate.js";
import crypto from "crypto";
import Bottleneck from "bottleneck";
import Imap from "imap";
import { simpleParser, ParsedMail } from "mailparser";
import { emailTemplateBuilder } from "./emailTemplateBuilder.js";
import User from "../models/User.js";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  campaignId?: string;
  trackOpens?: boolean;
  trackClicks?: boolean;
  priority?: "high" | "normal" | "low";
}

interface BulkEmailOptions {
  recipients: Array<{ email: string; name: string; customData?: any }>;
  templateId: string;
  subject: string;
  campaignId?: string;
}

interface IMAPEmail {
  id: string;
  subject: string;
  from: { emailAddress: { address: string } };
  to: Array<{ emailAddress: { address: string } }>;
  receivedDateTime: string;
  bodyPreview: string;
  body: { content: string; contentType: string };
  isRead: boolean;
}

class EnhancedEmailService {
  transporter: any;
  baseUrl: string;
  limiter: Bottleneck;
  imapConfig: any;

  constructor() {
    this.transporter = mailTransporter;
    this.baseUrl = process.env.BASE_URL || "https://preguntame.eu";

    // Rate limiter: Max 10 emails per minute for bulk sends
    this.limiter = new Bottleneck({
      minTime: 6000, // 6 seconds between emails = 10 per minute
      maxConcurrent: 1,
    });

    // IMAP configuration for Microsoft 365
    this.imapConfig = {
      user: process.env.EMAIL_USER!,
      password: process.env.EMAIL_PASSWORD!,
      host: "outlook.office365.com",
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    };
  }

  // ============= IMAP FUNCTIONS (READ EMAILS) =============

  private async fetchEmailsFromFolder(
    folderName: string,
    limit: number = 50,
  ): Promise<IMAPEmail[]> {
    return new Promise((resolve, reject) => {
      const imap = new Imap(this.imapConfig);
      const emails: IMAPEmail[] = [];

      imap.once("ready", () => {
        imap.openBox(folderName, true, (err: Error | null, box: any) => {
          if (err) {
            reject(err);
            return;
          }

          const totalMessages = box.messages.total;
          if (totalMessages === 0) {
            imap.end();
            resolve([]);
            return;
          }

          const start = Math.max(1, totalMessages - limit + 1);
          const fetchRange = `${start}:${totalMessages}`;

          const fetch = imap.seq.fetch(fetchRange, {
            bodies: "",
            struct: true,
          });

          fetch.on("message", (msg: any, seqno: number) => {
            msg.on("body", (stream: any) => {
              simpleParser(
                stream,
                async (err: Error | null, parsed: ParsedMail) => {
                  if (err) {
                    console.error("Error parsing email:", err);
                    return;
                  }

                  const email: IMAPEmail = {
                    id: `${seqno}`,
                    subject: parsed.subject || "No Subject",
                    from: {
                      emailAddress: {
                        address: parsed.from?.value[0]?.address || "unknown",
                      },
                    },
                    to:
                      parsed.to?.value.map((recipient: any) => ({
                        emailAddress: { address: recipient.address },
                      })) || [],
                    receivedDateTime:
                      parsed.date?.toISOString() || new Date().toISOString(),
                    bodyPreview: parsed.text?.substring(0, 150) || "",
                    body: {
                      content: parsed.html || parsed.text || "",
                      contentType: parsed.html ? "HTML" : "Text",
                    },
                    isRead: false,
                  };

                  emails.push(email);
                },
              );
            });
          });

          fetch.once("error", reject);

          fetch.once("end", () => {
            setTimeout(() => {
              imap.end();
              resolve(emails.reverse());
            }, 1000);
          });
        });
      });

      imap.once("error", reject);
      imap.connect();
    });
  }

  async getInboxEmails(limit: number = 50): Promise<IMAPEmail[]> {
    return this.fetchEmailsFromFolder("INBOX", limit);
  }

  async getSentEmails(limit: number = 50): Promise<IMAPEmail[]> {
    return this.fetchEmailsFromFolder("Sent Items", limit);
  }

  async getDraftEmails(limit: number = 50): Promise<IMAPEmail[]> {
    return this.fetchEmailsFromFolder("Drafts", limit);
  }

  // ============= SMTP FUNCTIONS (SEND EMAILS) =============

  private generateTrackingPixel(trackingId: string): string {
    return `<img src="${this.baseUrl}/api/email/track/open/${trackingId}" width="1" height="1" style="display:none;" />`;
  }

  private wrapLinksForTracking(html: string, trackingId: string): string {
    return html;
  }

  private async isBlacklisted(email: string): Promise<boolean> {
    const blacklisted = await EmailBlacklist.findOne({
      email: email.toLowerCase(),
    });
    return !!blacklisted;
  }

  private replaceVariables(
    template: string,
    variables: Record<string, any>,
  ): string {
    let result = template;
    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      result = result.replace(regex, variables[key] || "");
    });
    return result;
  }

  // Send single email (no rate limiting for transactional emails)

  // Send single email (no rate limiting for transactional emails)
  async sendMail(options: SendEmailOptions): Promise<void> {
    const { to, subject, text, html, campaignId, trackOpens, trackClicks } =
      options;

    const recipients = Array.isArray(to) ? to : [to];

    // Get email from env with fallback
    const fromEmail =
      process.env.EMAIL_FROM || process.env.MAIL_FROM || process.env.EMAIL_USER;

    if (!fromEmail) {
      throw new Error("EMAIL_FROM is not configured in environment variables");
    }

    for (const recipient of recipients) {
      if (await this.isBlacklisted(recipient)) {
        console.log(`Email ${recipient} is blacklisted. Skipping.`);
        continue;
      }

      const trackingId = crypto.randomBytes(16).toString("hex");
      let finalHtml = html || "";

      if (trackOpens && html) {
        finalHtml += this.generateTrackingPixel(trackingId);
      }

      if (trackClicks && html) {
        finalHtml = this.wrapLinksForTracking(finalHtml, trackingId);
      }

      try {
        await this.transporter.sendMail({
          from: `Pregúntame <${fromEmail}>`,
          to: recipient,
          subject,
          text,
          html: finalHtml,
        });

        // ✅ FIXED: Use 'text' instead of 'bodyContent'
        await EmailLog.create({
          campaignId,
          recipient,
          subject,
          body: text || "", // Store plain text version
          status: "sent",
          sentAt: new Date(),
          metadata: {
            trackingId,
            htmlContent: finalHtml, // Store full HTML
          },
        });
      } catch (error: any) {
        await EmailLog.create({
          campaignId,
          recipient,
          subject,
          status: "failed",
          sentAt: new Date(),
          errorMessage: error.message,
          metadata: { trackingId },
        });

        if (
          error.responseCode === 550 ||
          error.message.includes("does not exist")
        ) {
          await EmailBlacklist.create({
            email: recipient.toLowerCase(),
            reason: "bounced",
            notes: `Auto-blacklisted: ${error.message}`,
          });
        }

        throw error;
      }
    }
  }

  // Custom email with full control
  async sendCustomEmail(
    email: string,
    name: string,
    subject: string,
    content: string,
    buttonText?: string,
    buttonUrl?: string,
  ) {
    const htmlContent = emailTemplateBuilder.customEmail(
      name,
      subject,
      content,
      buttonText,
      buttonUrl,
    );

    return this.sendMail({
      to: email,
      subject,
      html: htmlContent,
      trackOpens: true,
      trackClicks: true,
    });
  }

  // Send bulk emails WITH rate limiting
  async sendBulkEmails(options: BulkEmailOptions): Promise<{
    sent: number;
    failed: number;
    skipped: number;
  }> {
    const { recipients, templateId, subject, campaignId } = options;

    const template = await EmailTemplate.findById(templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    // Use Bottleneck to rate limit bulk sends
    const tasks = recipients.map((recipient) =>
      this.limiter.schedule(async () => {
        try {
          if (await this.isBlacklisted(recipient.email)) {
            skipped++;
            return;
          }

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
        } catch (error) {
          console.error(`Failed to send to ${recipient.email}:`, error);
          failed++;
        }
      }),
    );

    await Promise.all(tasks);

    await EmailTemplate.findByIdAndUpdate(templateId, {
      $inc: { usageCount: sent },
    });

    return { sent, failed, skipped };
  }
  async sendBetaAccessRequest(email: string, name: string) {
    const trustpilotUrl =
      "https://www.trustpilot.com/review/preguntame.eu?_gl=1*14e9x1h*_gcl_au*MzAxOTgyNDEwLjE3NjI4MDk1ODIuMzIyOTA2MzkuMTc2ODc4Njc2NC4xNzY4Nzg2NzYz*_ga*MTYzMjk0NzU2MC4xNzYyODA5NTgy*_ga_11HBWMC274*czE3Njg4NDEyMjkkbzYkZzAkdDE3Njg4NDEyMjkkajYwJGwwJGgw";

    const htmlContent = emailTemplateBuilder.betaAccessRequestEmail(
      name,
      trustpilotUrl,
    );

    return this.sendMail({
      to: email,
      subject:
        "🚀 Pregúntame Wizard Beta - Leave a Review & Get 50 AI Credits!",
      html: htmlContent,
      trackOpens: true,
      trackClicks: true,
      priority: "high",
    });
  }

  // Send admin notification when user requests beta access
  async sendAdminBetaNotification(userEmail: string, userName: string) {
    const adminEmail = process.env.EMAIL_USER;

    if (!adminEmail) {
      console.error("Admin email not configured");
      return;
    }

    const requestTime = new Date().toLocaleString("es-ES", {
      timeZone: "Europe/Madrid",
      dateStyle: "full",
      timeStyle: "medium",
    });

    const htmlContent = emailTemplateBuilder.adminBetaAccessNotification(
      userEmail,
      userName,
      requestTime,
    );

    return this.sendMail({
      to: adminEmail,
      subject: `🔔 New Beta Access Request - ${userName}`,
      html: htmlContent,
      trackOpens: false,
      trackClicks: false,
      priority: "high",
    });
  }

  // Send admin reminder after 2 hours
  async sendAdminBetaReminder(
    userEmail: string,
    userName: string,
    requestTime: string,
  ) {
    const adminEmail = process.env.EMAIL_USER;

    if (!adminEmail) {
      console.error("Admin email not configured");
      return;
    }

    const htmlContent = emailTemplateBuilder.adminBetaAccessReminder(
      userEmail,
      userName,
      requestTime,
    );

    return this.sendMail({
      to: adminEmail,
      subject: `⏰ REMINDER: Beta Access Request - ${userName}`,
      html: htmlContent,
      trackOpens: false,
      trackClicks: false,
      priority: "high",
    });
  }

  // For sending custom composed emails from the UI with full template
  async sendComposedEmail(
    to: string,
    subject: string,
    bodyContent: string,
    senderName?: string,
  ) {
    const name = senderName || "Usuario";

    // Convert plain text to paragraphs
    const formattedBody = bodyContent
      .split("\n\n")
      .map((para) => `<p>${para.replace(/\n/g, "<br>")}</p>`)
      .join("");

    // Wrap the body content in beautiful email template
    const htmlContent = emailTemplateBuilder.buildTemplate({
      recipientName: name,
      preheaderText: subject,
      bodyContent: formattedBody,
    });

    return this.sendMail({
      to,
      subject,
      text: bodyContent,
      html: htmlContent,
      trackOpens: true,
      trackClicks: true,
    });
  }

  // ============= TRANSACTIONAL EMAILS (Auto-send, no rate limit) =============

  async sendWelcomeEmail(email: string, name: string) {
    const htmlContent = emailTemplateBuilder.welcomeEmail(name);

    return this.sendMail({
      to: email,
      subject: "¡Bienvenido a Pregúntame! 🎉",
      html: htmlContent,
      trackOpens: true,
      trackClicks: true,
      priority: "high",
    });
  }
  async sendLeaderboardUpdate(email: string, name: string, position: number) {
    const htmlContent = emailTemplateBuilder.leaderboardUpdateEmail(
      name,
      position,
    );

    return this.sendMail({
      to: email,
      subject: `¡Estás en el puesto #${position}! 🏆`,
      html: htmlContent,
      trackOpens: true,
      trackClicks: true,
    });
  }
  async sendVerificationEmail(email: string, verificationToken: string) {
    const verificationUrl = `${this.baseUrl}/verify?token=${verificationToken}`;
    return this.sendTemplateEmail(email, "email-verification", {
      verificationUrl,
    });
  }
  async sendAnnouncement(
    email: string,
    name: string,
    title: string,
    content: string,
  ) {
    const htmlContent = emailTemplateBuilder.announcementEmail({
      recipientName: name,
      title: title,
      content: content,
    });

    return this.sendMail({
      to: email,
      subject: title,
      html: htmlContent,
      trackOpens: true,
      trackClicks: true,
    });
  }

  async sendLoginNotification(email: string, ip: string, userAgent: string) {
    const user = await User.findOne({ email });
    const name = user?.name || "Usuario";
    const loginTime = new Date().toLocaleString("es-ES", {
      timeZone: "Europe/Madrid",
      dateStyle: "full",
      timeStyle: "short",
    });

    const htmlContent = emailTemplateBuilder.loginNotificationEmail(
      name,
      ip,
      userAgent,
      loginTime,
    );

    return this.sendMail({
      to: email,
      subject: "👋 ¡Bienvenido de vuelta a Pregúntame!",
      html: htmlContent,
      trackOpens: true,
      trackClicks: true,
      priority: "high",
    });
  }

  // Send using template
  async sendTemplateEmail(
    email: string,
    templateName: string,
    variables: Record<string, any>,
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
      priority: "high",
    });
  }

  // ============= TRACKING & STATS =============

  async trackOpen(trackingId: string, ip?: string, userAgent?: string) {
    await EmailLog.findOneAndUpdate(
      { "metadata.trackingId": trackingId, status: "sent" },
      {
        status: "opened",
        openedAt: new Date(),
        "metadata.ip": ip,
        "metadata.userAgent": userAgent,
      },
    );
  }

  async trackClick(trackingId: string, ip?: string, userAgent?: string) {
    await EmailLog.findOneAndUpdate(
      { "metadata.trackingId": trackingId },
      {
        status: "clicked",
        clickedAt: new Date(),
        "metadata.ip": ip,
        "metadata.userAgent": userAgent,
      },
    );
  }

  async addToBlacklist(
    email: string,
    reason: "bounced" | "complained" | "unsubscribed" | "manual",
    addedBy?: string,
    notes?: string,
  ) {
    return EmailBlacklist.create({
      email: email.toLowerCase(),
      reason,
      addedBy,
      notes,
    });
  }

  async removeFromBlacklist(email: string) {
    return EmailBlacklist.deleteOne({ email: email.toLowerCase() });
  }

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

export const enhancedEmailService = new EnhancedEmailService();
