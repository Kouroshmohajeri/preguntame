"use client";
import { useEffect, useState } from "react";
import styles from "./TypewriterTitle.module.css";

export default function TypewriterTitle({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, index + 1));
      index++;
      if (index === text.length) {
        clearInterval(interval);
        setFinished(true);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <h1 className={styles.title}>
      {displayed}
      {!finished && <span className={styles.cursor}>|</span>}
    </h1>
  );
}
