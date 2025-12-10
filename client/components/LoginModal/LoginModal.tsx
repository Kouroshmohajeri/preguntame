"use client";
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import styles from "./LoginModal.module.css";
import { googleAuth } from "@/app/api/users/actions";
import Toast, { ToastType } from "@/components/Toast/Toast";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const [toasts, setToasts] = useState<{ id: number; message: string; type: ToastType }[]>([]);

  // Toast helper functions
  const showToast = (message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 5000);

    return id;
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    showToast("Connecting to Google...", "info");

    try {
      // Trigger Google OAuth popup
      const result = await signIn("google", { redirect: false });

      if (result?.error) {
        console.error("Google login failed:", result.error);
        showToast("Google login failed. Please try again.", "error");
        setIsLoading(false);
        return;
      }

      showToast("Google authentication successful!", "success");

      // Wait a bit for session to populate
      setTimeout(async () => {
        const user = session?.user;
        if (user && user.email) {
          try {
            showToast("Setting up your account...", "info");

            // Send to backend to create/get user
            await googleAuth({
              name: user.name?.split(" ")[0] || "",
              lastname: user.name?.split(" ")[1] || "",
              email: user.email,
            });

            showToast("Account setup complete! Welcome!", "success");

            // Small delay to show success toast
            setTimeout(() => {
              setIsLoading(false);
              onClose();
              onLoginSuccess();
            }, 1000);
          } catch (error) {
            console.error("Account setup error:", error);
            showToast("Failed to setup account. Please try again.", "error");
            setIsLoading(false);
          }
        } else {
          showToast("User information not found. Please try again.", "warning");
          setIsLoading(false);
        }
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      showToast("Login failed. Please try again.", "error");
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Toast Container */}
      <div className={styles.toastContainer}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={5000}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      <div className={styles.overlay}>
        <div className={styles.modal}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.pixelTitle}>🔐 LOGIN / REGISTER 🔐</div>
            <button onClick={onClose} className={styles.closeButton}>
              ✕
            </button>
          </div>

          {/* Content */}
          <div className={styles.content}>
            {/* Retro Computer Graphic */}
            <div className={styles.computerGraphic}>
              <div className={styles.monitor}>
                <div className={styles.screen}>
                  <div className={styles.pixelText}>PREGÚNTAME</div>
                  <div className={styles.loadingBar}>
                    <div className={styles.loadingPixel}></div>
                    <div className={styles.loadingPixel}></div>
                    <div className={styles.loadingPixel}></div>
                  </div>
                </div>
              </div>
              <div className={styles.keyboard}></div>
            </div>

            {/* Message */}
            <div className={styles.message}>
              Join the PREGÚNTAME!
              <br />
              Save your games and track progress.
            </div>

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className={styles.googleButton}
            >
              {isLoading ? (
                <div className={styles.loadingSpinner}>
                  <div className={styles.spinnerPixel}></div>
                  <div className={styles.spinnerPixel}></div>
                  <div className={styles.spinnerPixel}></div>
                </div>
              ) : (
                <>
                  <div className={styles.googleIcon}>G</div>
                  <span>CONTINUE WITH GOOGLE</span>
                </>
              )}
            </button>

            {/* Features */}
            <div className={styles.features}>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>💾</span>
                Save your game creations
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>📊</span>
                Track player statistics
              </div>
            </div>

            {/* Privacy Note */}
            <div className={styles.privacyNote}>We only access your email. No spam, just fun!</div>
          </div>
        </div>
      </div>
    </>
  );
}
