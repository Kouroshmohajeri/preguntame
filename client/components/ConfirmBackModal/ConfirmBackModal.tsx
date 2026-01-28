"use client";
import { useEffect } from "react";
import styles from "./ConfirmBackModal.module.css";

interface ConfirmBackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmBackModal({ isOpen, onClose, onConfirm }: ConfirmBackModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Warning Icon */}
        <div className={`${styles.iconContainer} ${styles.warningIcon}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            fill="currentColor"
            viewBox="0 0 256 256"
            className={styles.icon}
          >
            <path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z" />
          </svg>
        </div>

        {/* Title */}
        <h2 className={styles.title}>Are you sure you want to go back?</h2>

        {/* Message */}
        <p className={styles.message}>
          Going back will discard all generated questions and progress.
        </p>

        {/* Warning Box */}
        <div className={`${styles.infoBox} ${styles.warningBox}`}>
          <div className={styles.infoIcon}>⚠️</div>
          <div className={styles.infoContent}>
            <strong>Important:</strong> The AI credit used to generate these questions is
            non-refundable. All questions will be permanently lost.
          </div>
        </div>

        {/* Buttons */}
        <div className={styles.buttonContainer}>
          <button onClick={onClose} className={styles.confirmButton} aria-label="Stay on page">
            Stay Here
          </button>
          <button
            onClick={onConfirm}
            className={`${styles.cancelButton} ${styles.dangerButton}`}
            aria-label="Go back and discard"
          >
            Go Back Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
