"use client";
import {
  ChartBar,
  Users,
  GameController,
  TrendUp,
  Calendar,
  CalendarCheck,
  Globe,
  EnvelopeSimple,
  Robot,
} from "@phosphor-icons/react";
import { AnalyticsData, VercelAnalytics } from "../../types/analytics.types";
import RefreshButton from "../RefreshButton/RefreshButton";
import styles from "./DashboardStats.module.css";

interface DashboardStatsProps {
  mongoData: AnalyticsData | null;
  vercelData: VercelAnalytics | null;
  onUsersClick: () => void;
  onGamesCreatedClick: () => void;
  onGamesClick: () => void;
  onEmailClick: () => void;
  onBetaAccessClick: () => void; // ADDED THIS
  onRefresh: () => Promise<void>;
}

export default function DashboardStats({
  mongoData,
  vercelData,
  onUsersClick,
  onGamesCreatedClick,
  onGamesClick,
  onEmailClick,
  onBetaAccessClick, // ADDED THIS
  onRefresh,
}: DashboardStatsProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <ChartBar size={32} weight="fill" /> Analytics Dashboard
        </h1>
        <RefreshButton onRefresh={onRefresh} />
      </div>

      <div className={styles.grid}>
        <div className={styles.card} onClick={onUsersClick}>
          <div className={styles.cardIcon}>
            <Users size={48} weight="fill" />
          </div>
          <h3 className={styles.cardTitle}>Total Members</h3>
          <p className={styles.cardValue}>{mongoData?.totalUsers.toLocaleString()}</p>
          <p className={styles.cardNote}>Click to view details</p>
        </div>

        <div className={styles.card} onClick={onGamesCreatedClick}>
          <div className={styles.cardIcon}>
            <GameController size={48} weight="fill" />
          </div>
          <h3 className={styles.cardTitle}>Games Created</h3>
          <p className={styles.cardValue}>{mongoData?.totalGames.toLocaleString()}</p>
          <p className={styles.cardNote}>Click to view details</p>
        </div>

        <div className={styles.card} onClick={onGamesClick}>
          <div className={styles.cardIcon}>
            <TrendUp size={48} weight="fill" />
          </div>
          <h3 className={styles.cardTitle}>Game Results</h3>
          <p className={styles.cardValue}>{mongoData?.totalGameResults.toLocaleString()}</p>
          <p className={styles.cardNote}>Click to view details</p>
        </div>

        <div className={styles.card} onClick={onEmailClick}>
          <div className={styles.cardIcon}>
            <EnvelopeSimple size={48} weight="fill" />
          </div>
          <h3 className={styles.cardTitle}>Email Communications</h3>
          <p className={styles.cardValue}>
            <EnvelopeSimple size={32} weight="fill" />
          </p>
          <p className={styles.cardNote}>Click to manage emails</p>
        </div>

        {/* NEW BETA ACCESS CARD */}
        <div className={styles.card} onClick={onBetaAccessClick}>
          <div className={styles.cardIcon}>
            <Robot size={48} weight="fill" />
          </div>
          <h3 className={styles.cardTitle}>Beta Access Requests</h3>
          <p className={styles.cardValue}>
            <Robot size={32} weight="fill" />
          </p>
          <p className={styles.cardNote}>Click to manage requests</p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <Calendar size={48} weight="fill" />
          </div>
          <h3 className={styles.cardTitle}>Users Today</h3>
          <p className={styles.cardValue}>{mongoData?.usersToday.toLocaleString()}</p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <CalendarCheck size={48} weight="fill" />
          </div>
          <h3 className={styles.cardTitle}>Users This Week</h3>
          <p className={styles.cardValue}>{mongoData?.usersThisWeek.toLocaleString()}</p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <Globe size={48} weight="fill" />
          </div>
          <h3 className={styles.cardTitle}>Top Country</h3>
          <p className={styles.cardValue}>{vercelData?.topCountry || "N/A"}</p>
          <p className={styles.cardNote}>Requires Vercel API setup</p>
        </div>
      </div>
    </div>
  );
}
