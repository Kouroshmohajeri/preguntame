// components/PixelLogo/PixelLogo.tsx
"use client";

import React from "react";
import styles from "./PixelLogo.module.css";

const PixelLogo = () => {
  return (
    <div className={styles.pixelLogoContainer}>
      <span className={styles.pixelText}>
        {/* Animate each letter from p to u */}
        <span className={`${styles.pixelLetter} ${styles.letterP}`}>p</span>
        <span className={`${styles.pixelLetter} ${styles.letterR}`}>r</span>
        <span className={`${styles.pixelLetter} ${styles.letterE}`}>e</span>
        <span className={`${styles.pixelLetter} ${styles.letterG}`}>g</span>
        <span className={`${styles.pixelLetter} ${styles.letterU}`}>u</span>
        <span className={`${styles.pixelLetter} ${styles.letterN}`}>n</span>
        <span className={`${styles.pixelLetter} ${styles.letterT}`}>t</span>
        <span className={`${styles.pixelLetter} ${styles.letterA}`}>a</span>
        <span className={`${styles.pixelLetter} ${styles.letterM}`}>m</span>
        <span className={`${styles.pixelLetter} ${styles.letterE2}`}>e</span>
        <span className={`${styles.pixelLetter} ${styles.dot}`}>.</span>
        <span className={`${styles.pixelLetter} ${styles.letterE3}`}>e</span>
        <span className={`${styles.pixelLetter} ${styles.letterU2}`}>u</span>
      </span>

      {/* Pixel trail effect */}
      <div className={styles.pixelTrail} />
    </div>
  );
};

export default PixelLogo;
