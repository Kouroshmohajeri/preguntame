"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import styles from "./Dashboard.module.css";
import {
  Joystick,
  Users,
  QuestionMark,
  PersonSimpleRun,
  Gear,
  CalendarHeart,
  Coin,
  Envelope,
  Shield,
  Clock,
  Trophy,
} from "@phosphor-icons/react";
import { getUser } from "@/app/api/users/actions";
import { deleteGame, getGamesByHost } from "@/app/api/game/actions";
import { deleteGameResult, getGameResult } from "@/app/api/gameResult/actions";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import ShareModal from "../ShareModal/ShareModal";

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

// User data structure based on your MongoDB document
interface UserData {
  _id: string;
  name: string;
  lastname: string;
  avatar: string;
  email: string;
  points: number;
  credits: number;
  gamesCreated: number;
  gamesPlayed: number;
  correctAnswers: number;
  wrongAnswers: number;
  rank: number;
  topCategory: string;
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("games");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<any[]>([]);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    gameCode: string;
    gameTitle: string;
  }>({
    isOpen: false,
    gameCode: "",
    gameTitle: "",
  });
  const [shareModal, setShareModal] = useState<{
    isOpen: boolean;
    gameCode: string;
    gameTitle: string;
  }>({
    isOpen: false,
    gameCode: "",
    gameTitle: "",
  });

  // Fetch user data when session is available
  useEffect(() => {
    if (status === "loading") return; // ⛔ wait until NextAuth is ready

    const fetchUserData = async () => {
      if (!session?.user?.email) {
        console.warn("No user email found in session (probably logged out)");
        setLoading(false);
        return;
      }

      try {
        const userData = await getUser(session.user.email);
        setUserData(userData || null);
        if (userData?._id) {
          const fetchedGames = await getGamesByHost(userData._id);
          setGames(fetchedGames);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session, status]);
  const handleDeleteGame = async (gameCode: string) => {
    try {
      await deleteGame(gameCode);
      // Remove the game from local state
      setGames((prev) => prev.filter((game) => game.gameCode !== gameCode));
      setDeleteModal({ isOpen: false, gameCode: "", gameTitle: "" });
    } catch (error) {
      console.error("Error deleting game:", error);
      alert("Failed to delete game. Please try again.");
    }
  };
  const stats = {
    totalGames: userData?.gamesCreated || 0,
    totalPlays: userData?.gamesPlayed || 0,
    credits: userData?.credits || 0,
    points: userData?.points || 0,
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <div className={styles.loadingText}>LOADING DASHBOARD...</div>
        </div>
      </div>
    );
  }

  // Remove the session check here since parent handles it
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
              <p className={styles.subtitle}>Player Control Panel</p>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button onClick={() => router.push("/create")} className={styles.createButton}>
              + CREATE NEW
            </button>
            <div className={styles.userInfo}>
              {userData && (
                <div className={styles.avatarContainer}>
                  <Image
                    src={userData.avatar}
                    alt="User Avatar"
                    width={55}
                    height={55}
                    className={styles.avatar}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Rest of your component remains the same */}
      <main className={styles.main}>
        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <Joystick size={32} className={styles.statIcon} color="#FE6A6B" />
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats.totalGames}</div>
              <div className={styles.statLabel}>Games Created</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <Users size={32} className={styles.statIcon} color="#1588B0" />
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats.totalPlays}</div>
              <div className={styles.statLabel}>Games Played</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <Trophy size={32} className={styles.statIcon} color="#FED065" />
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats.points}</div>
              <div className={styles.statLabel}>Score</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <Coin size={32} className={styles.statIcon} color="#4DCDC4" />
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats.credits}</div>
              <div className={styles.statLabel}>Credits</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.tabContainer}>
          <button
            className={`${styles.tab} ${activeTab === "games" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("games")}
          >
            <PersonSimpleRun size={24} /> MY GAMES
          </button>
          <button
            className={`${styles.tab} ${activeTab === "settings" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <Gear size={24} /> PROFILE & SETTINGS
          </button>
        </div>

        {/* Content Area */}
        <div className={styles.contentArea}>
          {activeTab === "games" && (
            <div className={styles.gamesSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>MY GAMES</h2>
                <div className={styles.sectionActions}>
                  <button className={styles.filterButton}>FILTER</button>
                  <button className={styles.sortButton}>SORT</button>
                </div>
              </div>

              {/* Games List */}
              <div className={styles.gamesList}>
                {games.map((game) => (
                  <div key={game._id} className={styles.gameCard}>
                    <div className={styles.gameHeader}>
                      <h3 className={styles.gameTitle}>{game.title}</h3>
                      <div className={styles.gameCode}>#{game.gameCode}</div>
                    </div>

                    <div className={styles.gameStats}>
                      <div className={styles.gameStat}>
                        <QuestionMark size={20} className={styles.statIconSmall} />
                        {game.questions.length} Question{game.questions.length !== 1 ? "s" : ""}
                      </div>

                      <div className={styles.gameStat}>
                        <CalendarHeart size={20} className={styles.statIconSmall} />
                        {new Date(game.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className={styles.gameActions}>
                      <button
                        onClick={async () => {
                          try {
                            const existing = await getGameResult(game.gameCode);

                            if (existing?._id) {
                              await deleteGameResult(game.gameCode);
                            }
                          } catch (e) {
                            // ignore 404
                          }

                          router.push(`/play/host/${game.gameCode}`);
                        }}
                        className={styles.playButton}
                      >
                        HOST
                      </button>

                      <button
                        onClick={() =>
                          setShareModal({
                            isOpen: true,
                            gameCode: game.gameCode,
                            gameTitle: game.title,
                          })
                        }
                        className={styles.shareButton}
                      >
                        SHARE
                      </button>
                      <button
                        className={styles.editButton}
                        onClick={() => {
                          router.push(`edit/${game.gameCode}`);
                        }}
                      >
                        EDIT
                      </button>
                      <button
                        onClick={() =>
                          setDeleteModal({
                            isOpen: true,
                            gameCode: game.gameCode,
                            gameTitle: game.title,
                          })
                        }
                        className={styles.deleteButton}
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {games.length === 0 && (
                <div className={styles.emptyState}>
                  <Joystick size={50} className={styles.emptyIcon} />
                  <h3 className={styles.emptyTitle}>No Games Yet</h3>
                  <p className={styles.emptyText}>Create your first game to get started!</p>
                  <button onClick={() => router.push("/create")} className={styles.emptyButton}>
                    CREATE FIRST GAME
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && userData && (
            <div className={styles.settingsSection}>
              <div className={styles.settingsHeader}>
                <h2 className={styles.settingsTitle}>PROFILE SETTINGS</h2>
              </div>

              <div className={styles.settingsGrid}>
                {/* Profile Card */}
                <div className={styles.profileCard}>
                  <div className={styles.profileHeader}>
                    <div className={styles.avatarLargeContainer}>
                      <Image
                        src={userData.avatar}
                        alt="User Avatar"
                        width={120}
                        height={120}
                        className={styles.avatarLarge}
                      />
                    </div>
                    <div className={styles.profileInfo}>
                      <h3 className={styles.profileName}>
                        {userData.name} {userData.lastname}
                      </h3>
                      <div className={styles.profileDetail}>
                        <Envelope size={18} />
                        <span>{userData.email}</span>
                      </div>
                      <div className={styles.profileDetail}>
                        <Clock size={18} />
                        <span>
                          Member since {new Date(userData.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Privacy Card */}
                <div className={styles.privacyCard}>
                  <h3 className={styles.privacyTitle}>
                    <Shield size={24} />
                    PRIVACY SETTINGS
                  </h3>
                  <div className={styles.privacyOptions}>
                    <div className={styles.privacyOption}>
                      <div className={styles.optionInfo}>
                        <h4>Profile Visibility</h4>
                        <p>Control who can see your profile</p>
                      </div>
                      <select className={styles.privacySelect}>
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                    </div>

                    <div className={styles.privacyOption}>
                      <div className={styles.optionInfo}>
                        <h4>Game Statistics</h4>
                        <p>Show your game stats to others</p>
                      </div>
                      <label className={styles.toggle}>
                        <input type="checkbox" defaultChecked />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>

                    <div className={styles.privacyOption}>
                      <div className={styles.optionInfo}>
                        <h4>Email Notifications</h4>
                        <p>Receive updates and announcements</p>
                      </div>
                      <label className={styles.toggle}>
                        <input type="checkbox" defaultChecked />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, gameCode: "", gameTitle: "" })}
        onConfirm={() => handleDeleteGame(deleteModal.gameCode)}
        title="DELETE GAME"
        message={`Are you sure you want to delete "${deleteModal.gameTitle}"? This action cannot be undone.`}
        confirmText="DELETE"
        type="danger"
      />
      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, gameCode: "", gameTitle: "" })}
        gameCode={shareModal.gameCode}
        gameTitle={shareModal.gameTitle}
      />
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
