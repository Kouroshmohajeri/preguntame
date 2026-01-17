interface EmailTemplateOptions {
  recipientName?: string;
  preheaderText?: string;
  bodyContent: string;
  ctaButton?: {
    text: string;
    url: string;
  };
}

class EmailTemplateBuilder {
  private baseUrl: string;
  private logoUrl: string;
  private companyName: string;

  constructor() {
    this.baseUrl = process.env.BASE_URL || "https://preguntame.eu";
    this.logoUrl = `${this.baseUrl}/images/logo.svg`;
    this.companyName = "Pregúntame";
  }

  // Main template builder
  buildTemplate(options: EmailTemplateOptions): string {
    const { recipientName, preheaderText, bodyContent, ctaButton } = options;

    return `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  ${preheaderText ? `<meta name="description" content="${preheaderText}">` : ""}
  <title>${this.companyName}</title>
  <!--[if mso]>
  <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .email-wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 40px 20px;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(15, 23, 42, 0.08);
    }
    
    /* Header */
    .email-header {
      background: linear-gradient(135deg, #4ECDC4 0%, #0ea5e9 100%);
      padding: 40px 40px;
      text-align: center;
    }
    
    .logo-container {
      margin-bottom: 16px;
    }
    
    .logo {
      max-width: 160px;
      height: auto;
      display: inline-block;
    }
    
    .company-name {
      font-size: 32px;
      font-weight: 900;
      color: #ffffff;
      margin: 0;
      letter-spacing: -0.5px;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    /* Greeting */
    .greeting {
      padding: 32px 40px 0;
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
    }
    
    /* Body Content */
    .email-body {
      padding: 24px 40px 40px;
      color: #334155;
      font-size: 16px;
      line-height: 1.7;
    }
    
    .email-body p {
      margin: 0 0 16px 0;
    }
    
    .email-body p:last-child {
      margin-bottom: 0;
    }
    
    .email-body ul,
    .email-body ol {
      margin: 16px 0;
      padding-left: 24px;
    }
    
    .email-body li {
      margin-bottom: 8px;
    }
    
    .email-body strong {
      font-weight: 700;
      color: #0f172a;
    }
    
    .email-body a {
      color: #4ECDC4;
      text-decoration: none;
      font-weight: 600;
    }
    
    .email-body a:hover {
      text-decoration: underline;
    }
    
    /* CTA Button */
    .cta-container {
      text-align: center;
      padding: 24px 40px;
    }
    
    .cta-button {
      display: inline-block;
      padding: 16px 40px;
      background: linear-gradient(135deg, #4ECDC4 0%, #0ea5e9 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 800;
      font-size: 16px;
      box-shadow: 0 4px 16px rgba(78, 205, 196, 0.4);
    }
    
    /* Divider */
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
      margin: 32px 40px;
    }
    
    /* Footer */
    .email-footer {
      background-color: #f8fafc;
      padding: 40px 40px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    
    .signature {
      margin-bottom: 24px;
    }
    
    .signature-name {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
    }
    
    .signature-title {
      font-size: 14px;
      color: #64748b;
      font-weight: 600;
    }
    
    .footer-links {
      margin: 24px 0;
    }
    
    .footer-links a {
      color: #64748b;
      text-decoration: none;
      font-size: 14px;
      margin: 0 12px;
      font-weight: 600;
    }
    
    .footer-links a:hover {
      color: #4ECDC4;
    }
    
    .footer-text {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.6;
      margin: 20px 0 0 0;
    }
    
    .unsubscribe-text {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 16px;
    }
    
    .unsubscribe-text a {
      color: #64748b;
      text-decoration: underline;
    }
    
    /* Responsive */
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 20px 10px;
      }
      
      .email-header,
      .greeting,
      .email-body,
      .cta-container,
      .email-footer {
        padding-left: 24px !important;
        padding-right: 24px !important;
      }
      
      .company-name {
        font-size: 26px;
      }
      
      .greeting {
        font-size: 16px;
      }
      
      .email-body {
        font-size: 15px;
      }
      
      .cta-button {
        padding: 14px 32px;
        font-size: 15px;
      }
      
      .footer-links a {
        display: block;
        margin: 8px 0;
      }
    }
  </style>
</head>
<body>
  ${preheaderText ? `<div style="display: none; max-height: 0px; overflow: hidden;">${preheaderText}</div>` : ""}
  
  <div class="email-wrapper">
    <div class="email-container">
      <!-- Header -->
      <div class="email-header">
        <div class="logo-container">
          <img src="${this.logoUrl}" alt="${this.companyName}" class="logo" />
        </div>
        <h1 class="company-name">${this.companyName}</h1>
      </div>
      
      <!-- Greeting -->
      ${recipientName ? `<div class="greeting">Hello ${recipientName},</div>` : ""}
      
      <!-- Body Content -->
      <div class="email-body">
        ${bodyContent}
      </div>
      
      <!-- CTA Button (if provided) -->
      ${
        ctaButton
          ? `
      <div class="cta-container">
        <a href="${ctaButton.url}" class="cta-button">${ctaButton.text}</a>
      </div>
      `
          : ""
      }
      
      <!-- Divider -->
      <div class="divider"></div>
      
      <!-- Footer -->
      <div class="email-footer">
        <div class="signature">
          <div class="signature-name">The ${this.companyName} Team</div>
          <div class="signature-title">Your real-time quiz platform</div>
        </div>
        
        <div class="footer-links">
          <a href="${this.baseUrl}">Website</a>
          <a href="${this.baseUrl}/what-is-preguntame">About</a>
          <a href="${this.baseUrl}/contact-us">Contact</a>
          <a href="${this.baseUrl}/privacy">Privacy & Terms</a>
        </div>
        
        <p class="footer-text">
          This email was sent from ${this.companyName}<br>
          Barcelona, Spain
        </p>
        
        <p class="unsubscribe-text">
          To manage your email preferences, visit your <a href="${this.baseUrl}/dashboard">Dashboard</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }

  // Quick template generators for common emails

  // Update the welcomeEmail method:
  welcomeEmail(name: string): string {
    return this.buildTemplate({
      recipientName: name,
      preheaderText: "Welcome to Pregúntame! Start your learning adventure 🎉",
      bodyContent: `
      <h2 style="color: #0ea5e9; font-size: 28px; margin-bottom: 20px;">
        Welcome to Pregúntame! 🎉
      </h2>
      <p style="font-size: 16px; line-height: 1.6; color: #64748b;">
        We're excited to have you with us! Pregúntame is the platform where you can create, play, and share interactive quizzes with friends, classmates, or colleagues.
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #64748b; margin-top: 20px;">
        <strong>What can you do on Pregúntame?</strong>
      </p>
      <ul style="font-size: 16px; line-height: 1.8; color: #64748b; margin: 15px 0; padding-left: 20px;">
        <li>🎮 <strong>Create custom quizzes</strong> on any topic</li>
        <li>🏆 <strong>Compete in real-time</strong> with other players</li>
        <li>📊 <strong>View detailed statistics</strong> of your performance</li>
        <li>🎯 <strong>Climb the leaderboard</strong> and become the best</li>
        <li>🤝 <strong>Share your quizzes</strong> with the community</li>
      </ul>
      <p style="font-size: 16px; line-height: 1.6; color: #64748b; margin-top: 25px;">
        Want to learn more about us and our mission?
      </p>
      <a href="https://preguntame.eu/what-is-preguntame" 
         style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #4ECDC4, #0ea5e9); color: white; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; margin-top: 20px; box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);">
        📖 Discover What is Pregúntame
      </a>
      <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin-top: 30px;">
        If you have any questions, don't hesitate to contact us. We're here to help!
      </p>
    `,
    });
  }

  // Update or create the loginNotification method:
  loginNotificationEmail(
    name: string,
    ip: string,
    userAgent: string,
    loginTime: string,
  ): string {
    return this.buildTemplate({
      recipientName: name,
      preheaderText: "New session started on your Pregúntame account",
      bodyContent: `
      <h2 style="color: #0ea5e9; font-size: 28px; margin-bottom: 20px;">
        👋 Welcome back, ${name}!
      </h2>
      <p style="font-size: 16px; line-height: 1.6; color: #64748b;">
        Great to see you again on Pregúntame! We've just detected a new login to your account.
      </p>
      
      <div style="background: rgba(78, 205, 196, 0.1); border-left: 4px solid #4ECDC4; padding: 20px; margin: 25px 0; border-radius: 8px;">
        <p style="margin: 0 0 10px 0; color: #0f172a; font-weight: 600;">
          📍 <strong>Login Details:</strong>
        </p>
        <p style="margin: 5px 0; color: #64748b; font-size: 15px;">
          <strong>Date and Time:</strong> ${loginTime}
        </p>
        <p style="margin: 5px 0; color: #64748b; font-size: 15px;">
          <strong>Device:</strong> ${userAgent}
        </p>
        <p style="margin: 5px 0; color: #64748b; font-size: 15px;">
          <strong>Approximate Location (IP):</strong> ${ip}
        </p>
      </div>

      <p style="font-size: 16px; line-height: 1.6; color: #64748b; margin-top: 25px;">
        Wasn't you? Please change your password immediately and contact our support team.
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #64748b; margin-top: 20px;">
        Keep competing and improving your ranking! 🏆
      </p>

      <a href="https://preguntame.eu/dashboard" 
         style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #4ECDC4, #0ea5e9); color: white; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; margin-top: 20px; box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);">
        🎮 Go to my Dashboard
      </a>
    `,
    });
  }
  passwordResetEmail(name: string, resetUrl: string): string {
    return this.buildTemplate({
      recipientName: name,
      preheaderText: "Reset your Pregúntame password",
      bodyContent: `
        <p>We received a request to reset your account password.</p>
        <p>If you didn't request this change, you can safely ignore this email.</p>
        <p>To reset your password, click the button below. This link will expire in <strong>1 hour</strong>.</p>
      `,
      ctaButton: {
        text: "Reset Password",
        url: resetUrl,
      },
    });
  }

  leaderboardUpdateEmail(name: string, position: number): string {
    return this.buildTemplate({
      recipientName: name,
      preheaderText: "Leaderboard update!",
      bodyContent: `
        <p>We have good news! 🎊</p>
        <p>You've reached position <strong>#${position}</strong> in the Pregúntame global rankings.</p>
        <p>Keep it up and you can make it to the top 10. Every quiz counts!</p>
        <p>Ready for more challenges?</p>
      `,
      ctaButton: {
        text: "View Full Rankings",
        url: `${this.baseUrl}/leaderboard`,
      },
    });
  }

  announcementEmail(name: string, title: string, content: string): string {
    return this.buildTemplate({
      recipientName: name,
      preheaderText: title,
      bodyContent: content,
      ctaButton: {
        text: "Learn More",
        url: this.baseUrl,
      },
    });
  }

  customEmail(
    name: string,
    subject: string,
    content: string,
    buttonText?: string,
    buttonUrl?: string,
  ): string {
    return this.buildTemplate({
      recipientName: name,
      preheaderText: subject,
      bodyContent: content,
      ctaButton:
        buttonText && buttonUrl
          ? { text: buttonText, url: buttonUrl }
          : undefined,
    });
  }
}

export const emailTemplateBuilder = new EmailTemplateBuilder();
