"use client";
import React from "react";
import styles from "./LoadingDashboard.module.css";

export default function LoadingDashboard() {
  return (
    <div className={styles.container}>
      {/* Animated 3D Ball with Lines */}
      <div className={styles.ball}>
        <div className={styles.inner}>
          <div className={styles.line}></div>
          <div className={`${styles.line} ${styles.lineTwo}`}></div>
          <div className={styles.oval}></div>
          <div className={`${styles.oval} ${styles.ovalTwo}`}></div>
        </div>
      </div>

      {/* Shadow */}
      <div className={styles.shadow}></div>

      {/* Loading Text */}
      <div className={styles.loadingText}>
        <div className={styles.loadingTitle}>LOADING DASHBOARD</div>
        <div className={styles.loadingDots}>
          <span className={styles.dot}>.</span>
          <span className={styles.dot}>.</span>
          <span className={styles.dot}>.</span>
        </div>
      </div>

      {/* Retro Scan Lines Overlay */}
      <div className={styles.scanLines}></div>
    </div>
  );
}
