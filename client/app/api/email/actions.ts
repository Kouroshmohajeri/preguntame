import { API } from "../Server";

// ============= TEMPLATES =============

export const getEmailTemplates = async () => {
  const response = await API.get("/email/templates");
  return response.data;
};

export const createEmailTemplate = async (templateData: {
  name: string;
  description?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  category: "marketing" | "transactional" | "notification" | "announcement";
  variables: string[];
}) => {
  const response = await API.post("/email/templates", templateData);
  return response.data;
};

export const updateEmailTemplate = async (
  id: string,
  templateData: {
    name?: string;
    description?: string;
    subject?: string;
    htmlContent?: string;
    textContent?: string;
    category?: "marketing" | "transactional" | "notification" | "announcement";
    variables?: string[];
    isActive?: boolean;
  }
) => {
  const response = await API.put(`/email/templates/${id}`, templateData);
  return response.data;
};

export const deleteEmailTemplate = async (id: string) => {
  const response = await API.delete(`/email/templates/${id}`);
  return response.data;
};

// ============= CAMPAIGNS =============

export const getEmailCampaigns = async () => {
  const response = await API.get("/email/campaigns");
  return response.data;
};

export const createEmailCampaign = async (campaignData: {
  name: string;
  subject: string;
  templateId: string;
  recipientFilter: {
    all?: boolean;
    emailNotifications?: boolean;
    hasSubscription?: boolean;
    customEmails?: string[];
  };
  scheduledFor?: string;
}) => {
  const response = await API.post("/email/campaigns", campaignData);
  return response.data;
};

export const sendEmailCampaign = async (id: string, templateId: string) => {
  const response = await API.post(`/email/campaigns/${id}/send`, { templateId });
  return response.data;
};

export const getCampaignStatistics = async (id: string) => {
  const response = await API.get(`/email/campaigns/${id}/stats`);
  return response.data;
};

// ============= BLACKLIST =============

export const getEmailBlacklist = async () => {
  const response = await API.get("/email/blacklist");
  return response.data;
};

export const addToEmailBlacklist = async (blacklistData: {
  email: string;
  reason: "bounced" | "complained" | "unsubscribed" | "manual";
  notes?: string;
}) => {
  const response = await API.post("/email/blacklist", blacklistData);
  return response.data;
};

export const removeFromEmailBlacklist = async (email: string) => {
  const response = await API.delete(`/email/blacklist/${encodeURIComponent(email)}`);
  return response.data;
};

// ============= LOGS =============

export const getEmailLogs = async (params?: {
  campaignId?: string;
  status?: "sent" | "failed" | "bounced" | "opened" | "clicked";
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.campaignId) queryParams.append("campaignId", params.campaignId);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const queryString = queryParams.toString();
  const url = queryString ? `/email/logs?${queryString}` : "/email/logs";

  const response = await API.get(url);
  return response.data;
};

// ============= OVERVIEW =============

export const getEmailOverview = async () => {
  const response = await API.get("/email/overview");
  return response.data;
};

// ============= IMAP EMAIL ACTIONS (Enhanced Service) =============

// Get inbox emails via IMAP
export const getInboxEmails = async (limit: number = 50) => {
  const response = await API.get(`/email/inbox?limit=${limit}`);
  return response.data;
};

// Get sent emails via IMAP
export const getSentEmails = async (limit: number = 50) => {
  const response = await API.get(`/email/sent-imap?limit=${limit}`);
  return response.data;
};

// Get draft emails via IMAP
export const getDraftEmails = async (limit: number = 50) => {
  const response = await API.get(`/email/drafts-imap?limit=${limit}`);
  return response.data;
};

// Send single email (for compose)
export const sendSingleEmail = async (emailData: {
  to: string | string[];
  subject: string;
  body: string;
  isHtml?: boolean;
}) => {
  const response = await API.post("/email/send-single", emailData);
  return response.data;
};
// Get email statistics
export const getEmailStats = async (campaignId?: string) => {
  const url = campaignId ? `/email/stats?campaignId=${campaignId}` : "/email/stats";
  const response = await API.get(url);
  return response.data;
};
// ============= MICROSOFT 365 ACTIONS (if you need them) =============

// Get sent emails from Microsoft 365 (Graph API)
export const getSentEmailsMicrosoft = async (limit: number = 50) => {
  const response = await API.get(`/email/sent?limit=${limit}`);
  return response.data;
};

// Get specific email by ID from Microsoft 365
export const getEmailByMessageId = async (messageId: string) => {
  const response = await API.get(`/email/message/${messageId}`);
  return response.data;
};

// Send email via Microsoft 365 (Graph API)
export const sendMicrosoftEmail = async (emailData: {
  to: string | string[];
  subject: string;
  body: string;
  isHtml?: boolean;
}) => {
  const response = await API.post("/email/send", emailData);
  return response.data;
};

// Mark email as read in Microsoft 365
export const markEmailAsRead = async (messageId: string) => {
  const response = await API.patch(`/email/message/${messageId}/read`);
  return response.data;
};

// Delete email from Microsoft 365
export const deleteEmailByMessageId = async (messageId: string) => {
  const response = await API.delete(`/email/message/${messageId}`);
  return response.data;
};
