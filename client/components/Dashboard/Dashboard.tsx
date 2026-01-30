"use client";
import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext/ToastContext";
import { getUser, decrementGamesCreated, incrementGameCloned } from "@/app/api/users/actions";
import { getGamesByHost, deleteGame, cloneGame } from "@/app/api/game/actions";
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
  createNotification,
} from "@/app/api/notifications/actions";

import { UserData, Game, Notification, TabType, FilterType, SortType } from "./type";
import DashboardHeader from "./DashboardHeader/DashboardHeader";
import StatsGrid from "./StatsGrid/StatsGrid";
import TabNavigation from "./TabNavigation/TabNavigation";

import SubscriptionTab from "./SubscriptionTab/SubscriptionTab";

import LoadingDashboard from "./LoadingDashboard/LoadingDashboard";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import ShareModal from "../ShareModal/ShareModal";

import styles from "./Dashboard.module.css";
import GamesTab from "./GamesTab/GamesTab";
import DashboardFooter from "./DashboardFooter/DashboardFooter";
import NotificationsTab from "./NotificationsTab/NotificationsTab";
import SettingsTab from "./SettingsTab/SettingsTab";
import AnnouncementModal from "../AnnouncementModal/AnnouncementModal";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("games");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationList, setNotificationList] = useState<Notification[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  const { data: session, status } = useSession();
  const { showToast } = useToast();

  // Modals
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, gameCode: "", gameTitle: "" });
  const [shareModal, setShareModal] = useState({
    isOpen: false,
    gameCode: "",
    gameTitle: "",
    email: "",
  });

  // Calculate unread notifications
  useEffect(() => {
    const count = notificationList.filter((n) => !n.read).length;
    setUnreadCount(count);
  }, [notificationList]);

  // Fetch user data function (extracted for reuse)
  const fetchUserData = async () => {
    if (!session?.user?.email) {
      setLoading(false);
      return;
    }

    try {
      const userData = await getUser(session.user.email);
      setUserData(userData || null);

      if (userData?._id) {
        const [fetchedGames, notif] = await Promise.all([
          getGamesByHost(userData._id),
          getUserNotifications(userData._id),
        ]);
        setGames(fetchedGames);
        setNotificationList(notif || []);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user data on mount
  useEffect(() => {
    if (status === "loading") return;
    fetchUserData();
  }, [session, status]);

  // Handle announcement modal
  useEffect(() => {
    const hasSeenAnnouncement = localStorage.getItem("hasSeenWizardAnnouncement");
    if (!hasSeenAnnouncement) {
      setTimeout(() => setShowAnnouncementModal(true), 500);
    }

    // Listen for reopen event from floating button
    const handleReopen = () => {
      setShowAnnouncementModal(true);
    };

    window.addEventListener("reopenAnnouncement", handleReopen);
    return () => window.removeEventListener("reopenAnnouncement", handleReopen);
  }, []);

  const handleCloseAnnouncement = () => {
    setShowAnnouncementModal(false);
    localStorage.setItem("hasSeenWizardAnnouncement", "true");
  };

  // Refresh dashboard when navigating to AI Access
  const handleDashboardRefresh = async () => {
    // Switch to subscription tab to show AI Access
    setActiveTab("subscription");
    // Optionally refresh user data
    await fetchUserData();
  };

  const stats = {
    totalGames: userData?.gamesCreated || 0,
    totalPlays: userData?.gamesPlayed || 0,
    credits: userData?.credits || 0,
    points: (userData?.gameGotCloned || 0) * 150,
  };

  if (loading) {
    return <LoadingDashboard />;
  }

  return (
    <div className={styles.container}>
      <DashboardHeader userData={userData} />

      <main className={styles.main}>
        <StatsGrid stats={stats} />
        <TabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadCount={unreadCount}
        />

        <div className={styles.contentArea}>
          {activeTab === "games" && (
            <GamesTab
              games={games}
              setGames={setGames}
              userData={userData}
              setUserData={setUserData}
              setDeleteModal={setDeleteModal}
              setShareModal={setShareModal}
              session={session}
            />
          )}

          {activeTab === "notifications" && (
            <NotificationsTab
              notificationList={notificationList}
              setNotificationList={setNotificationList}
              userData={userData}
              setGames={setGames}
              unreadCount={unreadCount}
            />
          )}

          {activeTab === "subscription" && (
            <SubscriptionTab
              stats={stats}
              userEmail={userData?.email || session?.user?.email || ""}
              userName={userData?.name || session?.user?.name || "User"}
            />
          )}

          {activeTab === "settings" && userData && <SettingsTab userData={userData} />}
        </div>
      </main>

      <DashboardFooter />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, gameCode: "", gameTitle: "" })}
        onConfirm={async () => {
          // Handle delete logic here
        }}
        title="DELETE GAME"
        message={`Are you sure you want to delete "${deleteModal.gameTitle}"?`}
        confirmText="DELETE"
        type="danger"
      />

      {/* Announcement Modal */}
      <AnnouncementModal
        isOpen={showAnnouncementModal}
        onClose={handleCloseAnnouncement}
        redirectUrl="/dashboard#ai-access"
        onDashboardAction={handleDashboardRefresh}
      />

      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, gameCode: "", gameTitle: "", email: "" })}
        gameCode={shareModal.gameCode}
        gameTitle={shareModal.gameTitle}
        email={shareModal.email}
        userId={session?.user.id ?? ""}
      />
    </div>
  );
}
