"use client";
import { ArrowClockwise } from "@phosphor-icons/react";
import { useState } from "react";
import styles from "./RefreshButton.module.css";

interface RefreshButtonProps {
  onRefresh: () => Promise<void>;
}

export default function RefreshButton({ onRefresh }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`${styles.refreshButton} ${isRefreshing ? styles.refreshing : ""}`}
      title="Refresh analytics data"
    >
      <ArrowClockwise size={20} weight="bold" className={styles.icon} />
      <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
    </button>
  );
}
