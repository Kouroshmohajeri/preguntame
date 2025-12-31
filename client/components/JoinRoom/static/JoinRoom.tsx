"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  GameController,
  X,
  Camera,
  CameraSlash,
  QrCode,
  ArrowRight,
  User,
  Lightning,
  Users,
  Trophy,
} from "@phosphor-icons/react";
import { checkGameCode } from "@/app/api/game/actions";
import styles from "./JoinRoom.module.css";

export default function JoinRoom() {
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
      setScanError("");
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle submit
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (gameCode.length !== 6) {
      setScanError("Please enter a valid 6-digit game code");
      return;
    }

    setLoading(true);
    setScanError("");

    try {
      const { exists } = await checkGameCode(gameCode);
      if (exists) {
        router.push(`/play/guest/${gameCode}`);
      } else {
        setScanError("Game not found. Please check your code and try again.");
      }
    } catch {
      setScanError("Failed to verify game code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.contentWrapper}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <a href="/" className={styles.breadcrumbLink}>
            Home
          </a>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>Join Game</span>
        </nav>

        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroIcon}>
            <GameController size={64} weight="fill" />
          </div>
          <h1 className={styles.mainTitle}>Join Live Game</h1>
          <p className={styles.subtitle}>
            Enter your 6-digit game code to join a live quiz and compete with other players in
            real-time.
          </p>

          {/* Pixel Separator */}
          <div className={styles.pixelSeparator}>
            {[...Array(15)].map((_, i) => (
              <div key={i} className={styles.pixel} style={{ "--i": i } as React.CSSProperties} />
            ))}
          </div>
        </section>

        {/* Main Form Card */}
        <div className={styles.formCard}>
          <form onSubmit={handleSubmit}>
            {/* Game Code Input */}
            <div className={styles.inputSection}>
              <label htmlFor="gameCode" className={styles.label}>
                <User size={18} weight="fill" />
                Game Code
              </label>

              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  id="gameCode"
                  value={gameCode}
                  onChange={handleInputChange}
                  placeholder="ABC123"
                  maxLength={6}
                  className={styles.codeInput}
                  autoComplete="off"
                  autoFocus
                />
                {isMobile && (
                  <button
                    type="button"
                    onClick={cameraActive ? stopCamera : startCamera}
                    className={styles.cameraButton}
                    aria-label={cameraActive ? "Stop camera" : "Start camera"}
                  >
                    {cameraActive ? (
                      <CameraSlash size={24} weight="fill" />
                    ) : (
                      <Camera size={24} weight="fill" />
                    )}
                  </button>
                )}
              </div>

              <p className={styles.inputHint}>
                <QrCode size={14} weight="bold" />
                Enter 6 characters (A-Z, 0-9)
              </p>
            </div>

            {/* Camera Section */}
            {cameraActive && (
              <div className={styles.cameraSection}>
                <div className={styles.cameraLabel}>
                  <QrCode size={18} weight="fill" />
                  Scan QR Code
                </div>
                <div className={styles.cameraPreview}>
                  <video ref={videoRef} autoPlay playsInline className={styles.video} />
                  <div className={styles.scanFrame}>
                    <div className={styles.scanCorner} />
                    <div className={styles.scanCorner} />
                    <div className={styles.scanCorner} />
                    <div className={styles.scanCorner} />
                  </div>
                </div>
                <p className={styles.cameraHint}>Point your camera at the QR code</p>
              </div>
            )}

            {/* Error Message */}
            {scanError && (
              <div className={styles.errorMessage} role="alert">
                <X size={18} weight="bold" />
                {scanError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={gameCode.length !== 6 || loading}
              className={styles.submitButton}
            >
              {loading ? (
                <span className={styles.loadingText}>Checking...</span>
              ) : (
                <>
                  <span>Join Game</span>
                  <ArrowRight size={20} weight="bold" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Feature Cards */}
        <section className={styles.featuresSection}>
          <div className={styles.featureCard}>
            <Lightning size={32} weight="fill" />
            <h3>Instant Join</h3>
            <p>No registration required. Enter code and play immediately.</p>
          </div>

          <div className={styles.featureCard}>
            <Users size={32} weight="fill" />
            <h3>Multiplayer</h3>
            <p>Compete with other players in real-time quiz battles.</p>
          </div>

          <div className={styles.featureCard}>
            <Trophy size={32} weight="fill" />
            <h3>Live Scoring</h3>
            <p>See your rank update instantly as you answer questions.</p>
          </div>
        </section>

        {/* How to Join Section */}
        <section className={styles.howToSection}>
          <h2 className={styles.sectionTitle}>How to Join</h2>
          <div className={styles.stepsList}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Get Game Code</h3>
                <p>Ask your host for the 6-digit game code or scan the QR code on screen.</p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Enter Code</h3>
                <p>Type the code above or use your camera to scan the QR code.</p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Choose Name</h3>
                <p>Pick a display name and avatar to represent yourself in the game.</p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3>Play & Win</h3>
                <p>Answer questions quickly and accurately to climb the leaderboard.</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.poweredBy}>Designed & Powered by WebGallery</p>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} Pregúntame. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
