"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { X, Star, EnvelopeSimple } from "@phosphor-icons/react";
import { requestBetaAccess, checkBetaAccessStatus } from "@/app/api/betaAccess/actions";
import { sendNotification } from "@/app/api/notifications/actions";
import { useToast } from "@/context/ToastContext/ToastContext";
import styles from "./BetaAccessModal.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userName: string;
  onStatusChange?: (hasRequested: boolean) => void;
}

export default function BetaAccessModal({
  isOpen,
  onClose,
  userEmail,
  userName,
  onStatusChange,
}: Props) {
  const [filledStars, setFilledStars] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [alreadyRequested, setAlreadyRequested] = useState(false);

  const { data: session } = useSession();
  const { showToast } = useToast();

  const fullText = "I love Pregúntame! The quizzes are amazing...";

  // Check if user already requested when modal opens
  useEffect(() => {
    const checkStatus = async () => {
      if (!isOpen) return;

      const email = userEmail || session?.user?.email;
      if (!email) return;

      try {
        const status = await checkBetaAccessStatus(email);

        if (status.status === "pending" || status.status === "approved") {
          setAlreadyRequested(true);
          onStatusChange?.(true);
        }
      } catch (error) {
        console.error("Error checking beta status:", error);
      }
    };

    checkStatus();
  }, [isOpen, userEmail, session?.user?.email]);

  // Star filling animation
  useEffect(() => {
    if (!isOpen) {
      setFilledStars(0);
      setTypedText("");
      setRequestSent(false);
      return;
    }

    let currentStar = 0;
    const starInterval = setInterval(() => {
      if (currentStar < 5) {
        currentStar++;
        setFilledStars(currentStar);
      } else {
        clearInterval(starInterval);
      }
    }, 200);

    return () => clearInterval(starInterval);
  }, [isOpen]);

  // Typing animation (starts after stars are filled)
  useEffect(() => {
    if (filledStars < 5) {
      setTypedText("");
      return;
    }

    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 40);

    return () => clearInterval(typingInterval);
  }, [filledStars]);

  const handleRequestAccess = async () => {
    setIsSubmitting(true);

    try {
      // Use session email as fallback
      const email = userEmail || session?.user?.email;
      const name = userName || session?.user?.name || "User";
      const userId = session?.user?.id;

      if (!email) {
        showToast("Please log in to request beta access", "error");
        return;
      }

      // Call the beta access action
      const result = await requestBetaAccess(email, name);

      if (result.success) {
        // 🔔 SEND NOTIFICATION TO USER
        if (userId) {
          try {
            await sendNotification({
              userId,
              type: "beta_request",
              title: "Beta Access Request Submitted! 🚀",
              message:
                "Your request is being reviewed! We will notify you shortly when your access is approved.",
              link: "/dashboard#ai-access",
              read: false,
              senderId: "info@preguntame.com",
            });
          } catch (notifError) {
            console.error("Failed to send notification:", notifError);
            // Don't fail the whole operation if notification fails
          }
        }

        setRequestSent(true);
        setAlreadyRequested(true);
        onStatusChange?.(true);
        showToast("Beta access request sent! Check your email.", "success");

        // Auto-close after 3 seconds
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        throw new Error(result.error || "Failed to send request");
      }
    } catch (error: any) {
      console.error("Error requesting beta access:", error);

      // Show specific error message
      const errorMessage =
        error.response?.data?.error || error.message || "Failed to send beta access request";
      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={20} weight="bold" />
        </button>

        {!requestSent ? (
          <>
            <div className={styles.modalHeader}>
              <div className={styles.iconContainer}>
                <EnvelopeSimple size={40} weight="fill" />
              </div>
              <h2 className={styles.modalTitle}>Get Beta Access</h2>
              <p className={styles.modalSubtitle}>Leave a review and get 500 free AI credits</p>
            </div>

            {/* Animated Review Preview */}
            <div className={styles.reviewPreview}>
              <div className={styles.trustpilotHeader}>
                <Star size={18} weight="fill" className={styles.trustpilotIcon} />
                <span className={styles.trustpilotText}>Trustpilot</span>
              </div>

              <div className={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((index) => (
                  <Star
                    key={index}
                    size={28}
                    weight="fill"
                    className={`${styles.star} ${index <= filledStars ? styles.starFilled : ""}`}
                  />
                ))}
              </div>

              <div className={styles.reviewBubble}>
                <p className={styles.reviewText}>
                  {typedText}
                  {filledStars === 5 && typedText.length < fullText.length && (
                    <span className={styles.cursor} />
                  )}
                </p>
              </div>
            </div>

            {/* Simple Instructions */}
            <div className={styles.infoBox}>
              <p className={styles.infoText}>
                {alreadyRequested
                  ? "✅ You've already requested beta access. Please check your email for instructions."
                  : "📧 You'll receive an email with instructions to complete your review and activate your beta access (within 2 hours)."}
              </p>
            </div>

            <button
              onClick={handleRequestAccess}
              className={styles.primaryButton}
              disabled={isSubmitting || alreadyRequested}
            >
              {alreadyRequested ? "Request Already Sent" : isSubmitting ? "Sending..." : "Continue"}
            </button>
          </>
        ) : (
          <div className={styles.successState}>
            <div className={styles.checkmark}>
              <svg viewBox="0 0 52 52" className={styles.checkmarkSvg}>
                <circle className={styles.checkmarkCircle} cx="26" cy="26" r="25" fill="none" />
                <path
                  className={styles.checkmarkCheck}
                  fill="none"
                  d="M14.1 27.2l7.1 7.2 16.7-16.8"
                />
              </svg>
            </div>
            <h3 className={styles.successTitle}>Request Sent</h3>
            <p className={styles.successText}>
              Check {userEmail || session?.user?.email} for next steps
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
