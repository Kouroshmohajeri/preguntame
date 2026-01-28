"use client";
import { useState, useEffect } from "react";
import { PaperPlaneTilt, Megaphone, X, Flask } from "@phosphor-icons/react";
import {
  getEmailCampaigns,
  sendCustomCampaign,
  sendTestCampaign,
} from "../../../api/email/actions";
import { EmailCampaign } from "../../types/email.types";
import styles from "./CampaignManager.module.css";
import { useToast } from "@/context/ToastContext/ToastContext";

interface CampaignForm {
  subject: string;
  content: string;
  targetAudience: "all" | "verified" | "premium" | "test";
  testEmail?: string;
}

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [sending, setSending] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState<CampaignForm>({
    subject: "",
    content: "",
    targetAudience: "all",
    testEmail: "",
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const data = await getEmailCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };

  const handleSend = async (isTest: boolean = false) => {
    if (!form.subject || !form.content) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    if (isTest && !form.testEmail) {
      showToast("Please enter a test email address", "error");
      return;
    }

    const audienceText = isTest
      ? `TEST EMAIL: ${form.testEmail}`
      : form.targetAudience.toUpperCase();

    const confirmed = confirm(
      `⚠️ ${isTest ? "SEND TEST?" : "SEND CAMPAIGN?"}\n\n` +
        `Target: ${audienceText}\n` +
        `Subject: ${form.subject}\n\n` +
        `Are you sure?`
    );

    if (!confirmed) return;

    setSending(true);
    try {
      if (isTest) {
        // Send test email
        await sendTestCampaign({
          templateType: "announcement",
          subject: form.subject,
          title: form.subject,
          content: form.content,
          testEmail: form.testEmail!,
        });

        showToast(`✅ Test email sent to ${form.testEmail}!`, "success");
      } else {
        // Send bulk campaign
        const result = await sendCustomCampaign({
          templateType: "announcement",
          subject: form.subject,
          title: form.subject,
          content: form.content,
          targetAudience: form.targetAudience as "all" | "verified" | "premium",
        });

        showToast(
          `✅ Campaign sent!\nSent: ${result.sentCount}/${result.totalRecipients}`,
          "success"
        );

        setForm({
          subject: "",
          content: "",
          targetAudience: "all",
          testEmail: "",
        });
        setShowComposer(false);
      }
    } catch (error) {
      console.error("Failed to send:", error);
      showToast("❌ Failed to send", "error");
    } finally {
      setSending(false);
    }
  };

  if (!showComposer) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>📢 Campaign Management</h2>
          <p>Create and send email campaigns to your users</p>
        </div>

        <button className={styles.createBtn} onClick={() => setShowComposer(true)}>
          <PaperPlaneTilt size={24} weight="fill" />
          Create New Campaign
        </button>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay} onClick={() => setShowComposer(false)}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>
            <Megaphone size={28} weight="fill" />
            Create Campaign
          </h2>
          <button onClick={() => setShowComposer(false)} className={styles.closeButton}>
            <X size={24} weight="bold" />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Target Audience */}
          <div className={styles.formGroup}>
            <label>Send To *</label>
            <select
              value={form.targetAudience}
              onChange={(e) => setForm({ ...form, targetAudience: e.target.value as any })}
            >
              <option value="all">All Users</option>
              <option value="verified">Verified Users Only</option>
              <option value="premium">AI Users (Premium)</option>
            </select>
          </div>

          {/* Test Email */}
          <div className={styles.formGroup}>
            <label>
              <Flask size={18} weight="fill" /> Test Email (optional)
            </label>
            <input
              type="email"
              value={form.testEmail}
              onChange={(e) => setForm({ ...form, testEmail: e.target.value })}
              placeholder="your.email@example.com"
            />
            <small>Send a test to this email before sending to everyone</small>
          </div>

          {/* Subject */}
          <div className={styles.formGroup}>
            <label>Email Subject *</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="🚀 Exciting news about Pregúntame..."
            />
          </div>

          {/* Content */}
          <div className={styles.formGroup}>
            <label>Email Content * (HTML supported)</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write your message here. You can use HTML tags like <strong>, <em>, <a>, <ul>, <li>, etc."
              rows={15}
            />
            <small>
              💡 Tip: Use HTML for formatting. Example: &lt;strong&gt;bold&lt;/strong&gt;,
              &lt;ul&gt;&lt;li&gt;list&lt;/li&gt;&lt;/ul&gt;
            </small>
          </div>

          {/* Actions */}
          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={() => setShowComposer(false)}
              className={styles.cancelBtn}
            >
              Cancel
            </button>

            {form.testEmail && (
              <button
                type="button"
                onClick={() => handleSend(true)}
                className={styles.testBtn}
                disabled={sending}
              >
                {sending ? (
                  <>
                    <div className={styles.spinner} />
                    Sending Test...
                  </>
                ) : (
                  <>
                    <Flask size={20} weight="fill" />
                    Send Test
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSend(false)}
              className={styles.sendBtn}
              disabled={sending}
            >
              {sending ? (
                <>
                  <div className={styles.spinner} />
                  Sending...
                </>
              ) : (
                <>
                  <PaperPlaneTilt size={20} weight="fill" />
                  Send Campaign
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
