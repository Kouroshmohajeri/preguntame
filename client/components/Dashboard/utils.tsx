import { Notification } from "./type";
import { Bell, Trophy, Target, Users } from "@phosphor-icons/react";

export const getNotificationConfig = (notification: Notification) => {
  switch (notification.type) {
    case "game":
      return { icon: "target", color: "#4ECDC4", badgeColor: "#4ECDC4" };
    case "achievement":
      return { icon: "trophy", color: "#FFD166", badgeColor: "#FFD166" };
    case "social":
      return { icon: "users", color: "#118AB2", badgeColor: "#118AB2" };
    case "system":
      return { icon: "bell", color: "#6A4C93", badgeColor: "#6A4C93" };
    default:
      return { icon: "bell", color: "#999", badgeColor: "#999" };
  }
};

export const formatTimeAgo = (dateString: string) => {
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

export const getIconComponent = (iconName: string, size: number = 24) => {
  switch (iconName) {
    case "trophy":
      return <Trophy size={size} weight="fill" />;
    case "target":
      return <Target size={size} weight="fill" />;
    case "users":
      return <Users size={size} weight="fill" />;
    case "bell":
      return <Bell size={size} weight="fill" />;
    default:
      return <Bell size={size} weight="fill" />;
  }
};
