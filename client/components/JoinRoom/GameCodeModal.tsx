"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./GameCodeModal.module.css";
import { checkGameCode } from "@/app/api/game/actions";
import {
  GameController,
  Trophy,
  X,
  Camera,
  CameraSlash,
  QrCode,
  ArrowRight,
  User,
  ChartBar,
} from "@phosphor-icons/react";

export type ModalType = "join" | "leaderboard";

interface GameCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ModalType;
}

export default function GameCodeModal({ isOpen, onClose, type }: GameCodeModalProps) {
  const [gameCode, setGameCode] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanError, setScanError] = useState("");
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    checkMobile();
  }, []);

  // Handle game code input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (value.length <= 6) {
      setGameCode(value);
    }
  };

  // Start camera for QR scanning
  const startCamera = async () => {
    try {
      setScanError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error("Camera error:", error);
      setScanError("Could not access camera. Please enter code manually.");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Handle submit based on modal type
  const handleSubmit = async () => {
    if (gameCode.length !== 6) {
      setScanError("Please enter a 6-digit game code");
      return;
    }

    setLoading(true);
    setScanError("");
    try {
      const { exists } = await checkGameCode(gameCode);
      if (exists) {
        if (type === "join") {
          router.push(`/play/guest/${gameCode}`);
        } else {
          router.push(`/leaderboard/${gameCode}`);
        }
        handleClose();
      } else {
        setScanError(`❌ Game not found. Please check your code.`);
      }
    } catch {
      setScanError(`⚠️ Failed to verify game code. Try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Close modal and cleanup
  const handleClose = () => {
    stopCamera();
    setGameCode("");
    setScanError("");
    onClose();
  };

  if (!isOpen) return null;

  const modalTitle = type === "join" ? "JOIN GAME" : "VIEW LEADERBOARD";
  const submitButtonText = type === "join" ? "JOIN GAME" : "VIEW LEADERBOARD";
  const modalIcon =
    type === "join" ? (
      <GameController size={32} weight="fill" className={styles.modalIcon} />
    ) : (
      <Trophy size={32} weight="fill" className={styles.modalIcon} />
    );

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.modalHeaderContent}>
            {modalIcon}
            <div className={styles.pixelTitle}>{modalTitle}</div>
          </div>
          <button onClick={handleClose} className={styles.closeButton}>
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Game Code Input */}
          <div className={styles.inputSection}>
            <label className={styles.label}>
              <User size={16} weight="fill" className={styles.labelIcon} />
              ENTER GAME CODE:
            </label>
            <div className={styles.inputContainer}>
              <input
                type="text"
                value={gameCode}
                onChange={handleInputChange}
                placeholder="ABCD12"
                maxLength={6}
                className={styles.codeInput}
              />
              {isMobile && (
                <button
                  onClick={cameraActive ? stopCamera : startCamera}
                  className={styles.cameraButton}
                >
                  {cameraActive ? (
                    <CameraSlash size={24} weight="fill" />
                  ) : (
                    <Camera size={24} weight="fill" />
                  )}
                </button>
              )}
            </div>
            <div className={styles.codeHint}>
              <QrCode size={12} weight="bold" />6 characters (A-Z, 0-9)
            </div>
          </div>

          {/* Camera Preview */}
          {cameraActive && (
            <div className={styles.cameraSection}>
              <div className={styles.cameraLabel}>
                <QrCode size={16} weight="fill" className={styles.labelIcon} />
                Scan QR Code:
              </div>
              <div className={styles.cameraPreview}>
                <video ref={videoRef} autoPlay playsInline className={styles.video} />
                <div className={styles.scanFrame}>
                  <QrCode size={40} weight="fill" className={styles.qrIcon} />
                </div>
              </div>
              <div className={styles.cameraHint}>Point camera at QR code to scan</div>
            </div>
          )}

          {/* Error Message */}
          {scanError && <div className={styles.errorMessage}>⚠️ {scanError}</div>}

          {/* Action Buttons */}
          <div className={styles.buttons}>
            <button
              onClick={handleSubmit}
              disabled={gameCode.length !== 6 || loading}
              className={styles.submitButton}
            >
              {loading ? (
                "CHECKING..."
              ) : (
                <>
                  {submitButtonText}
                  <ArrowRight size={20} weight="bold" className={styles.buttonIcon} />
                </>
              )}
            </button>

            <button onClick={handleClose} className={styles.cancelButton}>
              CANCEL
            </button>
          </div>

          {/* Manual Entry Hint */}
          {!cameraActive && isMobile && (
            <div className={styles.mobileHint}>💡 Tip: Use camera button to scan QR code</div>
          )}
        </div>
      </div>
    </div>
  );
}
