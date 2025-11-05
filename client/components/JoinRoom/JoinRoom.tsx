"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./JoinRoom.module.css";
import { checkGameCode } from "@/app/api/game/actions";

interface JoinRoomProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinRoom({ isOpen, onClose }: JoinRoomProps) {
  const [gameCode, setGameCode] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanError, setScanError] = useState("");
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
        video: { facingMode: "environment" } 
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
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Handle join game
  const [loading, setLoading] = useState(false);

const handleJoinGame = async () => {
  if (gameCode.length !== 6) {
    setScanError("Please enter a 6-digit game code");
    return;
  }

  setLoading(true);
  setScanError("");
  try {
    const { exists } = await checkGameCode(gameCode);
    if (exists) router.push(`/play/${gameCode}`);
    else setScanError("❌ Game not found. Please check your code.");
  } catch {
    setScanError("⚠️ Failed to verify game code. Try again.");
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

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.pixelTitle}>🎮 JOIN GAME 🎮</div>
          <button onClick={handleClose} className={styles.closeButton}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Game Code Input */}
          <div className={styles.inputSection}>
            <label className={styles.label}>ENTER GAME CODE:</label>
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
                  {cameraActive ? "📷" : "📸"}
                </button>
              )}
            </div>
            <div className={styles.codeHint}>6 characters (A-Z, 0-9)</div>
          </div>

          {/* Camera Preview */}
          {cameraActive && (
            <div className={styles.cameraSection}>
              <div className={styles.cameraLabel}>Scan QR Code:</div>
              <div className={styles.cameraPreview}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className={styles.video}
                />
                <div className={styles.scanFrame}></div>
              </div>
              <div className={styles.cameraHint}>
                Point camera at QR code to scan
              </div>
            </div>
          )}

          {/* Error Message */}
          {scanError && (
            <div className={styles.errorMessage}>
              ⚠️ {scanError}
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.buttons}>
            <button
                onClick={handleJoinGame}
                disabled={gameCode.length !== 6 || loading}
                className={styles.joinButton}
                >
                {loading ? "CHECKING..." : "JOIN GAME"}
            </button>

            <button onClick={handleClose} className={styles.cancelButton}>
              CANCEL
            </button>
          </div>

          {/* Manual Entry Hint */}
          {!cameraActive && isMobile && (
            <div className={styles.mobileHint}>
              💡 Tip: Use camera button to scan QR code
            </div>
          )}
        </div>
      </div>
    </div>
  );
}