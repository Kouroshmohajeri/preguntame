"use client";
import { useEffect, useState } from "react";

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
    <h1 className="text-[4rem] font-extrabold tracking-tight text-black dark:text-[#fffaf4] leading-none">
      {displayed}
      {!finished && <span className="animate-pulse text-[#ff0077]">|</span>}
    </h1>
  );
}
