"use client";
import { useState, useEffect } from "react";
import {
  EnvelopeSimple,
  PaperPlaneTilt,
  FileText,
  ProhibitInset,
  TrendUp,
  Eye,
  CursorClick,
  X,
  Tray,
  XCircle,
  CheckCircle,
} from "@phosphor-icons/react";
import { EmailOverview } from "../../types/email.types";
import { getEmailOverview } from "../../../api/email/actions";
import styles from "./EmailCommunications.module.css";
import TemplateManager from "../TemplateManager/TemplateManager";
import CampaignManager from "../CampaignManager/CampaignManager";
import EmailInbox from "../EmailInbox/EmailInbox";

interface EmailCommunicationsProps {
  show: boolean;
  onClose: () => void;
}

export default function EmailCommunications({ show, onClose }: EmailCommunicationsProps) {
  const [overview, setOverview] = useState<EmailOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "templates" | "campaigns" | "inbox">(
    "overview"
  );

  useEffect(() => {
    if (show) {
      fetchOverview();
      // Auto-refresh stats every 30 seconds when overview is active
      const interval = setInterval(() => {
        if (activeTab === "overview") {
          fetchOverview();
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [show, activeTab]);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const data = await getEmailOverview();
      setOverview(data);
    } catch (error) {
      console.error("Error fetching email overview:", error);
      setOverview({
        overview: {
          totalTemplates: 0,
          totalCampaigns: 0,
          totalSent: 0,
          blacklistCount: 0,
        },
        stats: {
          total: 0,
          sent: 0,
          failed: 0,
          bounced: 0,
          opened: 0,
          clicked: 0,
          openRate: "0.00",
          clickRate: "0.00",
        },
        recentLogs: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <EnvelopeSimple size={28} weight="fill" /> Email Communications
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} weight="bold" />
          </button>
        </div>

        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tab} ${activeTab === "overview" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <TrendUp size={20} weight="fill" />
            Overview
          </button>
          <button
            className={`${styles.tab} ${activeTab === "templates" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("templates")}
          >
            <FileText size={20} weight="fill" />
            Templates
          </button>
          <button
            className={`${styles.tab} ${activeTab === "campaigns" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("campaigns")}
          >
            <PaperPlaneTilt size={20} weight="fill" />
            Campaigns
          </button>
          <button
            className={`${styles.tab} ${activeTab === "inbox" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("inbox")}
          >
            <Tray size={20} weight="fill" />
            Inbox
          </button>
        </div>

        <div className={styles.modalBody}>
          {loading && activeTab === "overview" ? (
            <div className={styles.loading}>Loading...</div>
          ) : (
            <>
              {activeTab === "overview" && overview && (
                <div className={styles.overviewGrid}>
                  {/* Row 1: Main Metrics */}
                  <div className={styles.statCard}>
                    <div
                      className={styles.statIcon}
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))",
                      }}
                    >
                      <FileText size={32} weight="fill" style={{ color: "#3b82f6" }} />
                    </div>
                    <div className={styles.statInfo}>
                      <h3>Templates</h3>
                      <p className={styles.statValue}>{overview.overview.totalTemplates}</p>
                    </div>
                  </div>

                  <div className={styles.statCard}>
                    <div
                      className={styles.statIcon}
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.2))",
                      }}
                    >
                      <PaperPlaneTilt size={32} weight="fill" style={{ color: "#8b5cf6" }} />
                    </div>
                    <div className={styles.statInfo}>
                      <h3>Campaigns</h3>
                      <p className={styles.statValue}>{overview.overview.totalCampaigns}</p>
                    </div>
                  </div>

                  <div className={styles.statCard}>
                    <div
                      className={styles.statIcon}
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))",
                      }}
                    >
                      <EnvelopeSimple size={32} weight="fill" style={{ color: "#10b981" }} />
                    </div>
                    <div className={styles.statInfo}>
                      <h3>Emails Sent</h3>
                      <p className={styles.statValue}>{overview.stats.sent.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Row 2: Engagement Metrics */}
                  <div className={styles.statCard}>
                    <div
                      className={styles.statIcon}
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(2, 132, 199, 0.2))",
                      }}
                    >
                      <Eye size={32} weight="fill" style={{ color: "#0ea5e9" }} />
                    </div>
                    <div className={styles.statInfo}>
                      <h3>Opened</h3>
                      <p className={styles.statValue}>{overview.stats.opened}</p>
                      <p className={styles.statSubValue}>{overview.stats.openRate}% open rate</p>
                    </div>
                  </div>

                  <div className={styles.statCard}>
                    <div
                      className={styles.statIcon}
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(147, 51, 234, 0.2))",
                      }}
                    >
                      <CursorClick size={32} weight="fill" style={{ color: "#a855f7" }} />
                    </div>
                    <div className={styles.statInfo}>
                      <h3>Clicked</h3>
                      <p className={styles.statValue}>{overview.stats.clicked}</p>
                      <p className={styles.statSubValue}>{overview.stats.clickRate}% click rate</p>
                    </div>
                  </div>

                  <div className={styles.statCard}>
                    <div
                      className={styles.statIcon}
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.2))",
                      }}
                    >
                      <CheckCircle size={32} weight="fill" style={{ color: "#22c55e" }} />
                    </div>
                    <div className={styles.statInfo}>
                      <h3>Success Rate</h3>
                      <p className={styles.statValue}>
                        {overview.stats.total > 0
                          ? ((overview.stats.sent / overview.stats.total) * 100).toFixed(1)
                          : "0"}
                        %
                      </p>
                      <p className={styles.statSubValue}>
                        {overview.stats.sent} / {overview.stats.total} delivered
                      </p>
                    </div>
                  </div>

                  {/* Row 3: Issues & Blacklist */}
                  <div className={styles.statCard}>
                    <div
                      className={styles.statIcon}
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))",
                      }}
                    >
                      <XCircle size={32} weight="fill" style={{ color: "#ef4444" }} />
                    </div>
                    <div className={styles.statInfo}>
                      <h3>Failed</h3>
                      <p className={styles.statValue}>{overview.stats.failed}</p>
                      <p className={styles.statSubValue}>Delivery errors</p>
                    </div>
                  </div>

                  <div className={styles.statCard}>
                    <div
                      className={styles.statIcon}
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2))",
                      }}
                    >
                      <ProhibitInset size={32} weight="fill" style={{ color: "#f59e0b" }} />
                    </div>
                    <div className={styles.statInfo}>
                      <h3>Bounced</h3>
                      <p className={styles.statValue}>{overview.stats.bounced}</p>
                      <p className={styles.statSubValue}>Invalid addresses</p>
                    </div>
                  </div>

                  <div className={styles.statCard}>
                    <div
                      className={styles.statIcon}
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(100, 116, 139, 0.2), rgba(71, 85, 105, 0.2))",
                      }}
                    >
                      <ProhibitInset size={32} weight="fill" style={{ color: "#64748b" }} />
                    </div>
                    <div className={styles.statInfo}>
                      <h3>Blacklisted</h3>
                      <p className={styles.statValue}>{overview.overview.blacklistCount}</p>
                      <p className={styles.statSubValue}>Blocked emails</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "templates" && <TemplateManager />}
              {activeTab === "campaigns" && <CampaignManager />}
              {activeTab === "inbox" && <EmailInbox />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
