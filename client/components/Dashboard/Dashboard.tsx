"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./Dashboard.module.css";

// Mock data - replace with actual data from your backend
const mockGames = [
  {
    id: "1",
    title: "Science Quiz",
    gameCode: "ABC123",
    questions: 5,
    plays: 24,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "History Challenge",
    gameCode: "DEF456",
    questions: 8,
    plays: 12,
    createdAt: "2024-01-10",
  },
  {
    id: "3",
    title: "Math Puzzles",
    gameCode: "GHI789",
    questions: 6,
    plays: 8,
    createdAt: "2024-01-05",
  },
];

const stats = {
  totalGames: 3,
  totalPlays: 44,
  avgQuestions: 6.3,
  favoriteCategory: "Science",
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("games");
  const router = useRouter();

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoSection}>
            <Image
              src="/images/logo.png"
              alt="Pregúntame Logo"
              width={60}
              height={60}
              className={styles.logo}
            />
            <div className={styles.titleSection}>
              <h1 className={styles.title}>DASHBOARD</h1>
              <p className={styles.subtitle}>Game Master Control Panel</p>
            </div>
          </div>
          
          <div className={styles.headerActions}>
            <button 
              onClick={() => router.push("/create")}
              className={styles.createButton}
            >
              + CREATE NEW
            </button>
            <button className={styles.profileButton}>
              👤
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🎮</div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats.totalGames}</div>
              <div className={styles.statLabel}>Total Games</div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats.totalPlays}</div>
              <div className={styles.statLabel}>Total Plays</div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>❓</div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats.avgQuestions}</div>
              <div className={styles.statLabel}>Avg Questions</div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⭐</div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats.favoriteCategory}</div>
              <div className={styles.statLabel}>Top Category</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.tabContainer}>
          <button
            className={`${styles.tab} ${activeTab === "games" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("games")}
          >
            🎯 MY GAMES
          </button>
          <button
            className={`${styles.tab} ${activeTab === "analytics" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            📊 ANALYTICS
          </button>
          <button
            className={`${styles.tab} ${activeTab === "settings" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            ⚙️ SETTINGS
          </button>
        </div>

        {/* Content Area */}
        <div className={styles.contentArea}>
          {activeTab === "games" && (
            <div className={styles.gamesSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>RECENT GAMES</h2>
                <div className={styles.sectionActions}>
                  <button className={styles.filterButton}>FILTER</button>
                  <button className={styles.sortButton}>SORT</button>
                </div>
              </div>

              {/* Games List */}
              <div className={styles.gamesList}>
                {mockGames.map((game) => (
                  <div key={game.id} className={styles.gameCard}>
                    <div className={styles.gameHeader}>
                      <h3 className={styles.gameTitle}>{game.title}</h3>
                      <div className={styles.gameCode}>#{game.gameCode}</div>
                    </div>
                    
                    <div className={styles.gameStats}>
                      <div className={styles.gameStat}>
                        <span className={styles.statIconSmall}>❓</span>
                        {game.questions} Questions
                      </div>
                      <div className={styles.gameStat}>
                        <span className={styles.statIconSmall}>👥</span>
                        {game.plays} Plays
                      </div>
                      <div className={styles.gameStat}>
                        <span className={styles.statIconSmall}>📅</span>
                        {game.createdAt}
                      </div>
                    </div>

                    <div className={styles.gameActions}>
                      <button 
                        onClick={() => router.push(`/play/${game.gameCode}`)}
                        className={styles.playButton}
                      >
                        PLAY
                      </button>
                      <button className={styles.shareButton}>
                        SHARE
                      </button>
                      <button className={styles.editButton}>
                        EDIT
                      </button>
                      <button className={styles.deleteButton}>
                        DELETE
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {mockGames.length === 0 && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🎮</div>
                  <h3 className={styles.emptyTitle}>No Games Yet</h3>
                  <p className={styles.emptyText}>
                    Create your first game to get started!
                  </p>
                  <button 
                    onClick={() => router.push("/create")}
                    className={styles.emptyButton}
                  >
                    CREATE FIRST GAME
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "analytics" && (
            <div className={styles.analyticsSection}>
              <div className={styles.analyticsPlaceholder}>
                <div className={styles.placeholderIcon}>📊</div>
                <h3 className={styles.placeholderTitle}>Analytics Coming Soon</h3>
                <p className={styles.placeholderText}>
                  Detailed game analytics and player insights will be available here.
                </p>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className={styles.settingsSection}>
              <div className={styles.settingsPlaceholder}>
                <div className={styles.placeholderIcon}>⚙️</div>
                <h3 className={styles.placeholderTitle}>Settings</h3>
                <p className={styles.placeholderText}>
                  Account and application settings will be available here.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <span className={styles.footerText}>
            Powered by <strong>Pregúntame</strong>
          </span>
          <span className={styles.footerVersion}>v1.0.0</span>
        </div>
      </footer>
    </div>
  );
}