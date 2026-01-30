"use client";
import { useRouter } from "next/navigation";
import { Robot, X, Sparkle } from "@phosphor-icons/react";
import styles from "./AnnouncementModal.module.css";

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string;
  showScrollTop?: boolean;
  onDashboardAction?: () => void; // New prop for dashboard refresh
}

export default function AnnouncementModal({
  isOpen,
  onClose,
  redirectUrl = "/create/wizard",
  showScrollTop = false,
  onDashboardAction,
}: AnnouncementModalProps) {
  const router = useRouter();

  const handleTryWizard = () => {
    const isDashboard = redirectUrl.includes("/dashboard");

    if (isDashboard) {
      // Close modal first in dashboard
      onClose();

      // Refresh dashboard component if callback provided
      if (onDashboardAction) {
        onDashboardAction();
      }

      // Then scroll to AI Access section
      setTimeout(() => {
        const aiAccessSection = document.getElementById("ai-access");
        if (aiAccessSection) {
          aiAccessSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        // Update URL with hash
        window.history.pushState(null, "", "#ai-access");
      }, 100);
    } else {
      // For other pages, just redirect (modal will close on navigation)
      router.push(redirectUrl);
    }
  };

  const handleReopen = () => {
    window.dispatchEvent(new CustomEvent("reopenAnnouncement"));
  };

  return (
    <>
      {/* Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className={styles.backdrop} onClick={onClose} />

          {/* Modal */}
          <div className={styles.modalContainer}>
            <div className={styles.modal}>
              {/* Close Button */}
              <button
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Close announcement"
              >
                <X size={24} weight="bold" />
              </button>

              {/* Icon with sparkles */}
              <div className={styles.iconWrapper}>
                <div className={styles.sparkle} style={{ top: "0", left: "0" }}>
                  <Sparkle size={20} weight="fill" />
                </div>
                <div className={styles.heroIcon}>
                  <Robot size={64} weight="fill" />
                </div>
                <div className={styles.sparkle} style={{ bottom: "0", right: "0" }}>
                  <Sparkle size={20} weight="fill" />
                </div>
              </div>

              {/* Badge */}
              <div className={styles.badge}>
                <Sparkle size={16} weight="fill" />
                NEW FEATURE
              </div>

              {/* Title */}
              <h2 className={styles.title}>AI HAS ARRIVED TO PREGÚNTAME!</h2>

              {/* Message */}
              <p className={styles.message}>
                Now try the <strong>Pregúntame Wizard</strong> and generate quizzes instantly!
              </p>

              {/* CTA Button */}
              <button className={styles.ctaButton} onClick={handleTryWizard}>
                <Robot size={24} weight="fill" />
                TRY PREGÚNTAME WIZARD
                <Sparkle size={24} weight="fill" />
              </button>

              {/* Skip link */}
              <button className={styles.skipLink} onClick={onClose}>
                Maybe later
              </button>
            </div>
          </div>
        </>
      )}

      {/* Floating Button - Shows when modal is closed */}
      {!isOpen && (
        <button
          className={`${styles.floatingButton} ${showScrollTop ? styles.withScrollButton : ""}`}
          onClick={handleReopen}
          aria-label="Open AI announcement"
        >
          <div className={styles.floatingIcon}>
            <Robot size={32} weight="fill" />
          </div>
          <div className={styles.floatingSparkle}>
            <Sparkle size={16} weight="fill" />
          </div>
        </button>
      )}
    </>
  );
}
