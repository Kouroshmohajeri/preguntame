"use client";
import { Notification } from "../type";
import { CheckCircle, XCircle, Check, X } from "@phosphor-icons/react";
import { getNotificationConfig, formatTimeAgo, getIconComponent } from "../utils";
import styles from "./NotificationCard.module.css";

interface Props {
  notification: Notification;
  onMarkRead: () => void;
  onDelete: () => void;
  onAccept: () => void;
  onDecline: () => void;
}

export default function NotificationCard({
  notification,
  onMarkRead,
  onDelete,
  onAccept,
  onDecline,
}: Props) {
  const config = getNotificationConfig(notification);
  const timeAgo = formatTimeAgo(notification.createdAt);

  return (
    <div className={`${styles.notificationCard} ${!notification.read ? styles.unread : ""}`}>
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
          <span className={styles.typeBadge} style={{ backgroundColor: config.badgeColor }}>
            {notification.type.toUpperCase()}
          </span>
          {notification.data?.gameCode && (
            <span className={styles.gameCodeBadge}>#{notification.data.gameCode}</span>
          )}
        </div>

        {/* Accept/Decline for game invitations */}
        {notification.type === "game" &&
          notification.data?.gameCode &&
          notification.title === "Game Invitation" &&
          !notification.read && (
            <div className={styles.gameInvitationActions}>
              <button onClick={onAccept} className={styles.acceptButton}>
                <Check size={16} />
                ACCEPT
              </button>
              <button onClick={onDecline} className={styles.declineButton}>
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
          <button onClick={onMarkRead} className={styles.markReadButton} title="Mark as read">
            <CheckCircle size={20} />
          </button>
        )}
        <button
          onClick={onDelete}
          className={styles.deleteNotificationButton}
          title="Delete notification"
        >
          <XCircle size={20} />
        </button>
      </div>
    </div>
  );
}
