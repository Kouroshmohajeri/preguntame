"use client";
import { ChartBar, TrendUp, Users, GameController } from "@phosphor-icons/react";
import styles from "./AnalyticsLoader.module.css";

export default function AnalyticsLoader() {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.loaderContent}>
        {/* Animated circles background */}
        <div className={styles.circles}>
          <div className={styles.circle}></div>
          <div className={styles.circle}></div>
          <div className={styles.circle}></div>
        </div>

        {/* Main loader with rotating icons */}
        <div className={styles.iconRing}>
          <div className={styles.iconWrapper}>
            <ChartBar size={32} weight="fill" className={styles.icon1} />
          </div>
          <div className={styles.iconWrapper}>
            <Users size={32} weight="fill" className={styles.icon2} />
          </div>
          <div className={styles.iconWrapper}>
            <GameController size={32} weight="fill" className={styles.icon3} />
          </div>
          <div className={styles.iconWrapper}>
            <TrendUp size={32} weight="fill" className={styles.icon4} />
          </div>
        </div>

        {/* Center pulse */}
        <div className={styles.centerPulse}>
          <div className={styles.pulseRing}></div>
          <div className={styles.pulseRing}></div>
          <div className={styles.pulseRing}></div>
        </div>

        {/* Loading text */}
        <div className={styles.textContainer}>
          <h2 className={styles.loadingTitle}>Loading Analytics</h2>
          <div className={styles.dotContainer}>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
          </div>
        </div>

        {/* Progress bar */}
        <div className={styles.progressBar}>
          <div className={styles.progressFill}></div>
        </div>

        {/* Data particles */}
        <div className={styles.particles}>
          {[...Array(20)].map((_, i) => (
            <div key={i} className={styles.particle}></div>
          ))}
        </div>
      </div>
    </div>
  );
}
