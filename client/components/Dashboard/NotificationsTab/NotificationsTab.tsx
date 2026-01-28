"use client";
import { useState } from "react";
import { Notification, UserData, Game } from "../type";
import { Bell, CheckCircle, XCircle } from "@phosphor-icons/react";
import { useToast } from "@/context/ToastContext/ToastContext";
import {
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
  createNotification,
} from "@/app/api/notifications/actions";
import { cloneGame, getGamesByHost, getGame } from "@/app/api/game/actions";
import { incrementGameCloned } from "@/app/api/users/actions";
import { checkBetaAccessStatus } from "@/app/api/betaAccess/actions";
import { getUserCredits, deductCredits } from "@/app/api/credits/actions";
import NotificationCard from "./NotificationCard";
import AICloneConfirmModal from "@/components/AICloneConfirmModal/AICloneConfirmModal";
import styles from "./NotificationsTab.module.css";

interface Props {
  notificationList: Notification[];
  setNotificationList: React.Dispatch<React.SetStateAction<Notification[]>>;
  userData: UserData | null;
  setGames: React.Dispatch<React.SetStateAction<Game[]>>;
  unreadCount: number;
}

export default function NotificationsTab({
  notificationList,
  setNotificationList,
  userData,
  setGames,
  unreadCount,
}: Props) {
  const { showToast } = useToast();
  const [aiCloneModal, setAiCloneModal] = useState<{
    isOpen: boolean;
    notification: Notification | null;
    isAiGame: boolean;
    userCredits: number;
    hasBetaAccess: boolean;
    betaStatus: "pending" | "approved" | "rejected" | null;
  }>({
    isOpen: false,
    notification: null,
    isAiGame: false,
    userCredits: 0,
    hasBetaAccess: false,
    betaStatus: null,
  });

  const markAsRead = async (id: string) => {
    await markNotificationRead(id);
    setNotificationList((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = async () => {
    if (!userData?._id) return;
    await markAllNotificationsRead(userData._id);
    setNotificationList((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotificationHandler = async (id: string) => {
    await deleteNotification(id);
    setNotificationList((prev) => prev.filter((n) => n._id !== id));
  };

  const clearAll = async () => {
    if (!userData?._id) return;
    await clearAllNotifications(userData._id);
    setNotificationList([]);
  };

  const handleAcceptGame = async (notification: Notification) => {
    if (!notification.data?.gameCode || !notification.senderId || !userData?.email) {
      console.error("Missing required data in notification");
      return;
    }

    const gameCode = notification.data.gameCode;

    try {
      // Fetch the game to check if it's AI-generated
      const game = await getGame(gameCode);
      const isAiGame = game.isAi === true;

      // If not AI game, clone directly
      if (!isAiGame) {
        await cloneGame(gameCode, userData._id, false);
        await completeCloning(notification);
        return;
      }

      // If AI game, check beta access and credits
      try {
        const [betaAccessData, creditsData] = await Promise.all([
          checkBetaAccessStatus(userData.email),
          getUserCredits(userData.email),
        ]);

        const hasBetaAccess = betaAccessData?.status !== undefined;
        const betaStatus = betaAccessData?.status || null;
        const userCredits = creditsData?.credits || 0;

        // Open modal with all information
        setAiCloneModal({
          isOpen: true,
          notification,
          isAiGame: true,
          userCredits,
          hasBetaAccess,
          betaStatus,
        });
      } catch (betaError: any) {
        // ✅ Check if it's a 404 error (user hasn't applied for beta access)
        if (betaError?.response?.status === 404 || betaError?.message?.includes("404")) {
          showToast(
            "You need to apply for AI credits first. Click on AI Access tab to apply and try again.",
            "error"
          );
          return;
        }

        // ✅ Check if it's a credits-related error
        if (betaError?.message?.includes("credits")) {
          showToast(
            "Unable to check your AI credits. Please try again or contact support.",
            "error"
          );
          return;
        }

        // Other errors
        throw betaError;
      }
    } catch (error: any) {
      console.error("Error checking game status:", error);
      showToast("Failed to process game invitation", "error");
    }
  };

  const handleConfirmAiClone = async () => {
    const { notification } = aiCloneModal;
    if (!notification?.data?.gameCode || !userData?.email) {
      console.error("Missing required data for AI clone");
      return;
    }

    const gameCode = notification.data.gameCode;

    try {
      // Deduct 10 credits
      await deductCredits(userData.email, 10);

      // Clone the game with isAi = true
      await cloneGame(gameCode, userData._id, true);

      // Complete the cloning process
      await completeCloning(notification);

      // Close modal
      setAiCloneModal({
        isOpen: false,
        notification: null,
        isAiGame: false,
        userCredits: 0,
        hasBetaAccess: false,
        betaStatus: null,
      });
    } catch (error) {
      console.error("Error cloning AI game:", error);
      showToast("Failed to clone AI game", "error");
    }
  };

  const completeCloning = async (notification: Notification) => {
    // ✅ Add null checks
    if (!notification.data?.gameCode || !notification.senderId || !userData) {
      console.error("Missing required data for completing cloning");
      return;
    }

    const gameCode = notification.data.gameCode;
    const senderId = notification.senderId;

    // Mark notification as read
    await markNotificationRead(notification._id);

    setNotificationList((prev) =>
      prev.map((n) =>
        n._id === notification._id ? { ...n, read: true, data: { ...n.data, accepted: true } } : n
      )
    );

    // Refresh games list
    if (userData._id) {
      const fetchedGames = await getGamesByHost(userData._id);
      setGames(fetchedGames);
    }

    // Increment sender's game cloned count
    await incrementGameCloned(senderId, 1);

    // Send notification to sender
    await createNotification({
      userId: senderId,
      type: "achievement",
      title: "Invitation Accepted!",
      message: `${userData.name} accepted your invitation and cloned "${notification.data.gameTitle || "your game"}" and you earned 150 points!`,
      icon: "trophy",
      color: "gold",
      data: {
        clonedBy: userData._id,
        gameTitle: notification.data.gameTitle || "game",
        gameCode,
      },
      senderId: userData.email,
    });

    showToast(`Game "${notification.data.gameTitle || "game"}" cloned to your account!`, "success");
  };

  const handleDeclineGame = async (notification: Notification) => {
    if (!notification.data?.gameCode) return;

    try {
      await deleteNotification(notification._id);
      setNotificationList((prev) => prev.filter((n) => n._id !== notification._id));
      showToast("Game invitation declined", "info");
    } catch (error) {
      console.error("Error declining game invitation:", error);
      showToast("Failed to decline game invitation", "error");
    }
  };

  return (
    <>
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
            notificationList.map((notification, index) => (
              <NotificationCard
                key={notification._id ?? index}
                notification={notification}
                onMarkRead={() => markAsRead(notification._id)}
                onDelete={() => deleteNotificationHandler(notification._id)}
                onAccept={() => handleAcceptGame(notification)}
                onDecline={() => handleDeclineGame(notification)}
              />
            ))
          ) : (
            <div className={styles.emptyNotifications}>
              <Bell size={60} className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>No Notifications</h3>
              <p className={styles.emptyText}>
                You're all caught up! Check back later for updates.
              </p>
              <div className={styles.emptyTips}>
                <p>Create games to get achievement notifications</p>
                <p>Play games to receive score updates</p>
                <p>Share games to get player join notifications</p>
              </div>
            </div>
          )}
        </div>

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

      {/* AI Clone Confirmation Modal */}
      <AICloneConfirmModal
        isOpen={aiCloneModal.isOpen}
        onClose={() =>
          setAiCloneModal({
            isOpen: false,
            notification: null,
            isAiGame: false,
            userCredits: 0,
            hasBetaAccess: false,
            betaStatus: null,
          })
        }
        onConfirm={handleConfirmAiClone}
        gameTitle={aiCloneModal.notification?.data?.gameTitle || ""}
        userCredits={aiCloneModal.userCredits}
        hasBetaAccess={aiCloneModal.hasBetaAccess}
        betaStatus={aiCloneModal.betaStatus}
      />
    </>
  );
}
