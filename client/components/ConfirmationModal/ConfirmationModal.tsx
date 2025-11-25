"use client";
import React from "react";
import { Warning, X, Check } from "@phosphor-icons/react";
import styles from "./ConfirmationModal.module.css";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "danger" | "info";
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "CONFIRM",
  cancelText = "CANCEL",
  type = "warning",
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "danger":
        return <Warning size={32} weight="fill" className={styles.iconDanger} />;
      case "info":
        return <Check size={32} weight="fill" className={styles.iconInfo} />;
      default:
        return <Warning size={32} weight="fill" className={styles.iconWarning} />;
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case "danger":
        return styles.confirmButtonDanger;
      case "info":
        return styles.confirmButtonInfo;
      default:
        return styles.confirmButtonWarning;
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={20} weight="bold" />
        </button>

        <div className={styles.modalHeader}>
          {getIcon()}
          <h2 className={styles.title}>{title}</h2>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.message}>{message}</p>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            {cancelText}
          </button>
          <button className={`${styles.confirmButton} ${getButtonClass()}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
