"use client";
import { useState, useEffect } from "react";
import styles from "./FreeIranBanner.module.css";
import Image from "next/image";
import { X } from "@phosphor-icons/react";

export default function FreeIranBanner() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [hoursSinceBlackout, setHoursSinceBlackout] = useState(84);

  useEffect(() => {
    // Blackout started: January 8, 2026, 8:30 PM Iran Time (6:00 PM CET / 17:00 UTC)
    // Source: NetBlocks monitoring data
    const blackoutStartTime = new Date("2026-01-08T18:00:00+01:00"); // 6:00 PM CET

    const updateHours = () => {
      const now = new Date();
      const diffMs = now.getTime() - blackoutStartTime.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      setHoursSinceBlackout(Math.max(0, diffHours));
    };

    // Update immediately
    updateHours();

    // Update every hour
    const interval = setInterval(updateHours, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (isClosed) return null;

  return (
    <>
      {/* Backdrop overlay when expanded */}
      {isExpanded && <div className={styles.backdrop} onClick={() => setIsExpanded(false)} />}

      <div className={`${styles.floatingContainer} ${isExpanded ? styles.expanded : ""}`}>
        {/* Close button - outside top-right */}
        {!isExpanded && (
          <button
            className={styles.closeButton}
            onClick={() => setIsClosed(true)}
            aria-label="Close"
          >
            <X size={20} weight="bold" />
          </button>
        )}

        {/* Modal close button - MOVED OUTSIDE modalContainer */}
        {isExpanded && (
          <button
            className={styles.modalCloseButton}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}
            aria-label="Close modal"
          >
            <X size={24} weight="bold" />
          </button>
        )}

        {/* Modal container */}
        <div className={styles.modalContainer} onClick={() => !isExpanded && setIsExpanded(true)}>
          {/* Flag section */}
          <div className={styles.flagSection}>
            {/* Shine effect */}
            <div className={styles.shine}></div>

            {/* Green stripe */}
            <div className={`${styles.stripe} ${styles.green}`}></div>

            {/* White stripe with logo */}
            <div className={`${styles.stripe} ${styles.white}`}>
              <Image
                src="/images/LionAndSun.svg"
                alt="Lion and Sun"
                width={isExpanded ? 100 : 60}
                height={isExpanded ? 100 : 60}
                className={styles.lionSunIcon}
              />
            </div>

            {/* Red stripe - fades into content */}
            <div
              className={`${styles.stripe} ${styles.red} ${isExpanded ? styles.redFade : ""}`}
            ></div>
          </div>

          {/* Expanded message */}
          {isExpanded && (
            <div className={styles.messageBox}>
              <p className={styles.messageText}>
                The people of Iran have been in a total blackout of internet and electricity for
                more than{" "}
                <strong className={styles.hoursHighlight}>{hoursSinceBlackout} hours</strong> now,
                and they don't have any connection with their families and loved ones outside of
                Iran.
              </p>

              <p className={styles.messageText}>
                <strong>Be their voice.</strong>
              </p>
              <p className={styles.hashtag}>#FreeIran</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
