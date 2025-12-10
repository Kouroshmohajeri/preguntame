import React, { useEffect, useRef } from "react";
import styles from "./RetroLoading.module.css";

const RetroTerminalLoader = ({ message = "LOADING..." }) => {
  return (
    <div className={styles.overlay}>
      <div className={`${styles.modal} ${styles.loadingModal}`}>
        {/* Retro Scan Line */}
        <div className={styles.scanLine}></div>

        <div className={styles.terminalLoader}>
          <div className={styles.terminalHeader}>
            <div className={styles.terminalTitle}>PREGUNTAME</div>
            <div className={styles.terminalControls}>
              <div className={`${styles.control} ${styles.close}`}></div>
              <div className={`${styles.control} ${styles.minimize}`}></div>
              <div className={`${styles.control} ${styles.maximize}`}></div>
            </div>
          </div>
          <div className={styles.text}>{message}</div>
        </div>

        {/* Game Status */}
        <div className={styles.gameStatus}>
          <div className={styles.statusText}>GET READY FOR THE CHALLENGE!</div>
        </div>
      </div>
    </div>
  );
};

export default RetroTerminalLoader;
