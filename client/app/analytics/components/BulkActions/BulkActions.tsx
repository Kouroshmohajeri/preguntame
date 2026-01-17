"use client";
import { Trash } from "@phosphor-icons/react";
import styles from "./BulkActions.module.css";

interface BulkActionsProps {
  selectedCount: number;
  onDelete: () => void;
}

export default function BulkActions({ selectedCount, onDelete }: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className={styles.bulkActions}>
      <span className={styles.bulkCount}>{selectedCount} selected</span>
      <button className={styles.bulkDeleteBtn} onClick={onDelete}>
        <Trash size={18} weight="bold" /> Delete Selected
      </button>
    </div>
  );
}
