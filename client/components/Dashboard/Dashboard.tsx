"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
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
  SignOut,
  Bell,
  CheckCircle,
  XCircle,
  Star,
  Fire,
  Crown,
  Target,
  Check,
  X,
  Funnel,
  ArrowsDownUp,
  CaretDown,
  CaretUp,
  X as XIcon,
} from "@phosphor-icons/react";
import { decrementGamesCreated, getUser, incrementGameCloned } from "@/app/api/users/actions";
import { deleteGame, getGame, getGamesByHost, cloneGame } from "@/app/api/game/actions";
import { deleteGameResult, getGameResult } from "@/app/api/gameResult/actions";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import ShareModal from "../ShareModal/ShareModal";
import LoadingDashboard from "./LoadingDashboard/LoadingDashboard";
import { useToast } from "@/context/ToastContext/ToastContext";
import { exportGameToPdf } from "@/utils/exportGameToPdf";
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
  createNotification,
} from "@/app/api/notifications/actions";

// Update the UserData interface
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
  gameGotCloned?: number;
  emailNotifications?: boolean;
}

// Updated Notification type based on your API response
interface Notification {
  _id: string;
  userId: string;
  senderId: string;
  type: "achievement" | "game" | "social" | "system";
  title: string;
  message: string;
  data?: {
    gameCode?: string;
    gameTitle?: string;
    [key: string]: any;
  };
  read: boolean;
  createdAt: string;
  __v?: number;
}

// Game interface based on your MongoDB document
interface Game {
  _id: string;
  title: string;
  gameCode: string;
  hostId: string;
  questions: Array<{
    text: string;
    answers: Array<{
      text: string;
      correct: boolean;
      _id: string;
    }>;
    order: number;
    time: number;
    _id: string;
  }>;
  createdAt: string;
  __v: number;
}

// Filter options
type FilterType = "all" | "recent" | "oldest" | "manyQuestions" | "fewQuestions";
type SortType = "title" | "date" | "questions" | "code";

// Helper function to get icon and color based on notification type
const getNotificationConfig = (notification: Notification) => {
  switch (notification.type) {
    case "game":
      return {
        icon: "target",
        color: "#4ECDC4", // Teal for game notifications
        badgeColor: "#4ECDC4",
      };
    case "achievement":
      return {
        icon: "trophy",
        color: "#FFD166", // Yellow for achievements
        badgeColor: "#FFD166",
      };
    case "social":
      return {
        icon: "users",
        color: "#118AB2", // Blue for social
        badgeColor: "#118AB2",
      };
    case "system":
      return {
        icon: "bell",
        color: "#6A4C93", // Purple for system
        badgeColor: "#6A4C93",
      };
    default:
      return {
        icon: "bell",
        color: "#999",
        badgeColor: "#999",
      };
  }
};

// Helper function to format time ago
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("games");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationList, setNotificationList] = useState<Notification[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();
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
    email: string;
  }>({
    isOpen: false,
    gameCode: "",
    gameTitle: "",
    email: "",
  });

  // Filter and Sort States
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [activeSort, setActiveSort] = useState<SortType>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");

  const [unreadCount, setUnreadCount] = useState(0);

  // Calculate unread notifications
  useEffect(() => {
    const count = notificationList.filter((n) => !n.read).length;
    setUnreadCount(count);
  }, [notificationList]);
  // Update the fetchUserData useEffect or add this:
  useEffect(() => {
    if (userData?.emailNotifications !== undefined) {
      setEmailNotifications(userData.emailNotifications);
    }
  }, [userData]);
  // Fetch user data when session is available
  useEffect(() => {
    if (status === "loading") return;

    const fetchUserData = async () => {
      if (!session?.user?.email) {
        console.warn("No user email found in session");
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
        if (userData?._id) {
          const notif = await getUserNotifications(userData._id);
          setNotificationList(notif || []);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session, status]);

  // Filter and sort games
  const filteredAndSortedGames = useMemo(() => {
    let filteredGames = [...games];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredGames = filteredGames.filter(
        (game) =>
          game.title.toLowerCase().includes(query) || game.gameCode.toLowerCase().includes(query)
      );
    }

    // Apply category filters
    switch (activeFilter) {
      case "recent":
        filteredGames = filteredGames.filter(
          (game) => new Date(game.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
        break;
      case "oldest":
        filteredGames = filteredGames.filter(
          (game) => new Date(game.createdAt) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );
        break;
      case "manyQuestions":
        filteredGames = filteredGames.filter((game) => game.questions.length > 5);
        break;
      case "fewQuestions":
        filteredGames = filteredGames.filter((game) => game.questions.length <= 5);
        break;
      case "all":
      default:
        // No additional filtering
        break;
    }

    // Apply sorting
    filteredGames.sort((a, b) => {
      let comparison = 0;

      switch (activeSort) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "date":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "questions":
          comparison = a.questions.length - b.questions.length;
          break;
        case "code":
          comparison = a.gameCode.localeCompare(b.gameCode);
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filteredGames;
  }, [games, activeFilter, activeSort, sortDirection, searchQuery]);

  const handleDeleteGame = async (gameCode: string) => {
    try {
      // Delete the game
      await deleteGame(gameCode);

      // Remove the game from local state
      setGames((prev) => prev.filter((game) => game.gameCode !== gameCode));
      setDeleteModal({ isOpen: false, gameCode: "", gameTitle: "" });

      // Decrement gamesCreated for the current user (API call)
      if (userData?._id) {
        await decrementGamesCreated(userData._id, 1);

        // Update local state immediately
        setUserData((prev) =>
          prev ? { ...prev, gamesCreated: Math.max((prev.gamesCreated || 1) - 1, 0) } : prev
        );
      }

      // Show success toast
      showToast("Game deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting game:", error);
      showToast("Failed to delete game, try again!", "error");
    }
  };

  const stats = {
    totalGames: userData?.gamesCreated || 0,
    totalPlays: userData?.gamesPlayed || 0,
    credits: userData?.credits || 0,
    points: (userData?.gameGotCloned || 0) * 150,
  };

  // Update your handleExportGame function in Dashboard.tsx
  const handleExportGame = async (gameCode: string, gameTitle: string) => {
    try {
      const game = await getGame(gameCode);

      // Create the exportable game object
      const exportableGame = {
        title: game.title,
        gameCode: game.gameCode,
        createdAt: game.createdAt,
        questions: game.questions.map((q: any) => ({
          text: q.text,
          answers: q.answers.map((a: any) => ({
            text: a.text,
            correct: a.correct, // This is the correct field name
            _id: a._id,
          })),
          order: q.order,
          time: q.time,
          _id: q._id,
        })),
      };

      await exportGameToPdf(exportableGame);
      showToast("PDF exported successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to export PDF", "error");
    }
  };

  // Get icon component based on icon name
  const getIconComponent = (iconName: string, size: number = 24) => {
    switch (iconName) {
      case "trophy":
        return <Trophy size={size} weight="fill" />;
      case "target":
        return <Target size={size} weight="fill" />;
      case "users":
        return <Users size={size} weight="fill" />;
      case "star":
        return <Star size={size} weight="fill" />;
      case "fire":
        return <Fire size={size} weight="fill" />;
      case "crown":
        return <Crown size={size} weight="fill" />;
      case "bell":
        return <Bell size={size} weight="fill" />;
      default:
        return <Bell size={size} weight="fill" />;
    }
  };

  // Mark notification as read
  const markAsRead = async (id: string) => {
    await markNotificationRead(id);
    setNotificationList((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!userData?._id) return;
    await markAllNotificationsRead(userData._id);
    setNotificationList((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Delete notification
  const deleteNotificationHandler = async (id: string) => {
    await deleteNotification(id);
    setNotificationList((prev) => prev.filter((n) => n._id !== id));
  };

  // Clear all notifications
  const clearAll = async () => {
    if (!userData?._id) return;
    await clearAllNotifications(userData._id);
    setNotificationList([]);
  };

  // Handle accept game invitation
  // Update the handleAcceptGame function in your Dashboard component
  const handleAcceptGame = async (notification: Notification) => {
    if (!notification.data?.gameCode || !notification.senderId) {
      console.error("Missing gameCode or senderId in notification");
      return;
    }

    const gameCode = notification.data.gameCode;
    const senderId = notification.senderId;

    try {
      // Clone the game to the accepting user's account
      const clonedGame = await cloneGame(gameCode, userData!._id);

      // MARK invitation notification as read (instead of deleting)
      await markNotificationRead(notification._id);

      // Update the notification in state to mark it as read
      // This will automatically hide the accept/decline buttons because we're updating the notification
      setNotificationList((prev) =>
        prev.map((n) =>
          n._id === notification._id
            ? {
                ...n,
                read: true,
                // Optionally add a property to track that it was accepted
                data: { ...n.data, accepted: true },
              }
            : n
        )
      );

      // Refresh user's games
      if (userData?._id) {
        const fetchedGames = await getGamesByHost(userData._id);
        setGames(fetchedGames);
      }

      // Increment the SENDER'S cloned-game count
      await incrementGameCloned(senderId, 1);

      // Send notification to SENDER
      await createNotification({
        userId: senderId,
        type: "achievement",
        title: "Invitation Accepted!",
        message: `${userData!.name} accepted your invitation and cloned "${notification.data.gameTitle || "your game"} and you earned 150 points!".`,
        icon: "trophy",
        color: "gold",
        data: {
          clonedBy: userData!._id,
          gameTitle: notification.data.gameTitle,
          gameCode,
        },
      });

      // Success toast
      showToast(
        `Game "${notification.data.gameTitle || "game"}" cloned to your account!`,
        "success"
      );
    } catch (error) {
      console.error("Error accepting game invitation:", error);
      showToast("Failed to accept game invitation", "error");
    }
  };

  // Handle decline game invitation
  const handleDeclineGame = async (notification: Notification) => {
    if (!notification.data?.gameCode) return;

    try {
      // Simply delete the notification
      await deleteNotification(notification._id);
      setNotificationList((prev) => prev.filter((n) => n._id !== notification._id));

      showToast("Game invitation declined", "info");
    } catch (error) {
      console.error("Error declining game invitation:", error);
      showToast("Failed to decline game invitation", "error");
    }
  };

  // Filter functions
  const handleFilterSelect = (filter: FilterType) => {
    setActiveFilter(filter);
    setShowFilterDropdown(false);
  };

  const handleSortSelect = (sort: SortType) => {
    if (activeSort === sort) {
      // Toggle direction if same sort is clicked
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new sort and default to descending for date, ascending for others
      setActiveSort(sort);
      setSortDirection(sort === "date" ? "desc" : "asc");
    }
    setShowSortDropdown(false);
  };

  const clearFilters = () => {
    setActiveFilter("all");
    setActiveSort("date");
    setSortDirection("desc");
    setSearchQuery("");
  };

  // Get filter display name
  const getFilterDisplayName = (filter: FilterType) => {
    switch (filter) {
      case "all":
        return "ALL GAMES";
      case "recent":
        return "RECENT (LAST 7 DAYS)";
      case "oldest":
        return "OLDEST (30+ DAYS)";
      case "manyQuestions":
        return "MANY QUESTIONS (5+)";
      case "fewQuestions":
        return "FEW QUESTIONS (1-5)";
      default:
        return "ALL GAMES";
    }
  };

  // Get sort display name with direction
  const getSortDisplayName = () => {
    const directionIcon = sortDirection === "asc" ? <CaretUp size={12} /> : <CaretDown size={12} />;

    switch (activeSort) {
      case "title":
        return <>TITLE {directionIcon}</>;
      case "date":
        return <>DATE {directionIcon}</>;
      case "questions":
        return <>QUESTIONS {directionIcon}</>;
      case "code":
        return <>CODE {directionIcon}</>;
      default:
        return <>DATE {directionIcon}</>;
    }
  };

  if (loading) {
    return <LoadingDashboard />;
  }

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

      {/* Main Content */}
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

        {/* Navigation Tabs - UPDATED with Notifications */}
        <div className={styles.tabContainer}>
          <button
            className={`${styles.tab} ${activeTab === "games" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("games")}
          >
            <PersonSimpleRun size={24} /> MY GAMES
          </button>
          <button
            className={`${styles.tab} ${activeTab === "notifications" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            <Bell size={24} />
            NOTIFICATIONS
            {unreadCount > 0 && <span className={styles.notificationBadge}>{unreadCount}</span>}
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
                  {/* Search Bar */}
                  <div className={styles.searchContainer}>
                    <input
                      type="text"
                      placeholder="Search games..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={styles.searchInput}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className={styles.clearSearchButton}
                        title="Clear search"
                      >
                        <XIcon size={16} />
                      </button>
                    )}
                  </div>

                  {/* Filter and Sort with dropdowns */}
                  <div className={styles.filterSortContainer}>
                    {/* Filter Dropdown */}
                    <div className={styles.filterSortGroup}>
                      <button
                        className={styles.filterButton}
                        onClick={() => {
                          setShowFilterDropdown(!showFilterDropdown);
                          setShowSortDropdown(false);
                        }}
                      >
                        <Funnel size={16} />
                        {getFilterDisplayName(activeFilter)}
                        {showFilterDropdown ? <CaretUp size={12} /> : <CaretDown size={12} />}
                      </button>
                      {showFilterDropdown && (
                        <div className={styles.filterDropdown}>
                          <button
                            className={`${styles.filterOption} ${activeFilter === "all" ? styles.filterOptionActive : ""}`}
                            onClick={() => handleFilterSelect("all")}
                          >
                            ALL GAMES
                          </button>
                          <button
                            className={`${styles.filterOption} ${activeFilter === "recent" ? styles.filterOptionActive : ""}`}
                            onClick={() => handleFilterSelect("recent")}
                          >
                            RECENT (LAST 7 DAYS)
                          </button>
                          <button
                            className={`${styles.filterOption} ${activeFilter === "oldest" ? styles.filterOptionActive : ""}`}
                            onClick={() => handleFilterSelect("oldest")}
                          >
                            OLDEST (30+ DAYS)
                          </button>
                          <button
                            className={`${styles.filterOption} ${activeFilter === "manyQuestions" ? styles.filterOptionActive : ""}`}
                            onClick={() => handleFilterSelect("manyQuestions")}
                          >
                            MANY QUESTIONS (5+)
                          </button>
                          <button
                            className={`${styles.filterOption} ${activeFilter === "fewQuestions" ? styles.filterOptionActive : ""}`}
                            onClick={() => handleFilterSelect("fewQuestions")}
                          >
                            FEW QUESTIONS (1-5)
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Sort Dropdown */}
                    <div className={styles.filterSortGroup}>
                      <button
                        className={styles.sortButton}
                        onClick={() => {
                          setShowSortDropdown(!showSortDropdown);
                          setShowFilterDropdown(false);
                        }}
                      >
                        <ArrowsDownUp size={16} />
                        {getSortDisplayName()}
                        {showSortDropdown ? <CaretUp size={12} /> : <CaretDown size={12} />}
                      </button>
                      {showSortDropdown && (
                        <div className={styles.sortDropdown}>
                          <button
                            className={`${styles.sortOption} ${activeSort === "title" ? styles.sortOptionActive : ""}`}
                            onClick={() => handleSortSelect("title")}
                          >
                            TITLE
                            {activeSort === "title" &&
                              (sortDirection === "asc" ? (
                                <CaretUp size={12} />
                              ) : (
                                <CaretDown size={12} />
                              ))}
                          </button>
                          <button
                            className={`${styles.sortOption} ${activeSort === "date" ? styles.sortOptionActive : ""}`}
                            onClick={() => handleSortSelect("date")}
                          >
                            DATE
                            {activeSort === "date" &&
                              (sortDirection === "asc" ? (
                                <CaretUp size={12} />
                              ) : (
                                <CaretDown size={12} />
                              ))}
                          </button>
                          <button
                            className={`${styles.sortOption} ${activeSort === "questions" ? styles.sortOptionActive : ""}`}
                            onClick={() => handleSortSelect("questions")}
                          >
                            QUESTIONS
                            {activeSort === "questions" &&
                              (sortDirection === "asc" ? (
                                <CaretUp size={12} />
                              ) : (
                                <CaretDown size={12} />
                              ))}
                          </button>
                          <button
                            className={`${styles.sortOption} ${activeSort === "code" ? styles.sortOptionActive : ""}`}
                            onClick={() => handleSortSelect("code")}
                          >
                            CODE
                            {activeSort === "code" &&
                              (sortDirection === "asc" ? (
                                <CaretUp size={12} />
                              ) : (
                                <CaretDown size={12} />
                              ))}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Clear Filters Button */}
                    {(activeFilter !== "all" || activeSort !== "date" || searchQuery) && (
                      <button
                        onClick={clearFilters}
                        className={styles.clearFiltersButton}
                        title="Clear all filters"
                      >
                        <XIcon size={16} />
                        CLEAR
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              {(activeFilter !== "all" || searchQuery) && (
                <div className={styles.activeFilters}>
                  <span className={styles.activeFiltersLabel}>ACTIVE FILTERS:</span>
                  {activeFilter !== "all" && (
                    <span className={styles.activeFilterTag}>
                      {getFilterDisplayName(activeFilter)}
                      <button
                        onClick={() => setActiveFilter("all")}
                        className={styles.removeFilterButton}
                      >
                        <XIcon size={12} />
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className={styles.activeFilterTag}>
                      SEARCH: "{searchQuery}"
                      <button
                        onClick={() => setSearchQuery("")}
                        className={styles.removeFilterButton}
                      >
                        <XIcon size={12} />
                      </button>
                    </span>
                  )}
                  <span className={styles.gamesCount}>
                    {filteredAndSortedGames.length} of {games.length} games
                  </span>
                </div>
              )}

              {/* Games List */}
              <div className={styles.gamesList}>
                {filteredAndSortedGames.length > 0 ? (
                  filteredAndSortedGames.map((game) => (
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
                              email: session?.user.email ?? "",
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
                          onClick={() => handleExportGame(game.gameCode, game.title)}
                          className={styles.exportButton}
                        >
                          EXPORT
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
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <Joystick size={50} className={styles.emptyIcon} />
                    <h3 className={styles.emptyTitle}>No Games Found</h3>
                    <p className={styles.emptyText}>
                      {searchQuery || activeFilter !== "all"
                        ? "No games match your current filters. Try changing your search or filters."
                        : "Create your first game to get started!"}
                    </p>
                    {(searchQuery || activeFilter !== "all") && (
                      <button onClick={clearFilters} className={styles.emptyButton}>
                        CLEAR FILTERS
                      </button>
                    )}
                    {!searchQuery && activeFilter === "all" && (
                      <button onClick={() => router.push("/create")} className={styles.emptyButton}>
                        CREATE FIRST GAME
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className={styles.notificationsSection}>
              <div className={styles.sectionHeader}>
                <div className={styles.notificationsHeader}>
                  <h2 className={styles.sectionTitle}>
                    <Bell size={28} weight="fill" className={styles.titleIcon} />
                    NOTIFICATIONS
                    {unreadCount > 0 && (
                      <span className={styles.unreadCount}>• {unreadCount} UNREAD</span>
                    )}
                  </h2>
                  <div className={styles.notificationsActions}>
                    <button
                      onClick={markAllAsRead}
                      className={styles.markAllButton}
                      disabled={unreadCount === 0}
                    >
                      <CheckCircle size={16} />
                      MARK ALL READ
                    </button>
                    <button
                      onClick={clearAll}
                      className={styles.clearAllButton}
                      disabled={notificationList.length === 0}
                    >
                      <XCircle size={16} />
                      CLEAR ALL
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.notificationsList}>
                {notificationList.length > 0 ? (
                  notificationList.map((notification, index) => {
                    const config = getNotificationConfig(notification);
                    const timeAgo = formatTimeAgo(notification.createdAt);

                    return (
                      <div
                        key={notification._id ?? index}
                        className={`${styles.notificationCard} ${
                          !notification.read ? styles.unread : ""
                        }`}
                      >
                        <div className={styles.notificationIcon} style={{ color: config.color }}>
                          {getIconComponent(config.icon, 32)}
                        </div>
                        <div className={styles.notificationContent}>
                          <div className={styles.notificationHeader}>
                            <h3 className={styles.notificationTitle}>{notification.title}</h3>
                            <span className={styles.notificationTime}>{timeAgo}</span>
                          </div>
                          <p className={styles.notificationMessage}>{notification.message}</p>
                          <div className={styles.notificationType}>
                            <span
                              className={styles.typeBadge}
                              style={{ backgroundColor: config.badgeColor }}
                            >
                              {notification.type.toUpperCase()}
                            </span>
                            {notification.data?.gameCode && (
                              <span className={styles.gameCodeBadge}>
                                #{notification.data.gameCode}
                              </span>
                            )}
                          </div>
                          {/* Accept/Decline buttons for game invitations */}

                          {notification.type === "game" &&
                            notification.data?.gameCode &&
                            notification.title === "Game Invitation" &&
                            !notification.read && (
                              <div className={styles.gameInvitationActions}>
                                <button
                                  onClick={() => handleAcceptGame(notification)}
                                  className={styles.acceptButton}
                                >
                                  <Check size={16} />
                                  ACCEPT
                                </button>
                                <button
                                  onClick={() => handleDeclineGame(notification)}
                                  className={styles.declineButton}
                                >
                                  <X size={16} />
                                  DECLINE
                                </button>
                              </div>
                            )}
                          {notification.type === "game" &&
                            notification.data?.gameCode &&
                            notification.title === "Game Invitation" &&
                            notification.read && (
                              <div className={styles.invitationStatus}>
                                <span className={styles.acceptedStatus}>
                                  <Check size={16} />
                                  INVITATION ACCEPTED
                                </span>
                              </div>
                            )}
                        </div>
                        <div className={styles.notificationActions}>
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className={styles.markReadButton}
                              title="Mark as read"
                            >
                              <CheckCircle size={20} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotificationHandler(notification._id)}
                            className={styles.deleteNotificationButton}
                            title="Delete notification"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.emptyNotifications}>
                    <Bell size={60} className={styles.emptyIcon} />
                    <h3 className={styles.emptyTitle}>No Notifications</h3>
                    <p className={styles.emptyText}>
                      You're all caught up! Check back later for updates.
                    </p>
                    <div className={styles.emptyTips}>
                      <p>• Create games to get achievement notifications</p>
                      <p>• Play games to receive score updates</p>
                      <p>• Share games to get player join notifications</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Notification Stats */}
              {notificationList.length > 0 && (
                <div className={styles.notificationsStats}>
                  <div className={styles.statItem}>
                    <div className={styles.statNumber}>{notificationList.length}</div>
                    <div className={styles.statLabel}>TOTAL</div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.statNumber}>{unreadCount}</div>
                    <div className={styles.statLabel}>UNREAD</div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.statNumber}>
                      {notificationList.filter((n) => n.type === "achievement").length}
                    </div>
                    <div className={styles.statLabel}>ACHIEVEMENTS</div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.statNumber}>
                      {notificationList.filter((n) => n.type === "game").length}
                    </div>
                    <div className={styles.statLabel}>GAME UPDATES</div>
                  </div>
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
                      {/* Logout Button */}
                      <button
                        onClick={async () => {
                          // Clear localStorage
                          localStorage.removeItem("playerUUID");
                          showToast("Logging out...", "info");
                          // Sign out from NextAuth
                          await signOut({
                            callbackUrl: "/",
                            redirect: true,
                          });
                          showToast("Successfully logged out!", "success");
                        }}
                        className={styles.logoutButton}
                      >
                        <SignOut size={18} />
                        LOGOUT
                      </button>
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
        onClose={() => setShareModal({ isOpen: false, gameCode: "", gameTitle: "", email: "" })}
        gameCode={shareModal.gameCode}
        gameTitle={shareModal.gameTitle}
        email={shareModal.email}
        userId={session?.user.id ?? ""}
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
