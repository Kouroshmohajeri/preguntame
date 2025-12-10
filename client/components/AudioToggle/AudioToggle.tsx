"use client";

import { useState, useEffect } from "react";
import styles from "./AudioToggle.module.css";
import { getGlobalAudio } from "@/utils/globalAudio";

interface AudioToggleProps {
  size?: number;
  colors?: {
    background?: string;
    hoverBackground?: string;
    icon?: string;
  };
  position?: {
    bottom?: string;
    top?: string;
    left?: string;
    right?: string;
  };
  showHover?: boolean;
}

export default function AudioToggle({
  size = 50,
  colors = {
    background: "rgb(39, 39, 39)",
    hoverBackground: "rgb(61, 61, 61)",
    icon: "#fff",
  },
  position = { bottom: "20px", right: "20px" },
  showHover = true,
}: AudioToggleProps) {
  const [isMuted, setIsMuted] = useState(true); // Start as false (unmuted)
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);

  // Initialize audio as UNMUTED on component mount
  useEffect(() => {
    const audio = getGlobalAudio();
    // Ensure audio is unmuted when component loads
    audio.unmuteAll();
    setIsMuted(false);
  }, []);

  const toggle = () => {
    const newState = !isMuted;
    setIsMuted(newState);

    const audio = getGlobalAudio();
    if (newState) {
      audio.muteAll();
    } else {
      audio.unmuteAll();
    }

    // Also mute/unmute any direct media elements on the page
    const mediaElements = Array.from(document.querySelectorAll<HTMLMediaElement>("audio, video"));
    mediaElements.forEach((el) => {
      el.muted = newState;
    });
  };

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    position: "fixed",
    ...position,
    backgroundColor: hover ? colors.hoverBackground : colors.background,
    borderRadius: "50%",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transform: pressed ? "scale(0.85)" : "scale(1)",
    transition: "all 0.2s ease",
    cursor: "pointer",
  };

  return (
    <div
      className={styles.container}
      style={containerStyle}
      onMouseEnter={() => showHover && setHover(true)}
      onMouseLeave={() => showHover && setHover(false)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onClick={toggle}
      title={isMuted ? "Unmute" : "Mute"}
    >
      {isMuted ? (
        // MUTE ICON
        <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 75 75">
          <path
            d="m39,14-17,15H6V48H22l17,15z"
            fill={colors.icon}
            stroke={colors.icon}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="m49,26 20,24m0-24-20,24"
            stroke={colors.icon}
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      ) : (
        // SPEAKER ICON
        <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 75 75">
          <path
            d="M39.389,13.769 L22.235,28.606 L6,28.606 L6,47.699 L21.989,47.699 L39.389,62.75 L39.389,13.769z"
            fill={colors.icon}
            stroke={colors.icon}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M48,27.6a19.5,19.5 0 0 1 0,21.4M55.1,20.5a30,30 0 0 1 0,35.6M61.6,14a38.8,38.8 0 0 1 0,48.6"
            stroke={colors.icon}
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      )}
    </div>
  );
}
