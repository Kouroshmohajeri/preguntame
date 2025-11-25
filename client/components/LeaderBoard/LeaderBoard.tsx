"use client";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./LeaderBoard.module.css";
import LoginModal from "../LoginModal/LoginModal";

export interface Player {
  isAssigned: any;
  id: string;
  name: string;
  uuid: string;
  score: number;
  correct?: number;
  wrong?: number;
  responseTime?: number;
}

interface LeaderboardProps {
  leaderboard: Player[];
}

const COLORS = ["#38A169", "#E53E3E"];

const getNumberForPlayer = (index: number): number => (index % 8) + 1;
const getNumberAvatarClass = (index: number): string => {
  const number = getNumberForPlayer(index);
  return styles[`numberAvatar${number}`] || "";
};

export default function Leaderboard({ leaderboard }: LeaderboardProps) {
  const [animatedLeaderboard, setAnimatedLeaderboard] = useState<Player[]>([]);
  const [showPodium, setShowPodium] = useState(false);
  const [playerUUID, setPlayerUUID] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [hasReturnedFromLogin, setHasReturnedFromLogin] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const uuid = localStorage.getItem("playerUUID");
      setPlayerUUID(uuid);

      // Check if user just returned from login
      const returnedFromLogin = sessionStorage.getItem("returnedFromLogin");
      if (returnedFromLogin === "true") {
        setHasReturnedFromLogin(true);
        alert(
          "Welcome back! You have successfully logged in. Your progress will now be saved to your account."
        );
        sessionStorage.removeItem("returnedFromLogin"); // Clean up
      }
    }
  }, []);

  useEffect(() => {
    const sorted = [...leaderboard].sort((a, b) => b.score - a.score);
    setAnimatedLeaderboard([]);
    setShowPodium(false);

    sorted.forEach((player, index) => {
      setTimeout(() => {
        setAnimatedLeaderboard((prev) => [...prev, player]);
        if (index === 0) setTimeout(() => setShowPodium(true), 300);
      }, index * 120);
    });
  }, [leaderboard]);

  // Effect to check when user logs in
  useEffect(() => {
    if (session && showLoginModal) {
      // User just logged in, close the modal and show success message
      setShowLoginModal(false);
      setShowLoginPrompt(false);
      setHasReturnedFromLogin(true);
      alert(
        "Welcome back! You have successfully logged in. Your progress will now be saved to your account."
      );
    }
  }, [session, showLoginModal]);

  const { first, second, third, rest } = (() => {
    const [f, s, t, ...r] = animatedLeaderboard;
    return { first: f, second: s, third: t, rest: r };
  })();

  const barChartData = animatedLeaderboard.slice(0, 6).map((player, index) => ({
    name: player.name.substring(0, 8),
    score: player.score,
    rank: index + 1,
  }));

  // Check if we should show the login prompt
  const shouldShowLoginPrompt =
    showLoginPrompt &&
    !session &&
    playerUUID &&
    leaderboard.some((player) => player.uuid === playerUUID);

  const handleLoginClick = () => {
    setShowLoginModal(true);
    setShowLoginPrompt(false); // Optionally close the prompt when opening modal
  };

  const handleCloseLoginPrompt = () => {
    setShowLoginPrompt(false);
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  const handleLoginSuccess = () => {
    // This will be triggered when login is successful
    setShowLoginModal(false);
    setShowLoginPrompt(false);
    setHasReturnedFromLogin(true);
    // The session effect above will handle the alert
  };

  return (
    <div className={styles.container}>
      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={handleCloseLoginModal}
          onLoginSuccess={handleLoginSuccess}
          isOpen={true}
        />
      )}

      {/* Login Prompt - Only show if user isn't logged in but has a playerUUID in the leaderboard */}
      {shouldShowLoginPrompt && (
        <div className={styles.loginPrompt}>
          <div className={styles.loginMessage}>
            <button
              onClick={handleCloseLoginPrompt}
              className={styles.loginClose}
              aria-label="Close login prompt"
            >
              ×
            </button>
            <div className={styles.loginIcon}>🔐</div>
            <div className={styles.loginText}>
              <strong>Login to save your progress!</strong>
              <span>Your score will be permanently saved to your account</span>
            </div>
            <button onClick={handleLoginClick} className={styles.loginButton}>
              LOGIN NOW
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>LEADERBOARD</h1>
        <div className={styles.subtitle}>ARCADE RANKINGS • LIVE SCORES</div>
      </div>

      {/* Podium */}
      <div className={styles.podiumSection}>
        <div className={styles.podium}>
          {second && (
            <div className={styles.podiumSecond}>
              <div className={styles.podiumSecondBase}></div>
              <div className={styles.podiumPlayer}>
                <div className={`${styles.podiumAvatar} ${getNumberAvatarClass(1)}`}>2</div>
                <div className={styles.podiumName}>{second.name}</div>
                <div className={styles.podiumScore}>
                  {second.score} {second.uuid === playerUUID && "(You)"}
                </div>
              </div>
            </div>
          )}
          {first && (
            <div className={styles.podiumFirst}>
              <div className={styles.podiumFirstBase}></div>
              <div className={styles.podiumPlayer}>
                <div className={`${styles.podiumAvatarFirst} ${getNumberAvatarClass(0)}`}>1</div>
                <div className={styles.podiumName}>
                  {first.name}
                  {first.uuid === playerUUID && "(You)"}
                </div>
                <div className={styles.podiumScore}>{first.score}</div>
              </div>
            </div>
          )}
          {third && (
            <div className={styles.podiumThird}>
              <div className={styles.podiumThirdBase}></div>
              <div className={styles.podiumPlayer}>
                <div className={`${styles.podiumAvatar} ${getNumberAvatarClass(2)}`}>3</div>
                <div className={styles.podiumName}>
                  {third.name} {third.uuid === playerUUID && "(You)"}
                </div>
                <div className={styles.podiumScore}>{third.score}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Players Grid */}
      <div className={styles.playersGrid}>
        {rest.map((player, index) => {
          const rank = index + 4;
          const avatarClass = getNumberAvatarClass(rank - 1);
          return (
            <div
              key={player.id}
              className={styles.playerCard}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className={styles.playerRank}>#{rank}</div>
              <div className={`${styles.playerAvatar} ${avatarClass}`}>
                {getNumberForPlayer(rank - 1)}
              </div>
              <div className={styles.playerInfo}>
                <div className={styles.playerName}>
                  {player.name} {player.uuid === playerUUID && "(You)"}
                </div>
                <div className={styles.playerStats}>
                  {player.correct !== undefined && (
                    <span className={styles.iconCorrect}>{player.correct}</span>
                  )}
                  {player.wrong !== undefined && (
                    <span className={styles.iconWrong}>{player.wrong}</span>
                  )}
                  {player.responseTime !== undefined && (
                    <span className={styles.iconTime}>{player.responseTime}s</span>
                  )}
                </div>
              </div>
              <div className={styles.playerScore}>{player.score}</div>
            </div>
          );
        })}
      </div>

      {/* Stats Section */}
      {first && (
        <div className={styles.statsSection}>
          <h2 className={styles.statsTitle}>TOP PERFORMER STATS</h2>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E0" />
                <XAxis dataKey="name" stroke="#4A5568" fontSize={10} />
                <YAxis stroke="#4A5568" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFAF7",
                    border: "2px solid #2D3748",
                    borderRadius: 0,
                    color: "#2D3748",
                  }}
                />
                <Bar dataKey="score" radius={[2, 2, 0, 0]}>
                  {barChartData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {first.correct !== undefined && (
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{first.correct}</div>
                <div className={styles.statLabel}>Correct</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{first.wrong || 0}</div>
                <div className={styles.statLabel}>Wrong</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>
                  {first.correct + (first.wrong || 0) > 0
                    ? Math.round((first.correct / (first.correct + (first.wrong || 0))) * 100)
                    : 0}
                  %
                </div>
                <div className={styles.statLabel}>Accuracy</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{first.score}</div>
                <div className={styles.statLabel}>Points</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
