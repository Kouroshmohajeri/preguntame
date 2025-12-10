"use client";
import React, { useEffect, useState } from "react";
import styles from "./Toast.module.css";
import { CheckCircle, XCircle, WarningCircle, Info, X } from "@phosphor-icons/react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // Icons for each toast type
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={24} weight="fill" />;
      case "error":
        return <XCircle size={24} weight="fill" />;
      case "warning":
        return <WarningCircle size={24} weight="fill" />;
      case "info":
        return <Info size={24} weight="fill" />;
      default:
        return <Info size={24} weight="fill" />;
    }
  };

  // Get icon color
  const getIconColor = () => {
    switch (type) {
      case "success":
        return "#38A169";
      case "error":
        return "#E53E3E";
      case "warning":
        return "#D69E2E";
      case "info":
        return "#3182CE";
      default:
        return "#3182CE";
    }
  };

  // Auto-close the toast after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 500); // Match CSS animation duration
  };

  if (!isVisible) return null;

  return (
    <div
      className={`${styles.toast} ${styles[`toast${type.charAt(0).toUpperCase() + type.slice(1)}`]} ${isExiting ? styles.toastExit : ""}`}
      onClick={handleClose}
    >
      <div className={styles.toastContainer}>
        {/* Pixel Border Effect */}
        <div className={styles.pixelBorderTop}></div>
        <div className={styles.pixelBorderRight}></div>
        <div className={styles.pixelBorderBottom}></div>
        <div className={styles.pixelBorderLeft}></div>

        {/* Toast Content */}
        <div className={styles.toastContent}>
          <div className={styles.toastIcon} style={{ color: getIconColor() }}>
            {getIcon()}
          </div>
          <div className={styles.toastMessage}>{message}</div>
          <button
            className={styles.toastClose}
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            aria-label="Close notification"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressBar}>
          <div
            className={`${styles.progressFill} ${styles[`progress${type.charAt(0).toUpperCase() + type.slice(1)}`]}`}
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      </div>
    </div>
  );
}
