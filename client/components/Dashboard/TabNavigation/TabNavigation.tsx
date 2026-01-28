"use client";
import { useEffect } from "react";
import { PersonSimpleRun, Bell, Crown, Gear, Sparkle } from "@phosphor-icons/react";
import { TabType } from "../type";
import styles from "./TabNavigation.module.css";

interface Props {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  unreadCount: number;
}

export default function TabNavigation({ activeTab, setActiveTab, unreadCount }: Props) {
  // Update URL hash when tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);

    // Update URL hash
    const hash = getHashForTab(tab);
    if (hash) {
      window.location.hash = hash;
    } else {
      // Remove hash for default tab (games)
      history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  };

  // Get hash string for each tab
  const getHashForTab = (tab: TabType): string => {
    switch (tab) {
      case "subscription":
        return "#ai-access";
      case "notifications":
        return "#notifications";
      case "settings":
        return "#settings";
      case "games":
      default:
        return "";
    }
  };

  // Listen for hash changes (browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;

      switch (hash) {
        case "#ai-access":
          setActiveTab("subscription");
          break;
        case "#notifications":
          setActiveTab("notifications");
          break;
        case "#settings":
          setActiveTab("settings");
          break;
        default:
          setActiveTab("games");
          break;
      }
    };

    // Set initial tab based on hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [setActiveTab]);

  return (
    <div className={styles.tabContainer}>
      <button
        className={`${styles.tab} ${activeTab === "games" ? styles.tabActive : ""}`}
        onClick={() => handleTabChange("games")}
      >
        <PersonSimpleRun size={24} /> MY GAMES
      </button>

      <button
        className={`${styles.tab} ${activeTab === "notifications" ? styles.tabActive : ""}`}
        onClick={() => handleTabChange("notifications")}
      >
        <Bell size={24} /> NOTIFICATIONS
        {unreadCount > 0 && <span className={styles.notificationBadge}>{unreadCount}</span>}
      </button>

      <button
        className={`${styles.tab} ${activeTab === "subscription" ? styles.tabActive : ""}`}
        onClick={() => handleTabChange("subscription")}
      >
        <Sparkle size={24} /> AI ACCESS
      </button>

      <button
        className={`${styles.tab} ${activeTab === "settings" ? styles.tabActive : ""}`}
        onClick={() => handleTabChange("settings")}
      >
        <Gear size={24} /> PROFILE & SETTINGS
      </button>
    </div>
  );
}
