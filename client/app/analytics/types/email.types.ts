export interface EmailTemplate {
  _id: string;
  name: string;
  description?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  category: "marketing" | "transactional" | "notification" | "announcement";
  variables: string[];
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmailCampaign {
  _id: string;
  name: string;
  subject: string;
  template: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  recipientFilter: {
    all?: boolean;
    emailNotifications?: boolean;
    hasSubscription?: boolean;
    customEmails?: string[];
  };
  scheduledFor?: string;
  sentAt?: string;
  stats: {
    total: number;
    sent: number;
    failed: number;
    bounced: number;
    opened: number;
    clicked: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EmailBlacklistEntry {
  _id: string;
  email: string;
  reason: "bounced" | "complained" | "unsubscribed" | "manual";
  addedAt: string;
  addedBy?: string;
  notes?: string;
}

export interface EmailLog {
  _id: string;
  campaignId?: string;
  recipient: string;
  subject: string;
  status: "sent" | "failed" | "bounced" | "opened" | "clicked";
  sentAt: string;
  openedAt?: string;
  clickedAt?: string;
  errorMessage?: string;
}

export interface EmailOverview {
  overview: {
    totalTemplates: number;
    totalCampaigns: number;
    totalSent: number;
    blacklistCount: number;
  };
  stats: {
    total: number;
    sent: number;
    failed: number;
    bounced: number;
    opened: number;
    clicked: number;
    openRate: string;
    clickRate: string;
  };
  recentLogs: EmailLog[];
}
