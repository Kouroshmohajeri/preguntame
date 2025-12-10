// components/LoadingLeaderboard/LoadingLeaderboard.tsx
"use client";

import React from "react";
import styles from "./LoadingLeaderboard.module.css";

const LoadingLeaderboard = () => {
  return (
    <div className={styles.container}>
      <div className={styles.loaderWrapper}>
        <div className={styles.packman}></div>
        <div className={styles.dots}>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingLeaderboard;
