// components/AIQuestionWizard/components/review/BulkActionsBar.tsx
import { Clock, Trash, X } from "@phosphor-icons/react";
import styles from "../../AIQuestionWizard.module.css";

interface BulkActionsBarProps {
  selectedCount: number;
  bulkTime: number;
  setBulkTime: (time: number) => void;
  onApplyTime: () => void;
  onDeleteSelected: () => void;
  onCancel: () => void;
}

export default function BulkActionsBar({
  selectedCount,
  bulkTime,
  setBulkTime,
  onApplyTime,
  onDeleteSelected,
  onCancel,
}: BulkActionsBarProps) {
  return (
    <div className={styles.bulkActionsBar}>
      <div className={styles.bulkInfo}>
        <span>{selectedCount} selected</span>
      </div>
      <div className={styles.bulkControls}>
        <div className={styles.bulkTimeControl}>
          <Clock size={20} weight="bold" />
          <input
            type="number"
            min="5"
            max="300"
            value={bulkTime}
            onChange={(e) => setBulkTime(parseInt(e.target.value))}
            className={styles.bulkTimeInput}
          />
          <span>seconds</span>
          <button onClick={onApplyTime} className={styles.bulkApplyBtn}>
            Apply Time
          </button>
        </div>
        <button onClick={onDeleteSelected} className={styles.bulkDeleteBtn}>
          <Trash size={20} weight="fill" />
          Delete Selected
        </button>
        <button onClick={onCancel} className={styles.bulkCancelBtn}>
          <X size={20} weight="bold" />
        </button>
      </div>
    </div>
  );
}
