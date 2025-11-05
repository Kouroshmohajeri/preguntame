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
  qrCode 
}: CelebrationModalProps) {
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowParticles(true);
      const timer = setTimeout(() => setShowParticles(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      {/* Pixel particles */}
      {showParticles && (
        <>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className={styles.pixel}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1}s`,
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
              }}
            />
          ))}
        </>
      )}

      <div className={styles.modal}>
        {/* Retro header */}
        <div className={styles.header}>
          <div className={styles.pixelTitle}>🎉 SUCCESS! 🎉</div>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.message}>
            Your game has been published!
          </div>

          {/* QR Code */}
          <div className={styles.qrSection}>
            <div className={styles.qrLabel}>Scan to play:</div>
            <img src={qrCode} alt="Game QR Code" className={styles.qrImage} />
          </div>

          {/* Game URL */}
          <div className={styles.urlSection}>
            <div className={styles.urlLabel}>Or share this link:</div>
            <div className={styles.urlBox}>
              <code className={styles.url}>{gameUrl}</code>
              <button 
                onClick={() => navigator.clipboard.writeText(gameUrl)}
                className={styles.copyButton}
              >
                📋
              </button>
            </div>
          </div>

          {/* Retro buttons */}
          <div className={styles.buttons}>
            <button onClick={onClose} className={styles.continueButton}>
              CREATE ANOTHER
            </button>
            <a 
              href={gameUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.playButton}
            >
              HOST NOW
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}