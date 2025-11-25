"use client";
import { useRouter } from "next/navigation";
import styles from "./RetroErrorModal.module.css";

interface RetroErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function RetroErrorModal({
  isOpen,
  onClose,
  message = "Sorry you're not the host of this game",
}: RetroErrorModalProps) {
  const router = useRouter();

  const handleAcknowledge = () => {
    onClose(); // Close the modal first
    router.push("/"); // Then redirect to home page
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* CRT Monitor Effect */}
        <div className={styles.crtEffect}>
          <div className={styles.scanlines}></div>
          <div className={styles.flicker}></div>
        </div>

        {/* Modal Content */}
        <div className={styles.content}>
          {/* Error Header */}
          <div className={styles.header}>
            <div className={styles.errorIcon}>⚠️</div>
            <div className={styles.title}>ACCESS DENIED</div>
            <button onClick={handleAcknowledge} className={styles.closeButton}>
              <span className={styles.closeIcon}>[X]</span>
            </button>
          </div>

          {/* Error Message */}
          <div className={styles.messageContainer}>
            <div className={styles.messageText}>{message}</div>
          </div>

          {/* Error Details */}
          <div className={styles.errorDetails}>
            <div className={styles.errorCode}>ERROR CODE: 403_FORBIDDEN</div>
            <div className={styles.errorDescription}>
              You do not have host privileges for this game room. <br />I think with this font I had
              to include some difficult code so you think it's very complicated.
              <br />
              So please consider this as a very strange error because I dont know how to continue
              this anymore I'm running out of words.
              <br />I think I'm finished so... peace I'm out!
            </div>
          </div>

          {/* Action Button */}
          <div className={styles.actions}>
            <button onClick={handleAcknowledge} className={styles.retryButton}>
              <span className={styles.buttonText}>ACKNOWLEDGE</span>
              <span className={styles.buttonGlow}></span>
            </button>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <div className={styles.footerText}>
              REDIRECTING TO HOME...(Please click the button, thanks!)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
