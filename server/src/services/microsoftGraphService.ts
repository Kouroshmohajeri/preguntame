import { Client } from "@microsoft/microsoft-graph-client";
import { ClientSecretCredential } from "@azure/identity";

const tenantId = process.env.MICROSOFT_TENANT_ID;
const clientId = process.env.MICROSOFT_CLIENT_ID;
const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
const userEmail = process.env.MICROSOFT_USER_EMAIL;

// Type definitions
interface EmailRecipient {
  address: string;
}

interface SendEmailParams {
  to: string | string[];
  subject: string;
  body: string;
  isHtml?: boolean;
}

interface EmailMessage {
  id: string;
  subject: string;
  from: {
    emailAddress: EmailRecipient;
  };
  receivedDateTime: string;
  isRead: boolean;
  bodyPreview: string;
  body: {
    contentType: string;
    content: string;
  };
}

// Validate required environment variables
if (!tenantId || !clientId || !clientSecret || !userEmail) {
  throw new Error(
    "Missing required environment variables: MICROSOFT_TENANT_ID, MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, or MICROSOFT_USER_EMAIL",
  );
}

// Initialize the credential
const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

// Create Graph client
const getGraphClient = () => {
  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => {
        const tokenResponse = await credential.getToken([
          "https://graph.microsoft.com/.default",
        ]);
        return tokenResponse.token;
      },
    },
  });
};

// Get emails from inbox
export const getEmails = async (
  folderId: string = "inbox",
  limit: number = 50,
): Promise<EmailMessage[]> => {
  const client = getGraphClient();

  try {
    const messages = await client
      .api(`/users/${userEmail}/mailFolders/${folderId}/messages`)
      .top(limit)
      .select("id,subject,from,receivedDateTime,isRead,bodyPreview,body")
      .orderby("receivedDateTime DESC")
      .get();

    return messages.value;
  } catch (error) {
    console.error("Error fetching emails:", error);
    throw error;
  }
};

// Get sent emails
export const getSentEmails = async (
  limit: number = 50,
): Promise<EmailMessage[]> => {
  return getEmails("sentitems", limit);
};

// Send email - FIXED VERSION
export const sendEmail = async ({
  to,
  subject,
  body,
  isHtml = true,
}: SendEmailParams): Promise<{ success: boolean }> => {
  const client = getGraphClient();

  const message = {
    message: {
      subject: subject,
      body: {
        contentType: isHtml ? "HTML" : "Text",
        content: body,
      },
      toRecipients: Array.isArray(to)
        ? to.map((email) => ({ emailAddress: { address: email } }))
        : [{ emailAddress: { address: to } }],
    },
    saveToSentItems: true,
  };

  try {
    // ✅ FIXED: Use /users/{email}/sendMail for application permissions
    await client.api(`/users/${userEmail}/sendMail`).post(message);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// Get specific email
export const getEmailById = async (
  messageId: string,
): Promise<EmailMessage> => {
  const client = getGraphClient();

  try {
    const message = await client
      .api(`/users/${userEmail}/messages/${messageId}`)
      .get();

    return message;
  } catch (error) {
    console.error("Error fetching email:", error);
    throw error;
  }
};

// Mark email as read
export const markAsRead = async (
  messageId: string,
): Promise<{ success: boolean }> => {
  const client = getGraphClient();

  try {
    await client
      .api(`/users/${userEmail}/messages/${messageId}`)
      .patch({ isRead: true });

    return { success: true };
  } catch (error) {
    console.error("Error marking email as read:", error);
    throw error;
  }
};

// Delete email
export const deleteEmail = async (
  messageId: string,
): Promise<{ success: boolean }> => {
  const client = getGraphClient();

  try {
    await client.api(`/users/${userEmail}/messages/${messageId}`).delete();

    return { success: true };
  } catch (error) {
    console.error("Error deleting email:", error);
    throw error;
  }
};

export default {
  getEmails,
  getSentEmails,
  sendEmail,
  getEmailById,
  markAsRead,
  deleteEmail,
};
