"use client";
import { useEffect } from "react";
import styles from "./ConfirmPublishModal.module.css";

interface ConfirmPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function ConfirmPublishModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: ConfirmPublishModalProps) {
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
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={!isLoading ? onClose : undefined}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Icon */}
        <div className={styles.iconContainer}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            fill="currentColor"
            viewBox="0 0 256 256"
            className={styles.icon}
          >
            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm-4,48a12,12,0,1,1-12,12A12,12,0,0,1,124,72Zm12,112a16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40a8,8,0,0,1,0,16Z" />
          </svg>
        </div>

        {/* Title */}
        <h2 className={styles.title}>Ready to Publish?</h2>

        {/* Message */}
        <p className={styles.message}>
          Are you sure you want to publish this game? Once published, players can join and play
          immediately.
        </p>

        {/* Info Box */}
        <div className={styles.infoBox}>
          <div className={styles.infoIcon}>💡</div>
          <div className={styles.infoContent}>
            <strong>Good to know:</strong> You can always edit this game later from your dashboard
            to add more questions, update answers, or change settings.
          </div>
        </div>

        {/* Buttons */}
        <div className={styles.buttonContainer}>
          <button
            onClick={onClose}
            className={styles.cancelButton}
            disabled={isLoading}
            aria-label="Cancel publishing"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={styles.confirmButton}
            disabled={isLoading}
            aria-label="Confirm publishing"
          >
            {isLoading ? (
              <>
                <span className={styles.spinner}></span>
                Publishing...
              </>
            ) : (
              "Yes, Publish Game"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
