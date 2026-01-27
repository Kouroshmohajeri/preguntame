"use client";
import { useState, useEffect } from "react";
import {
  Crown,
  CheckCircle,
  Robot,
  Lightning,
  Clock,
  Sparkle,
  ArrowRight,
  XCircle,
  Coin,
} from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { checkBetaAccessStatus } from "@/app/api/betaAccess/actions";
import { useToast } from "@/context/ToastContext/ToastContext";
import styles from "./SubscriptionTab.module.css";
import BetaAccessModal from "./BetaAccessModal/BetaAccessModal";

interface Props {
  stats: {
    totalGames: number;
  };
  userEmail: string;
  userName: string;
}

export default function SubscriptionTab({ stats, userEmail, userName }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [betaStatus, setBetaStatus] = useState<"none" | "pending" | "approved">("none");
  const [licenseStatus, setLicenseStatus] = useState<"active" | "expired" | "revoked" | "none">(
    "none"
  );
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ CHECK FOR LICENSE VALIDATION ERRORS ON MOUNT
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      const errorMessages: Record<string, string> = {
        invalid_license: "Invalid license key. Please check your beta access.",
        unauthorized_license: "This license does not belong to your account.",
        not_approved: "Your beta access is not approved yet. Please wait for approval.",
        license_inactive: "Your license has been revoked or expired.",
        no_credits: "You have no AI credits remaining.",
        validation_failed: "Failed to validate license. Please try again.",
        unauthorized: "Please log in to access the AI Wizard.",
      };

      const message = errorMessages[error] || "An error occurred. Please try again.";
      showToast(message, "error");
    }
  }, [searchParams, showToast]);

  // Check beta access status on component mount
  useEffect(() => {
    const checkStatus = async () => {
      if (!userEmail) return;

      try {
        const response = await checkBetaAccessStatus(userEmail);

        console.log("Beta access response:", response);

        if (response.success && response.request) {
          setBetaStatus(response.status || "none");

          // ✅ Extract license status
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

    checkStatus();
  }, [userEmail]);

  const handleBetaAccess = () => {
    setShowModal(true);
  };

  const handleUseWizard = () => {
    // ✅ Check both status AND licenseStatus
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

    // All checks passed - navigate to wizard
    router.push(`/create/wizard/${licenseKey}`);
  };

  const handleStatusChange = (hasRequested: boolean) => {
    if (hasRequested) {
      setBetaStatus("pending");
    }
  };

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Robot size={20} weight="fill" />
          LOADING...
        </>
      );
    }

    // ✅ No credits - show disabled state
    if (betaStatus === "approved" && licenseStatus === "active" && creditsRemaining <= 0) {
      return (
        <>
          <Coin size={20} weight="fill" />
          NO CREDITS REMAINING
        </>
      );
    }

    // ✅ Check both conditions for active status
    if (betaStatus === "approved" && licenseStatus === "active" && creditsRemaining > 0) {
      return (
        <>
          <Robot size={20} weight="fill" />
          USE PREGÚNTAME WIZARD
          <ArrowRight size={20} weight="bold" />
        </>
      );
    }

    if (betaStatus === "approved" && licenseStatus !== "active") {
      return (
        <>
          <XCircle size={20} weight="fill" />
          LICENSE {licenseStatus.toUpperCase()}
        </>
      );
    }

    if (betaStatus === "pending") {
      return (
        <>
          <Clock size={20} weight="fill" />
          REQUEST SUBMITTED
        </>
      );
    }

    return (
      <>
        <Robot size={20} weight="fill" />
        REQUEST BETA ACCESS
      </>
    );
  };

  // ✅ Determine actual active status (must have credits!)
  const isFullyActive =
    betaStatus === "approved" && licenseStatus === "active" && creditsRemaining > 0;
  const hasNoCredits =
    betaStatus === "approved" && licenseStatus === "active" && creditsRemaining <= 0;

  const isRequestButtonDisabled = betaStatus === "pending" || isLoading;
  const showRequestButton = !isFullyActive && betaStatus !== "pending" && !hasNoCredits;
  const showUseButton = isFullyActive && licenseKey;
  const showInactiveButton = betaStatus === "approved" && licenseStatus !== "active";
  const showNoCreditsButton = hasNoCredits;

  return (
    <>
      <div className={styles.subscriptionSection} id="ai-access">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Sparkle size={28} weight="fill" className={styles.titleIcon} />
            PREGÚNTAME WIZARD (AI) - EARLY ACCESS
          </h2>
        </div>

        <div className={styles.subscriptionContent}>
          <div className={styles.aiFeatureCard}>
            <div className={styles.aiHeader}>
              <div className={styles.aiIconWrapper}>
                <div className={styles.aiIcon}>
                  <Robot size={48} weight="fill" />

                  <div
                    className={styles.particle}
                    style={{ "--delay": "0s" } as React.CSSProperties}
                  ></div>
                  <div
                    className={styles.particle}
                    style={{ "--delay": "0.5s" } as React.CSSProperties}
                  ></div>
                  <div
                    className={styles.particle}
                    style={{ "--delay": "1s" } as React.CSSProperties}
                  ></div>
                  <div
                    className={styles.particle}
                    style={{ "--delay": "1.5s" } as React.CSSProperties}
                  ></div>
                  <div
                    className={styles.particle}
                    style={{ "--delay": "2s" } as React.CSSProperties}
                  ></div>
                  <div
                    className={styles.particle}
                    style={{ "--delay": "2.5s" } as React.CSSProperties}
                  ></div>
                </div>

                <div className={styles.glowRing}></div>
                <div className={styles.glowRing2}></div>
              </div>

              <div className={styles.betaBadge}>
                <Lightning size={16} weight="fill" />
                {isFullyActive ? "ACCESS GRANTED" : hasNoCredits ? "NO CREDITS" : "BETA ACCESS"}
              </div>
            </div>
            <h3 className={styles.aiTitle}>PREGÚNTAME WIZARD (AI)</h3>
            <p className={styles.aiDescription}>
              Create engaging quizzes instantly with our AI-powered generator. Get early access to
              the beta version with limited credits!
            </p>

            <div className={styles.aiFeatures}>
              <div className={styles.aiFeatureItem}>
                <CheckCircle size={18} weight="fill" />
                <span>AI-Generated Questions</span>
              </div>
              <div className={styles.aiFeatureItem}>
                <CheckCircle size={18} weight="fill" />
                <span>Smart Answer Options</span>
              </div>
              <div className={styles.aiFeatureItem}>
                <CheckCircle size={18} weight="fill" />
                <span>Topic-Based Generation</span>
              </div>
              <div className={styles.aiFeatureItem}>
                <CheckCircle size={18} weight="fill" />
                <span>Instant Quiz Creation</span>
              </div>
            </div>

            <div className={styles.aiBetaInfo}>
              <div className={styles.betaInfoItem}>
                <span className={styles.betaLabel}>
                  {isFullyActive || hasNoCredits ? "CREDITS REMAINING" : "BETA CREDITS"}
                </span>
                <span
                  className={styles.betaValue}
                  style={creditsRemaining === 0 ? { color: "#ff6b6b" } : {}}
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
                        : betaStatus === "approved" && licenseStatus !== "active"
                          ? licenseStatus.toUpperCase()
                          : "LIMITED ACCESS"}
                </span>
              </div>
            </div>

            {/* ✅ SHOW USE BUTTON ONLY IF FULLY ACTIVE (HAS CREDITS) */}
            {showUseButton && (
              <button
                onClick={handleUseWizard}
                className={`${styles.betaAccessButton} ${styles.approvedButton}`}
              >
                {getButtonContent()}
              </button>
            )}

            {/* ✅ SHOW NO CREDITS BUTTON (DISABLED) */}
            {showNoCreditsButton && (
              <button className={`${styles.betaAccessButton} ${styles.buttonDisabled}`} disabled>
                {getButtonContent()}
              </button>
            )}

            {/* ✅ SHOW INACTIVE BUTTON IF APPROVED BUT LICENSE NOT ACTIVE */}
            {showInactiveButton && (
              <button className={`${styles.betaAccessButton} ${styles.buttonDisabled}`} disabled>
                {getButtonContent()}
              </button>
            )}

            {/* ✅ SHOW REQUEST BUTTON ONLY IF NOT APPROVED OR PENDING */}
            {showRequestButton && betaStatus !== "approved" && (
              <button
                onClick={handleBetaAccess}
                className={`${styles.betaAccessButton} ${isRequestButtonDisabled ? styles.buttonDisabled : ""}`}
                disabled={isRequestButtonDisabled}
              >
                {getButtonContent()}
              </button>
            )}

            <p className={styles.betaNote}>
              {betaStatus === "pending"
                ? "We'll review your request and grant access within 2 hours"
                : isFullyActive
                  ? `License: ${licenseKey} | ${creditsRemaining} credits remaining`
                  : hasNoCredits
                    ? "You have used all your AI credits. Contact support to get more."
                    : betaStatus === "approved" && licenseStatus !== "active"
                      ? `Your license has been ${licenseStatus}. Please contact support.`
                      : "Early access users get 500 free AI credits to test the feature"}
            </p>
          </div>
        </div>
      </div>

      <BetaAccessModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        userEmail={userEmail}
        userName={userName}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}
