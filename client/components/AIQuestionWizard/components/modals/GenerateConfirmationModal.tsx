"use client";

import { useState } from "react";
import { Warning, Sparkle, X, Coin } from "@phosphor-icons/react";
import styles from "./GenerateConfirmationModal.module.css";

interface GenerateConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  numberOfQuestions: number;
  difficulty: string;
  language: string;
  questionTypes: string[];
  userCredits: number;
  loading: boolean;
}

export default function GenerateConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  numberOfQuestions,
  difficulty,
  language,
  questionTypes,
  userCredits,
  loading,
}: GenerateConfirmationModalProps) {
  if (!isOpen) return null;

  const hasEnoughCredits = userCredits >= 10;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={24} weight="bold" />
        </button>

        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Warning size={56} weight="fill" />
          </div>
          <h2 className={styles.title}>CONFIRM GENERATION</h2>
        </div>

        <div className={styles.content}>
          <div className={styles.warningBox}>
            <Warning size={20} weight="fill" />
            <p>
              <strong>Important:</strong> Once you generate questions, 10 AI credits will be
              deducted. This action cannot be undone. If you need to regenerate, it will cost
              another 10 credits.
            </p>
          </div>

          <div className={styles.configSummary}>
            <h3>Your Configuration</h3>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.label}>Questions:</span>
                <span className={styles.value}>{numberOfQuestions}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.label}>Difficulty:</span>
                <span className={styles.value}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.label}>Language:</span>
                <span className={styles.value}>{language.toUpperCase()}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.label}>Types:</span>
                <span className={styles.value}>{questionTypes.join(", ")}</span>
              </div>
            </div>
          </div>

          <div className={styles.creditInfo}>
            <div className={styles.creditRow}>
              <span className={styles.creditLabel}>
                <Coin size={20} weight="fill" />
                Your Credits:
              </span>
              <span
                className={`${styles.creditValue} ${!hasEnoughCredits ? styles.insufficient : ""}`}
              >
                {userCredits}
              </span>
            </div>
            <div className={styles.creditRow}>
              <span className={styles.creditLabel}>Cost:</span>
              <span className={styles.creditCost}>-10 Credits</span>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.creditRow}>
              <span className={styles.creditLabel}>Remaining After:</span>
              <span className={styles.creditRemaining}>
                {hasEnoughCredits ? userCredits - 10 : 0} Credits
              </span>
            </div>
          </div>

          {!hasEnoughCredits && (
            <div className={styles.errorBox}>
              <Warning size={20} weight="fill" />
              <p>
                <strong>Insufficient Credits!</strong> You need at least 10 credits to generate
                questions. Please purchase more credits to continue.
              </p>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button onClick={onClose} className={styles.cancelBtn} disabled={loading}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={styles.confirmBtn}
            disabled={!hasEnoughCredits || loading}
          >
            {loading ? (
              "Generating..."
            ) : (
              <>
                <Sparkle size={20} weight="fill" />
                Confirm & Generate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
