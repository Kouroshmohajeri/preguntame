"use client";
import { useEffect, useRef, useState } from "react";
import { Joystick, Users, Trophy, Coin } from "@phosphor-icons/react";
import styles from "./StatsGrid.module.css";

interface Props {
  stats: {
    totalGames: number;
    totalPlays: number;
    credits: number;
    points: number;
  };
}

// Pixelated counter that shows each number incrementing
function usePixelCounter(end: number) {
  const [count, setCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    setCount(0);

    if (end === 0) {
      setCount(0);
      return;
    }

    // Calculate interval based on end value
    const totalDuration = 800; // 0.8 seconds total
    const steps = Math.min(end, 20); // Max 20 steps for smooth but pixelated feel
    const increment = Math.ceil(end / steps);
    const delay = totalDuration / steps;

    let current = 0;

    intervalRef.current = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(intervalRef.current);
      } else {
        setCount(current);
      }
    }, delay);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [end]);

  return count;
}

export default function StatsGrid({ stats }: Props) {
  const animatedCredits = usePixelCounter(stats.credits);

  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <Joystick size={32} className={styles.statIcon} color="#FE6A6B" />
        <div className={styles.statContent}>
          <div className={styles.statNumber}>{stats.totalGames}</div>
          <div className={styles.statLabel}>Games Created</div>
        </div>
      </div>

      <div className={styles.statCard}>
        <Users size={32} className={styles.statIcon} color="#1588B0" />
        <div className={styles.statContent}>
          <div className={styles.statNumber}>{stats.totalPlays}</div>
          <div className={styles.statLabel}>Games Played</div>
        </div>
      </div>

      <div className={styles.statCard}>
        <Trophy size={32} className={styles.statIcon} color="#FED065" />
        <div className={styles.statContent}>
          <div className={styles.statNumber}>{stats.points}</div>
          <div className={styles.statLabel}>Score</div>
        </div>
      </div>

      <div className={`${styles.statCard} ${styles.creditsCard}`}>
        <Coin size={32} className={styles.statIcon} color="#4DCDC4" />
        <div className={styles.statContent}>
          <div className={`${styles.statNumber} ${styles.pixelNumber}`} key={animatedCredits}>
            {animatedCredits}
          </div>
          <div className={styles.statLabel}>AI Credits</div>
        </div>
      </div>
    </div>
  );
}
