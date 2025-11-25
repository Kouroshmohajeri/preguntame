import React from 'react';
import styles from './RetroLoading.module.css';

const RetroLoading = ({ message = "LOADING QUESTIONS..." }) => {
  return (
    <div className={styles.overlay}>
      <div className={`${styles.modal} ${styles.loadingModal}`}>
        {/* Retro Scan Line */}
        <div className={styles.scanLine}></div>
        
        <div className={styles.header}>
          <div className={styles.pixelTitle}>PREGUNTAME</div>
          <div className={`${styles.closeButton} ${styles.loadingSpinner}`}>⟳</div>
        </div>
        
        <div className={`${styles.content} ${styles.loadingContent}`}>
          <div className={styles.loadingAnimation}>
            {/* Loading Bar */}
            <div className={styles.loadingBar}>
              <div className={styles.loadingBarFill}></div>
            </div>
            
            {/* Loading Text */}
            <div className={styles.loadingText}>
              <div className={styles.loadingMessage}>{message}</div>
              <div className={styles.loadingDots}>
                <span className={styles.dot}>.</span>
                <span className={styles.dot}>.</span>
                <span className={styles.dot}>.</span>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className={styles.progressContainer}>
              <div className={styles.progressText}>INITIALIZING GAME SYSTEM</div>
            </div>
          </div>
          
          {/* Game Status */}
          <div className={styles.gameStatus}>
            <div className={styles.statusText}>
              GET READY FOR THE CHALLENGE!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetroLoading;