"use client";
import { useState, useEffect } from "react";
import {
  PaperPlaneTilt,
  Plus,
  Play,
  Pause,
  Trash,
  ChartBar,
  Users,
  EnvelopeSimple,
  Eye,
  CursorClick,
  X,
  CalendarBlank,
  FunnelSimple,
} from "@phosphor-icons/react";
import {
  getEmailCampaigns,
  createEmailCampaign,
  sendEmailCampaign,
  getCampaignStatistics,
  getEmailTemplates,
} from "../../../api/email/actions";
import { EmailCampaign, EmailTemplate } from "../../types/email.types";
import styles from "./CampaignManager.module.css";

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campaignsData, templatesData] = await Promise.all([
        getEmailCampaigns(),
        getEmailTemplates(),
      ]);
      setCampaigns(campaignsData);
      setTemplates(templatesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async (campaign: EmailCampaign) => {
    if (!confirm(`Send campaign "${campaign.name}" now?`)) return;

    try {
      const template = templates.find((t) => t.htmlContent === campaign.template);
      await sendEmailCampaign(campaign._id, template?._id || "");
      await fetchData();
    } catch (error) {
      console.error("Error sending campaign:", error);
      alert("Failed to send campaign");
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: "#94a3b8",
      scheduled: "#f59e0b",
      sending: "#0ea5e9",
      sent: "#10b981",
      failed: "#ef4444",
    };
    return colors[status as keyof typeof colors] || "#64748b";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Pause size={16} weight="fill" />;
      case "scheduled":
        return <CalendarBlank size={16} weight="fill" />;
      case "sending":
        return <PaperPlaneTilt size={16} weight="fill" />;
      case "sent":
        return <EnvelopeSimple size={16} weight="fill" />;
      case "failed":
        return <X size={16} weight="fill" />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Email Campaigns</h2>
        <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
          <Plus size={20} weight="bold" />
          Create Campaign
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading campaigns...</div>
      ) : campaigns.length === 0 ? (
        <div className={styles.empty}>
          <PaperPlaneTilt size={64} weight="duotone" />
          <h3>No campaigns yet</h3>
          <p>Create your first email campaign to reach your users</p>
        </div>
      ) : (
        <div className={styles.campaignList}>
          {campaigns.map((campaign) => (
            <div key={campaign._id} className={styles.campaignCard}>
              <div className={styles.cardHeader}>
                <div className={styles.campaignInfo}>
                  <h3>{campaign.name}</h3>
                  <p>{campaign.subject}</p>
                </div>
                <div
                  className={styles.statusBadge}
                  style={{ backgroundColor: getStatusColor(campaign.status) }}
                >
                  {getStatusIcon(campaign.status)}
                  {campaign.status}
                </div>
              </div>

              <div className={styles.campaignStats}>
                <div className={styles.stat}>
                  <Users size={20} weight="fill" />
                  <span>{campaign.stats.total.toLocaleString()}</span>
                  <small>Recipients</small>
                </div>
                <div className={styles.stat}>
                  <EnvelopeSimple size={20} weight="fill" />
                  <span>{campaign.stats.sent.toLocaleString()}</span>
                  <small>Sent</small>
                </div>
                <div className={styles.stat}>
                  <Eye size={20} weight="fill" />
                  <span>{campaign.stats.opened.toLocaleString()}</span>
                  <small>Opened</small>
                </div>
                <div className={styles.stat}>
                  <CursorClick size={20} weight="fill" />
                  <span>{campaign.stats.clicked.toLocaleString()}</span>
                  <small>Clicked</small>
                </div>
              </div>

              <div className={styles.cardActions}>
                {campaign.status === "draft" && (
                  <button className={styles.actionBtn} onClick={() => handleSendCampaign(campaign)}>
                    <Play size={18} weight="fill" />
                    Send Now
                  </button>
                )}
                {campaign.status === "sent" && (
                  <button
                    className={styles.actionBtn}
                    onClick={() => setSelectedCampaign(campaign)}
                  >
                    <ChartBar size={18} weight="fill" />
                    View Stats
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateCampaignModal
          templates={templates}
          onClose={() => setShowCreateModal(false)}
          onSave={(campaign) => {
            setCampaigns([campaign, ...campaigns]);
            setShowCreateModal(false);
          }}
        />
      )}

      {selectedCampaign && (
        <CampaignStatsModal campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} />
      )}
    </div>
  );
}

// Create Campaign Modal
function CreateCampaignModal({
  templates,
  onClose,
  onSave,
}: {
  templates: EmailTemplate[];
  onClose: () => void;
  onSave: (campaign: EmailCampaign) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    templateId: "",
    recipientFilter: {
      all: true,
      emailNotifications: false,
      hasSubscription: false,
      customEmails: [] as string[],
    },
    scheduledFor: "",
  });
  const [customEmailInput, setCustomEmailInput] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const campaign = await createEmailCampaign(formData);
      onSave(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("Failed to create campaign");
    } finally {
      setSaving(false);
    }
  };

  const addCustomEmails = () => {
    const emails = customEmailInput
      .split(/[,\n]/)
      .map((e) => e.trim())
      .filter((e) => e.includes("@"));

    setFormData({
      ...formData,
      recipientFilter: {
        ...formData.recipientFilter,
        customEmails: [...formData.recipientFilter.customEmails, ...emails],
      },
    });
    setCustomEmailInput("");
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Create Email Campaign</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={24} weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Campaign Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Summer Sale 2026"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Subject Line *</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              placeholder="e.g., Don't miss our summer deals!"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Email Template *</label>
            <select
              value={formData.templateId}
              onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
              required
            >
              <option value="">Select a template</option>
              {templates.map((template) => (
                <option key={template._id} value={template._id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>
              <FunnelSimple size={18} weight="fill" /> Recipients
            </label>
            <div className={styles.checkboxGroup}>
              <label>
                <input
                  type="checkbox"
                  checked={formData.recipientFilter.all}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recipientFilter: { ...formData.recipientFilter, all: e.target.checked },
                    })
                  }
                />
                All users
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={formData.recipientFilter.emailNotifications}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recipientFilter: {
                        ...formData.recipientFilter,
                        emailNotifications: e.target.checked,
                      },
                    })
                  }
                />
                Users with email notifications enabled
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={formData.recipientFilter.hasSubscription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recipientFilter: {
                        ...formData.recipientFilter,
                        hasSubscription: e.target.checked,
                      },
                    })
                  }
                />
                Subscribers only
              </label>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Custom Email List (optional)</label>
            <textarea
              value={customEmailInput}
              onChange={(e) => setCustomEmailInput(e.target.value)}
              placeholder="Enter emails separated by commas or new lines"
              rows={3}
            />
            <button
              type="button"
              onClick={addCustomEmails}
              className={styles.addEmailsBtn}
              disabled={!customEmailInput.trim()}
            >
              Add Emails
            </button>
            {formData.recipientFilter.customEmails.length > 0 && (
              <p className={styles.emailCount}>
                {formData.recipientFilter.customEmails.length} custom emails added
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Schedule For (optional)</label>
            <input
              type="datetime-local"
              value={formData.scheduledFor}
              onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
            />
            <small>Leave empty to save as draft</small>
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? "Creating..." : "Create Campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Campaign Stats Modal
function CampaignStatsModal({
  campaign,
  onClose,
}: {
  campaign: EmailCampaign;
  onClose: () => void;
}) {
  const openRate =
    campaign.stats.sent > 0
      ? ((campaign.stats.opened / campaign.stats.sent) * 100).toFixed(2)
      : "0.00";
  const clickRate =
    campaign.stats.sent > 0
      ? ((campaign.stats.clicked / campaign.stats.sent) * 100).toFixed(2)
      : "0.00";

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.statsModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Campaign Statistics</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={24} weight="bold" />
          </button>
        </div>

        <div className={styles.statsContent}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <Users size={32} weight="fill" />
              <h3>{campaign.stats.total.toLocaleString()}</h3>
              <p>Total Recipients</p>
            </div>
            <div className={styles.statCard}>
              <EnvelopeSimple size={32} weight="fill" />
              <h3>{campaign.stats.sent.toLocaleString()}</h3>
              <p>Emails Sent</p>
            </div>
            <div className={styles.statCard}>
              <Eye size={32} weight="fill" />
              <h3>{openRate}%</h3>
              <p>Open Rate</p>
            </div>
            <div className={styles.statCard}>
              <CursorClick size={32} weight="fill" />
              <h3>{clickRate}%</h3>
              <p>Click Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
