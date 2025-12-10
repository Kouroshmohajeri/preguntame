"use client";

import { useEffect, useState } from "react";

export function ConfettiSideCannons() {
  const [confetti, setConfetti] = useState<
    Array<{ x: number; y: number; color: string; id: number }>
  >([]);

  useEffect(() => {
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];
    const newConfetti = [];

    // Create confetti particles
    for (let i = 0; i < 100; i++) {
      newConfetti.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        id: i,
      });
    }

    setConfetti(newConfetti);

    // Clear confetti after 3 seconds
    const timer = setTimeout(() => {
      setConfetti([]);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (confetti.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {confetti.map((particle) => (
        <div
          key={particle.id}
          style={{
            position: "absolute",
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: "10px",
            height: "10px",
            backgroundColor: particle.color,
            borderRadius: "50%",
            animation: `fall ${Math.random() * 2 + 1}s linear forwards`,
            opacity: 0.8,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
