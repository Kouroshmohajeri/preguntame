"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  GoogleLogo,
  FloppyDisk,
  ChartBar,
  Trophy,
  Lightning,
  ShieldCheck,
  ArrowRight,
} from "@phosphor-icons/react";
import PixelMenu from "@/components/PixelMenu/PixelMenu";
import Toast, { ToastType } from "@/components/Toast/Toast";
import { googleAuth } from "@/app/api/users/actions";
import styles from "./AuthPage.module.css";

export default function AuthPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; message: string; type: ToastType }[]>([]);

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

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

            // Redirect to dashboard
            setTimeout(() => {
              router.push("/dashboard");
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

  if (status === "loading") {
    return (
      <>
        <PixelMenu currentPage="auth" alwaysHamburger={false} />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}>
            <div className={styles.pixel}></div>
            <div className={styles.pixel}></div>
            <div className={styles.pixel}></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PixelMenu currentPage="auth" alwaysHamburger={false} />

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

      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          {/* Left Side - Hero */}
          <div className={styles.heroSection}>
            <div className={styles.heroIcon}>
              <User size={64} weight="fill" />
            </div>

            <h1 className={styles.mainTitle}>Welcome Back!</h1>
            <p className={styles.subtitle}>
              Sign in to access your quiz dashboard, save games, and track player statistics.
            </p>

            {/* Breadcrumb */}
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <a href="/" className={styles.breadcrumbLink}>
                Home
              </a>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.breadcrumbCurrent}>Login</span>
            </nav>

            {/* Pixel Separator */}
            <div className={styles.pixelSeparator} aria-hidden="true">
              {[...Array(10)].map((_, i) => (
                <div key={i} className={styles.pixel} style={{ "--i": i } as React.CSSProperties} />
              ))}
            </div>

            {/* Features List */}
            <div className={styles.featuresList}>
              <div className={styles.featureItem}>
                <FloppyDisk size={28} weight="fill" />
                <div className={styles.featureText}>
                  <h3>Save Your Quizzes</h3>
                  <p>Keep all your quiz creations in one place</p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <ChartBar size={28} weight="fill" />
                <div className={styles.featureText}>
                  <h3>Track Statistics</h3>
                  <p>View detailed player performance analytics</p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <Trophy size={28} weight="fill" />
                <div className={styles.featureText}>
                  <h3>Game History</h3>
                  <p>Access past games and results anytime</p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <Lightning size={28} weight="fill" />
                <div className={styles.featureText}>
                  <h3>Quick Access</h3>
                  <p>Jump right into creating or hosting quizzes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Card */}
          <div className={styles.loginSection}>
            <div className={styles.loginCard}>
              {/* Card Header */}
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <ShieldCheck size={40} weight="fill" />
                </div>
                <h2 className={styles.cardTitle}>Login / Register</h2>
                <p className={styles.cardSubtitle}>One click to access your quiz dashboard</p>
              </div>

              {/* Retro Computer Animation */}
              <div className={styles.computerGraphic}>
                <div className={styles.monitor}>
                  <div className={styles.screen}>
                    <div className={styles.screenText}>PREGÚNTAME</div>
                    <div className={styles.loadingBar}>
                      <div className={styles.loadingPixel}></div>
                      <div className={styles.loadingPixel}></div>
                      <div className={styles.loadingPixel}></div>
                    </div>
                  </div>
                </div>
                <div className={styles.keyboard}></div>
              </div>

              {/* Google Login Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className={styles.googleButton}
                aria-label="Sign in with Google"
              >
                {isLoading ? (
                  <div className={styles.buttonLoading}>
                    <div className={styles.spinnerPixel}></div>
                    <div className={styles.spinnerPixel}></div>
                    <div className={styles.spinnerPixel}></div>
                  </div>
                ) : (
                  <>
                    <GoogleLogo size={24} weight="bold" />
                    <span>Continue with Google</span>
                    <ArrowRight size={20} weight="bold" />
                  </>
                )}
              </button>

              {/* Privacy & Security */}
              <div className={styles.securityBadges}>
                <div className={styles.badge}>
                  <ShieldCheck size={16} weight="fill" />
                  Secure Login
                </div>
                <div className={styles.badge}>
                  <ShieldCheck size={16} weight="fill" />
                  No Spam
                </div>
                <div className={styles.badge}>
                  <ShieldCheck size={16} weight="fill" />
                  100% Free
                </div>
              </div>

              {/* Privacy Note */}
              <div className={styles.privacyNote}>
                <p>
                  We only access your email address. Your data is secure and we never spam. By
                  signing in, you agree to our{" "}
                  <a href="/privacy" className={styles.privacyLink}>
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className={styles.quickLinks}>
              <p className={styles.quickLinksTitle}>Don't need an account?</p>
              <div className={styles.linkButtons}>
                <button onClick={() => router.push("/create")} className={styles.linkButton}>
                  Create Quiz
                </button>
                <button onClick={() => router.push("/join-room")} className={styles.linkButton}>
                  Join Game
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <p className={styles.poweredBy}>Designed & Powered by WebGallery</p>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Pregúntame. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}
