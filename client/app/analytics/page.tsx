"use client";
import { useState, useEffect } from "react";
import styles from "./analytics.module.css";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface AnalyticsData {
  totalUsers: number;
  totalGames: number;
  totalGameResults: number;
  usersThisWeek: number;
  usersToday: number;
}

interface VercelAnalytics {
  activeUsers: number;
  topCountry: string;
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [mongoData, setMongoData] = useState<AnalyticsData | null>(null);
  const [vercelData, setVercelData] = useState<VercelAnalytics | null>(null);

  // Verify 2FA token
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/analytics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error("Invalid token");
      }

      const data = await response.json();
      setMongoData(data);
      setIsAuthenticated(true);

      // Fetch Vercel analytics (client-side)
      fetchVercelAnalytics();
    } catch (err) {
      setError("Invalid authentication code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Vercel Analytics (if you have the bearer token)
  const fetchVercelAnalytics = async () => {
    // Note: This requires Vercel bearer token from cookies
    // For now, we'll show placeholder data
    // You'd need to implement the undocumented API call here
    setVercelData({
      activeUsers: 0,
      topCountry: "N/A",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.authBox}>
          <h1 className={styles.title}>🔒 Analytics Access</h1>
          <p className={styles.subtitle}>Enter your Google Authenticator code</p>

          <form onSubmit={handleVerify} className={styles.form}>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className={styles.input}
              maxLength={6}
              autoFocus
            />

            {error && <p className={styles.error}>{error}</p>}

            <button
              type="submit"
              disabled={loading || token.length !== 6}
              className={styles.submitButton}
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>📊 Analytics Dashboard</h1>
        <button onClick={() => router.push("/")} className={styles.backButton}>
          ← Back to Home
        </button>
      </div>

      <div className={styles.grid}>
        {/* MongoDB Stats */}
        <div className={styles.card}>
          <div className={styles.cardIcon}>👥</div>
          <h3 className={styles.cardTitle}>Total Members</h3>
          <p className={styles.cardValue}>{mongoData?.totalUsers.toLocaleString()}</p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>🎮</div>
          <h3 className={styles.cardTitle}>Games Created</h3>
          <p className={styles.cardValue}>{mongoData?.totalGames.toLocaleString()}</p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>📈</div>
          <h3 className={styles.cardTitle}>Game Results</h3>
          <p className={styles.cardValue}>{mongoData?.totalGameResults.toLocaleString()}</p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>📅</div>
          <h3 className={styles.cardTitle}>Users Today</h3>
          <p className={styles.cardValue}>{mongoData?.usersToday.toLocaleString()}</p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>📆</div>
          <h3 className={styles.cardTitle}>Users This Week</h3>
          <p className={styles.cardValue}>{mongoData?.usersThisWeek.toLocaleString()}</p>
        </div>

        {/* Vercel Analytics - Placeholder */}
        <div className={styles.card}>
          <div className={styles.cardIcon}>🌍</div>
          <h3 className={styles.cardTitle}>Top Country</h3>
          <p className={styles.cardValue}>{vercelData?.topCountry || "N/A"}</p>
          <p className={styles.cardNote}>Requires Vercel API setup</p>
        </div>
      </div>
    </div>
  );
}
