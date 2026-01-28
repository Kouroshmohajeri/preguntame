// components/WizardInfoPage/WizardInfoClient.tsx
"use client";
import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Robot,
  Lightning,
  FileText,
  Link as LinkIcon,
  YoutubeLogo,
  Sparkle,
  CheckCircle,
  ArrowRight,
  Clock,
  Coin,
  House,
  CaretRight,
} from "@phosphor-icons/react";
import { checkBetaAccessStatus } from "@/app/api/betaAccess/actions";
import { useToast } from "@/context/ToastContext/ToastContext";
import BetaAccessModal from "@/components/Dashboard/SubscriptionTab/BetaAccessModal/BetaAccessModal";
import LoginModal from "@/components/LoginModal/LoginModal";
import styles from "./WizardInfoClient.module.css";

// Separate component that uses useSearchParams
function WizardInfoContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [showBetaModal, setShowBetaModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [betaStatus, setBetaStatus] = useState<"none" | "pending" | "approved">("none");
  const [licenseStatus, setLicenseStatus] = useState<"active" | "expired" | "revoked" | "none">(
    "none"
  );
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      checkStatus();
    }
  }, [status, session]);

  // Check if redirected from login with callbackUrl
  useEffect(() => {
    const callbackUrl = searchParams.get("callbackUrl");
    if (callbackUrl && status === "unauthenticated") {
      setShowLoginModal(true);
    }
  }, [searchParams, status]);

  const checkStatus = async () => {
    if (!session?.user?.email) return;

    setIsLoading(true);
    try {
      const response = await checkBetaAccessStatus(session.user.email);

      if (response.success && response.request) {
        setBetaStatus(response.status || "none");
        if (response.request.licenseStatus) {
          setLicenseStatus(response.request.licenseStatus);
        }
        if (response.request.licenseKey) {
          setLicenseKey(response.request.licenseKey);
        }
        if (response.request.creditsRemaining !== undefined) {
          setCreditsRemaining(response.request.creditsRemaining);
        }
      } else {
        setBetaStatus(response.status || "none");
      }
    } catch (error) {
      console.error("Error checking beta status:", error);
      setBetaStatus("none");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAccess = () => {
    if (status !== "authenticated") {
      setShowLoginModal(true);
      return;
    }
    setShowBetaModal(true);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    showToast("Welcome! You can now request beta access.", "success");
    if (session?.user?.email) {
      checkStatus();
    }
  };

  const handleUseWizard = () => {
    if (betaStatus !== "approved") {
      showToast("Your beta access is not approved yet.", "warning");
      return;
    }

    if (licenseStatus !== "active") {
      showToast("Your license is not active. It may be revoked or expired.", "error");
      return;
    }

    if (!licenseKey) {
      showToast("License key not found.", "error");
      return;
    }

    if (creditsRemaining <= 0) {
      showToast("You have no AI credits remaining.", "warning");
      return;
    }

    router.push(`/create/wizard/${licenseKey}`);
  };

  const handleStatusChange = (hasRequested: boolean) => {
    if (hasRequested) {
      setBetaStatus("pending");
      checkStatus();
    }
  };

  const isFullyActive =
    betaStatus === "approved" && licenseStatus === "active" && creditsRemaining > 0;
  const hasNoCredits =
    betaStatus === "approved" && licenseStatus === "active" && creditsRemaining <= 0;

  const features = [
    {
      icon: <Sparkle size={48} weight="fill" />,
      title: "AI Prompts",
      description:
        "Generate quizzes from simple text prompts. Just describe your topic and let AI do the magic!",
    },
    {
      icon: <FileText size={48} weight="fill" />,
      title: "Document Upload",
      description:
        "Upload PDFs, Word docs, or text files to create instant quizzes from your content.",
    },
    {
      icon: <LinkIcon size={48} weight="fill" />,
      title: "Website URLs",
      description:
        "Paste any website URL and let AI extract content to generate engaging questions.",
    },
    {
      icon: <YoutubeLogo size={48} weight="fill" />,
      title: "YouTube Videos",
      description: "Turn YouTube video transcripts into interactive quiz questions automatically.",
    },
  ];

  return (
    <>
      <div className={styles.mainContainer}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          {/* Breadcrumb */}
          <div className={styles.breadcrumb}>
            <Link href="/" className={styles.breadcrumbLink}>
              <House size={16} weight="fill" /> Home
            </Link>
            <span className={styles.breadcrumbSeparator}>
              <CaretRight size={16} weight="bold" />
            </span>
            <span className={styles.breadcrumbCurrent}>Pregúntame Wizard (AI)</span>
          </div>

          {/* Hero Icon */}
          <div className={styles.heroIcon}>
            <Robot size={64} weight="fill" />
          </div>

          {/* Beta Badge */}
          <div className={styles.betaBadge}>
            <Lightning size={16} weight="fill" />
            BETA VERSION - FREE ACCESS
          </div>

          {/* Main Title */}
          <h1 className={styles.mainTitle}>
            PREGÚNTAME WIZARD <span className={styles.aiLabel}>(AI)</span>
          </h1>

          {/* Intro Text */}
          <div className={styles.introText}>
            <p>
              Create engaging quizzes instantly with our AI-powered question generator. Transform
              prompts, documents, URLs, and YouTube videos into interactive learning experiences.
            </p>
          </div>

          {/* Hero Stats */}
          <div className={styles.heroStats}>
            <div className={styles.statBox}>
              <span className={styles.statNumber}>500</span>
              <span className={styles.statLabel}>FREE CREDITS</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statNumber}>4</span>
              <span className={styles.statLabel}>INPUT METHODS</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statNumber}>∞</span>
              <span className={styles.statLabel}>POSSIBILITIES</span>
            </div>
          </div>

          {/* CTA Button */}
          {status === "authenticated" ? (
            isFullyActive ? (
              <button
                onClick={handleUseWizard}
                className={`${styles.heroCta} ${styles.activeButton}`}
              >
                <Robot size={24} weight="fill" />
                USE PREGÚNTAME WIZARD
                <ArrowRight size={24} weight="bold" />
              </button>
            ) : hasNoCredits ? (
              <button className={`${styles.heroCta} ${styles.disabledButton}`} disabled>
                <Coin size={24} weight="fill" />
                NO CREDITS REMAINING
              </button>
            ) : betaStatus === "pending" ? (
              <button className={`${styles.heroCta} ${styles.disabledButton}`} disabled>
                <Clock size={24} weight="fill" />
                REQUEST PENDING
              </button>
            ) : (
              <button onClick={handleGetAccess} className={styles.heroCta} disabled={isLoading}>
                <Robot size={24} weight="fill" />
                REQUEST BETA ACCESS
              </button>
            )
          ) : (
            <button onClick={handleGetAccess} className={styles.heroCta}>
              <Robot size={24} weight="fill" />
              GET STARTED - IT'S FREE
            </button>
          )}
        </section>

        {/* Pixel Separator */}
        <div className={styles.pixelSeparator}>
          {[...Array(10)].map((_, i) => (
            <div key={i} className={styles.pixel} style={{ "--i": i } as React.CSSProperties}></div>
          ))}
        </div>

        {/* Features Section */}
        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>
            <Sparkle size={32} weight="fill" />4 POWERFUL WAYS TO CREATE
          </h2>

          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pixel Separator */}
        <div className={styles.pixelSeparator}>
          {[...Array(10)].map((_, i) => (
            <div key={i} className={styles.pixel} style={{ "--i": i } as React.CSSProperties}></div>
          ))}
        </div>

        {/* Beta Access Section */}
        <section className={styles.betaSection}>
          <div className={styles.betaCard}>
            <div className={styles.betaCardHeader}>
              <div className={styles.betaIconWrapper}>
                <div className={styles.betaIcon}>
                  <Robot size={48} weight="fill" />
                </div>
              </div>

              <div className={styles.betaBadgeSmall}>
                <Lightning size={16} weight="fill" />
                {isFullyActive ? "ACCESS GRANTED" : hasNoCredits ? "NO CREDITS" : "BETA ACCESS"}
              </div>
            </div>

            <h3 className={styles.betaTitle}>GET EARLY ACCESS NOW!</h3>
            <p className={styles.betaDescription}>
              We're currently in beta! Anyone with a Pregúntame account can try the full version for
              free. Just login to your account, find <strong>AI ACCESS</strong>, request beta
              access, and get <strong>500 AI credits</strong>. Easy!
            </p>

            <div className={styles.betaFeatures}>
              <div className={styles.betaFeatureItem}>
                <CheckCircle size={18} weight="fill" />
                <span>500 FREE AI Credits</span>
              </div>
              <div className={styles.betaFeatureItem}>
                <CheckCircle size={18} weight="fill" />
                <span>Full Access to All Features</span>
              </div>
              <div className={styles.betaFeatureItem}>
                <CheckCircle size={18} weight="fill" />
                <span>Approval Within 2 Hours</span>
              </div>
              <div className={styles.betaFeatureItem}>
                <CheckCircle size={18} weight="fill" />
                <span>No Credit Card Required</span>
              </div>
            </div>

            <div className={styles.betaInfo}>
              <div className={styles.betaInfoItem}>
                <span className={styles.betaLabel}>
                  {isFullyActive || hasNoCredits ? "CREDITS REMAINING" : "BETA CREDITS"}
                </span>
                <span
                  className={styles.betaValue}
                  style={creditsRemaining === 0 ? { color: "#E53E3E" } : {}}
                >
                  {isFullyActive || hasNoCredits ? creditsRemaining : "500 FREE"}
                </span>
              </div>
              <div className={styles.betaInfoItem}>
                <span className={styles.betaLabel}>STATUS</span>
                <span className={styles.betaStatus}>
                  {isFullyActive
                    ? "ACTIVE"
                    : hasNoCredits
                      ? "NO CREDITS"
                      : betaStatus === "pending"
                        ? "PENDING"
                        : "AVAILABLE"}
                </span>
              </div>
            </div>

            {status === "authenticated" ? (
              isFullyActive ? (
                <button
                  onClick={handleUseWizard}
                  className={`${styles.betaButton} ${styles.activeButton}`}
                >
                  <Robot size={20} weight="fill" />
                  USE PREGÚNTAME WIZARD
                  <ArrowRight size={20} weight="bold" />
                </button>
              ) : hasNoCredits ? (
                <button className={`${styles.betaButton} ${styles.disabledButton}`} disabled>
                  <Coin size={20} weight="fill" />
                  NO CREDITS REMAINING
                </button>
              ) : betaStatus === "pending" ? (
                <button className={`${styles.betaButton} ${styles.disabledButton}`} disabled>
                  <Clock size={20} weight="fill" />
                  REQUEST SUBMITTED
                </button>
              ) : (
                <button onClick={handleGetAccess} className={styles.betaButton}>
                  <Robot size={20} weight="fill" />
                  REQUEST BETA ACCESS
                </button>
              )
            ) : (
              <button onClick={handleGetAccess} className={styles.betaButton}>
                <Robot size={20} weight="fill" />
                SIGN IN TO REQUEST ACCESS
              </button>
            )}

            <p className={styles.betaNote}>
              {betaStatus === "pending"
                ? "We'll review your request and grant access within 2 hours"
                : isFullyActive
                  ? `License: ${licenseKey} | ${creditsRemaining} credits remaining`
                  : hasNoCredits
                    ? "You have used all your AI credits. Contact support to get more."
                    : "Early access users get 500 free AI credits to test the feature"}
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <p className={styles.poweredBy}>Powered by Pregúntame</p>
          <p className={styles.copyright}>© 2026 Pregúntame. All rights reserved.</p>
        </footer>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Beta Access Modal */}
      {session?.user && (
        <BetaAccessModal
          isOpen={showBetaModal}
          onClose={() => setShowBetaModal(false)}
          userEmail={session.user.email || ""}
          userName={session.user.name || ""}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
}

// Main export with Suspense boundary
export default function WizardInfoClient() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WizardInfoContent />
    </Suspense>
  );
}
