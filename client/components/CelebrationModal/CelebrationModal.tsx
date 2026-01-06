"use client";
import { useEffect, useState } from "react";
import styles from "./CelebrationModal.module.css";

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameUrl: string;
  qrCode: string;
}

export default function CelebrationModal({
  isOpen,
  onClose,
  gameUrl,
  qrCode,
}: CelebrationModalProps) {
  const [copied, setCopied] = useState(false);

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(gameUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Celebration Icon */}
        <div className={styles.iconContainer}>
          <div className={styles.celebrationIcon}>
            <div className={styles.trophy}>🏆</div>
            <div className={styles.confetti}>
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className={styles.confettiPiece}
                  style={
                    {
                      "--delay": `${i * 0.1}s`,
                      "--x": `${(i % 4) * 30 - 45}px`,
                      "--rotation": `${i * 30}deg`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className={styles.title}>Game Published!</h2>

        {/* Success Message */}
        <p className={styles.message}>
          Your quiz is now live and ready for players to join. Share it now or host a game session!
        </p>

        {/* QR Code Section */}
        <div className={styles.qrSection}>
          <div className={styles.qrLabel}>Scan to Join</div>
          <div className={styles.qrContainer}>
            <img src={qrCode} alt="Game QR Code" className={styles.qrImage} />
          </div>
        </div>

        {/* URL Section */}
        <div className={styles.urlSection}>
          <div className={styles.urlLabel}>Game Link</div>
          <div className={styles.urlBox}>
            <input
              type="text"
              value={gameUrl}
              readOnly
              className={styles.urlInput}
              onClick={(e) => e.currentTarget.select()}
            />
            <button onClick={handleCopy} className={styles.copyButton} aria-label="Copy link">
              {copied ? "✓" : "📋"}
            </button>
          </div>
          {copied && <div className={styles.copiedMessage}>Copied to clipboard!</div>}
        </div>

        {/* Action Buttons */}
        <div className={styles.buttonContainer}>
          <button
            onClick={onClose}
            className={styles.secondaryButton}
            aria-label="Create another quiz"
          >
            Create Another
          </button>
          <a
            href={gameUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.primaryButton}
            aria-label="Host game now"
          >
            Host Game Now
          </a>
        </div>
      </div>
    </div>
  );
}
