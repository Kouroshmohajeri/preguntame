"use client";
import styles from "./DashboardFooter.module.css";

export default function DashboardFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <span className={styles.footerText}>
          Powered by <strong>Pregúntame</strong>
        </span>
        <span className={styles.footerVersion}>v1.3.0</span>
      </div>
    </footer>
  );
}
