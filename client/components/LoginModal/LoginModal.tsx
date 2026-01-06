"use client";
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import styles from "./LoginModal.module.css";
import { googleAuth } from "@/app/api/users/actions";
import Toast, { ToastType } from "@/components/Toast/Toast";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { FloppyDisk, ChartBar, GameController } from "@phosphor-icons/react";

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
      const result = await signIn("google", { redirect: false });

      if (result?.error) {
        console.error("Google login failed:", result.error);
        showToast("Google login failed. Please try again.", "error");
        setIsLoading(false);
        return;
      }

      showToast("Google authentication successful!", "success");

      setTimeout(async () => {
        const user = session?.user;
        if (user && user.email) {
          try {
            showToast("Setting up your account...", "info");

            await googleAuth({
              name: user.name?.split(" ")[0] || "",
              lastname: user.name?.split(" ")[1] || "",
              email: user.email,
            });

            showToast("Account setup complete! Welcome!", "success");

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
          {/* Login Animation */}
          <div className={styles.iconContainer}>
            <DotLottieReact
              src="https://lottie.host/680e2dcb-5282-4f3f-b66d-d97887aac705/49C552puuV.lottie"
              loop
              autoplay
              className={styles.lottieAnimation}
            />
          </div>

          {/* Title */}
          <h2 className={styles.title}>Welcome Back!</h2>

          {/* Message */}
          <p className={styles.message}>
            Sign in to save your games, track progress, and access your created quizzes anytime.
          </p>

          {/* Google Login Button */}
          <button onClick={handleGoogleLogin} disabled={isLoading} className={styles.googleButton}>
            {isLoading ? (
              <div className={styles.loadingSpinner}>
                <div className={styles.spinnerDot}></div>
                <div className={styles.spinnerDot}></div>
                <div className={styles.spinnerDot}></div>
              </div>
            ) : (
              <>
                <div className={styles.googleIcon}>G</div>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Features */}
          <div className={styles.features}>
            <div className={styles.featuresLabel}>What you get:</div>
            <div className={styles.feature}>
              <FloppyDisk size={24} weight="duotone" className={styles.featureIcon} />
              <span>Save and manage your game creations</span>
            </div>
            <div className={styles.feature}>
              <ChartBar size={24} weight="duotone" className={styles.featureIcon} />
              <span>Track player statistics and performance</span>
            </div>
            <div className={styles.feature}>
              <GameController size={24} weight="duotone" className={styles.featureIcon} />
              <span>Access your games from any device</span>
            </div>
          </div>

          {/* Privacy Note */}
          <div className={styles.privacyNote}>
            We only access your email. No spam, just fun quizzes!
          </div>

          {/* Close Button */}
          <button onClick={onClose} className={styles.closeButton} aria-label="Close">
            ✕
          </button>
        </div>
      </div>
    </>
  );
}
