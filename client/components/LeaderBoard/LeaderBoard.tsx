// components/LeaderBoard/LeaderBoard.tsx
"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./LeaderBoard.module.css";
import LoginModal from "../LoginModal/LoginModal";

// Import Phosphor icons
import {
  ChartBar as ChartBarIcon,
  Target as TargetIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Lightning as LightningIcon,
  Trophy as TrophyIcon,
  Timer as TimerIcon,
  User as UserIcon,
  Crown as CrownIcon,
  TrendUp as TrendingUpIcon,
  Star as StarIcon,
  Medal as MedalIcon,
  NumberOne as NumberOneIcon,
  NumberTwo as NumberTwoIcon,
  NumberThree as NumberThreeIcon,
  Question as QuestionIcon,
  EyeIcon,
} from "@phosphor-icons/react";
import ResultModal from "../ResultModal/ResultModal";
export interface PlayerAnswer {
  questionIndex: number;
  answerId: string;
  isCorrect: boolean;
  points: number;
  timeLeft: number;
  _id: string;
}
export interface Player {
  isAssigned: any;
  id: string;
  name: string;
  uuid: string;
  score: number;
  avatar?: string;
  correct?: number;
  wrong?: number;
  responseTime?: number;
  answers: PlayerAnswer[];
  playerId?: string; // From the game result data
}

interface LeaderboardProps {
  leaderboard: Player[];
  gameCode: string;
}

interface TooltipData {
  text: string;
  x: number;
  y: number;
  type: "name" | "value" | "subtext" | "label";
}

const COLORS = ["#38A169", "#E53E3E", "#3182CE", "#D69E2E", "#805AD5", "#319795"];

// Function to generate a random DiceBear avatar URL
const generateRandomAvatar = (seed: string): string => {
  const styles = [
    "adventurer",
    "adventurer-neutral",
    "avataaars",
    "big-ears",
    "big-ears-neutral",
    "big-smile",
    "bottts",
    "croodles",
    "croodles-neutral",
    "fun-emoji",
    "icons",
    "identicon",
    "initials",
    "lorelei",
    "lorelei-neutral",
    "micah",
    "miniavs",
    "open-peeps",
    "personas",
    "pixel-art",
    "pixel-art-neutral",
    "shapes",
    "thumbs",
  ];

  const colors = [
    "FF6B6B",
    "45B7D1",
    "96CEB4",
    "FFEAA7",
    "DDA0DD",
    "98D8C8",
    "F7DC6F",
    "BB8FCE",
    "85C1E9",
    "F8C471",
    "A2D9CE",
    "FAD7A0",
  ];

  const randomStyle = styles[Math.floor(Math.random() * styles.length)];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${randomColor}`;
};

// Function to get rank badge component
const getRankBadge = (rank: number, size: number = 20) => {
  switch (rank) {
    case 1:
      return <CrownIcon size={size} weight="fill" className={styles.goldIcon} />;
    case 2:
      return <MedalIcon size={size} weight="fill" className={styles.silverIcon} />;
    case 3:
      return <MedalIcon size={size} weight="fill" className={styles.bronzeIcon} />;
    default:
      return (
        <div className={`${styles.rankNumber} ${rank <= 10 ? styles.topTenRank : ""}`}>#{rank}</div>
      );
  }
};

export default function Leaderboard({ leaderboard, gameCode }: LeaderboardProps) {
  const [animatedLeaderboard, setAnimatedLeaderboard] = useState<Player[]>([]);
  const [showPodium, setShowPodium] = useState(false);
  const [playerUUID, setPlayerUUID] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [hasReturnedFromLogin, setHasReturnedFromLogin] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<TooltipData | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  // In your Leaderboard component, update the useEffect that sets animatedLeaderboard:
  useEffect(() => {
    const uniquePlayers = leaderboard.filter(
      (player, index, self) => index === self.findIndex((p) => p.uuid === player.uuid)
    );

    // sort properly
    const sorted = [...uniquePlayers].sort((a, b) => b.score - a.score);

    // Set the sorted players all at once
    setAnimatedLeaderboard(sorted);

    // Reveal podium after small delay (optional)
    setTimeout(() => setShowPodium(true), 300);
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
    key: player.uuid,
    id: player.uuid,
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
    setShowLoginPrompt(false);
  };

  const handleCloseLoginPrompt = () => {
    setShowLoginPrompt(false);
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setShowLoginPrompt(false);
    setHasReturnedFromLogin(true);
  };

  const getPlayerAccuracy = (player: Player) => {
    if (player.correct === undefined || player.wrong === undefined) return 0;
    const total = player.correct + player.wrong;
    return total > 0 ? Math.round((player.correct / total) * 100) : 0;
  };

  const getResponseTimeRating = (responseTime?: number) => {
    if (!responseTime) return "Not available";
    if (responseTime <= 2) return "Lightning Fast";
    if (responseTime <= 5) return "Quick";
    if (responseTime <= 10) return "Average";
    return "Slow";
  };

  const getPerformanceRating = (player: Player) => {
    const accuracy = getPlayerAccuracy(player);
    if (accuracy >= 90) return "Master";
    if (accuracy >= 80) return "Excellent";
    if (accuracy >= 70) return "Good";
    if (accuracy >= 60) return "Fair";
    return "Learning";
  };

  const handleSeeDetails = (player: Player) => {
    setSelectedPlayer(player);
    setShowResultModal(true);
  };
  const handleTextHover = useCallback(
    (event: React.MouseEvent, text: string, type: TooltipData["type"]) => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }

      const element = event.currentTarget;
      const rect = element.getBoundingClientRect();

      // Check if text is truncated
      const isTruncated = element.scrollWidth > element.clientWidth;

      if (text) {
        hoverTimeoutRef.current = setTimeout(() => {
          setActiveTooltip({
            text,
            x: rect.left + rect.width / 2,
            y: rect.top,
            type,
          });
          setIsTooltipVisible(true);
        }, 50); // Small delay for smooth appearance
      }
    },
    []
  );

  const handleTextLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    setIsTooltipVisible(false);
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveTooltip(null);
    }, 150); // Match CSS transition
  }, []);

  const handleTooltipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsTooltipVisible(false);
        setActiveTooltip(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.container}>
      {/* Tooltip */}
      {activeTooltip && (
        <div
          ref={tooltipRef}
          className={`${styles.tooltip} ${isTooltipVisible ? styles.tooltipVisible : ""} ${styles[`tooltip${activeTooltip.type}`]}`}
          style={{
            left: `${activeTooltip.x}px`,
            top: `${activeTooltip.y}px`,
          }}
          onClick={handleTooltipClick}
        >
          <div className={styles.tooltipContent}>{activeTooltip.text}</div>
          <div className={styles.tooltipArrow} />
        </div>
      )}
      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={handleCloseLoginModal}
          onLoginSuccess={handleLoginSuccess}
          isOpen={true}
        />
      )}
      {/* Login Prompt */}
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
                <div className={styles.podiumAvatarContainer}>
                  <img
                    src={second.avatar || generateRandomAvatar(second.name)}
                    alt={second.name}
                    className={styles.podiumAvatar}
                  />
                  <div className={styles.podiumRankBadge}>{getRankBadge(2, 16)}</div>
                </div>
                <div
                  className={styles.podiumName}
                  onMouseEnter={(e) => handleTextHover(e, second.name, "name")}
                  onMouseLeave={handleTextLeave}
                >
                  {second.name}
                </div>
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
                <div className={styles.podiumAvatarContainerFirst}>
                  <img
                    src={first.avatar || generateRandomAvatar(first.name)}
                    alt={first.name}
                    className={styles.podiumAvatarFirst}
                  />
                  <div className={styles.podiumRankBadgeFirst}>{getRankBadge(1, 20)}</div>
                </div>
                <div
                  className={styles.podiumName}
                  onMouseEnter={(e) => handleTextHover(e, first.name, "name")}
                  onMouseLeave={handleTextLeave}
                >
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
                <div className={styles.podiumAvatarContainer}>
                  <img
                    src={third.avatar || generateRandomAvatar(third.name)}
                    alt={third.name}
                    className={styles.podiumAvatar}
                  />
                  <div className={styles.podiumRankBadge}>{getRankBadge(3, 16)}</div>
                </div>
                <div
                  className={styles.podiumName}
                  onMouseEnter={(e) => handleTextHover(e, third.name, "name")}
                  onMouseLeave={handleTextLeave}
                >
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
          const avatarUrl = player.avatar || generateRandomAvatar(player.name);
          const uniqueKey = `${player.uuid}-${player.id}-${rank}`;

          return (
            <div
              key={uniqueKey}
              className={styles.playerCard}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className={styles.playerAvatarContainer}>
                <img src={avatarUrl} alt={player.name} className={styles.playerAvatar} />
                <div className={styles.playerRankBadge}>{getRankBadge(rank, 14)}</div>
              </div>
              <div className={styles.playerInfo}>
                <div
                  className={styles.playerName}
                  onMouseEnter={(e) =>
                    handleTextHover(
                      e,
                      `${player.name} ${player.uuid === playerUUID ? "(You)" : ""}`,
                      "name"
                    )
                  }
                  onMouseLeave={handleTextLeave}
                >
                  <UserIcon size={14} weight="bold" className={styles.playerIcon} />
                  {player.name} {player.uuid === playerUUID && "(You)"}
                </div>
                <div className={styles.playerStats}>
                  {player.correct !== undefined && (
                    <span className={styles.iconCorrect}>
                      <CheckCircleIcon size={12} weight="fill" />
                      {player.correct}
                    </span>
                  )}
                  {player.wrong !== undefined && (
                    <span className={styles.iconWrong}>
                      <XCircleIcon size={12} weight="fill" />
                      {player.wrong}
                    </span>
                  )}
                  {player.responseTime !== undefined && (
                    <span className={styles.iconTime}>
                      <TimerIcon size={12} weight="fill" />
                      {player.responseTime}s
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.playerScore}>
                <TrophyIcon size={16} weight="fill" className={styles.trophyIcon} />
                {player.score}
              </div>
            </div>
          );
        })}
      </div>
      {/* Player Performance Stats Section */}
      <div className={styles.performanceSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>PLAYER PERFORMANCE DETAILS</h2>
          <div className={styles.sectionSubtitle}>
            Individual statistics and metrics for all players
          </div>
        </div>

        <div className={styles.performanceGrid}>
          {animatedLeaderboard.map((player, index) => {
            const rank = index + 1;
            const avatarUrl = player.avatar || generateRandomAvatar(player.name);
            const accuracy = getPlayerAccuracy(player);
            const totalAttempts = (player.correct || 0) + (player.wrong || 0);
            const performanceRating = getPerformanceRating(player);
            const responseTimeRating = getResponseTimeRating(player.responseTime);
            const correctPercent =
              totalAttempts > 0 ? Math.round(((player.correct || 0) / totalAttempts) * 100) : 0;
            const wrongPercent =
              totalAttempts > 0 ? Math.round(((player.wrong || 0) / totalAttempts) * 100) : 0;
            const performanceText =
              accuracy >= 90
                ? "Outstanding accuracy!"
                : accuracy >= 80
                  ? "Great performance"
                  : accuracy >= 70
                    ? "Solid effort"
                    : accuracy >= 60
                      ? "Keep improving"
                      : "Practice makes perfect";

            return (
              <div key={`${player.uuid}-${player.id}-${index}`} className={styles.performanceCard}>
                <div className={styles.performanceCardHeader}>
                  <div className={styles.performanceAvatarContainer}>
                    <img src={avatarUrl} alt={player.name} className={styles.performanceAvatar} />
                  </div>
                  <div className={styles.performancePlayer}>
                    <div
                      className={styles.performanceName}
                      onMouseEnter={(e) =>
                        handleTextHover(
                          e,
                          `${player.name} ${player.uuid === playerUUID ? "(You)" : ""}`,
                          "name"
                        )
                      }
                      onMouseLeave={handleTextLeave}
                    >
                      <UserIcon size={16} weight="bold" />
                      {player.name}
                      {player.uuid === playerUUID && (
                        <span className={styles.performanceYouTag}>(You)</span>
                      )}
                    </div>
                    <div className={styles.performanceScoreRank}>
                      <div className={styles.performanceScore}>
                        <TrophyIcon size={14} weight="fill" />
                        {player.score} points
                      </div>
                      <div className={styles.performanceRankBadge}>{getRankBadge(rank, 16)}</div>
                    </div>
                  </div>
                </div>

                <div className={styles.performanceStats}>
                  <div className={styles.statRow}>
                    <div className={styles.statItem}>
                      <div className={styles.statIcon}>
                        <TargetIcon size={20} weight="fill" />
                      </div>
                      <div className={styles.statContent}>
                        <div className={styles.statLabel}>Accuracy</div>
                        <div
                          className={styles.statValue}
                          onMouseEnter={(e) => handleTextHover(e, `${accuracy}%`, "value")}
                          onMouseLeave={handleTextLeave}
                        >
                          {accuracy}%
                        </div>
                        <div className={styles.statBar}>
                          <div className={styles.statBarFill} style={{ width: `${accuracy}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className={styles.statItem}>
                      <div className={styles.statIcon}>
                        <CheckCircleIcon size={20} weight="fill" />
                      </div>
                      <div className={styles.statContent}>
                        <div className={styles.statLabel}>Correct</div>
                        <div
                          className={styles.statValue}
                          onMouseEnter={(e) =>
                            handleTextHover(e, `${player.correct || 0}`, "value")
                          }
                          onMouseLeave={handleTextLeave}
                        >
                          {player.correct || 0}
                        </div>
                        <div
                          className={styles.statSubtext}
                          onMouseEnter={(e) =>
                            handleTextHover(
                              e,
                              totalAttempts > 0 ? `${correctPercent}% of total` : "No attempts",
                              "subtext"
                            )
                          }
                          onMouseLeave={handleTextLeave}
                        >
                          {totalAttempts > 0 ? `${correctPercent}% of total` : "No attempts"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.statRow}>
                    <div className={styles.statItem}>
                      <div className={styles.statIcon}>
                        <XCircleIcon size={20} weight="fill" />
                      </div>
                      <div className={styles.statContent}>
                        <div className={styles.statLabel}>Wrong</div>
                        <div
                          className={styles.statValue}
                          onMouseEnter={(e) => handleTextHover(e, `${player.wrong || 0}`, "value")}
                          onMouseLeave={handleTextLeave}
                        >
                          {player.wrong || 0}
                        </div>
                        <div
                          className={styles.statSubtext}
                          onMouseEnter={(e) =>
                            handleTextHover(
                              e,
                              totalAttempts > 0 ? `${wrongPercent}% of total` : "No attempts",
                              "subtext"
                            )
                          }
                          onMouseLeave={handleTextLeave}
                        >
                          {totalAttempts > 0 ? `${wrongPercent}% of total` : "No attempts"}
                        </div>
                      </div>
                    </div>

                    <div className={styles.statItem}>
                      <div className={styles.statIcon}>
                        <TimerIcon size={20} weight="fill" />
                      </div>
                      <div className={styles.statContent}>
                        <div className={styles.statLabel}>Response Time</div>
                        <div
                          className={styles.statValue}
                          onMouseEnter={(e) =>
                            handleTextHover(
                              e,
                              player.responseTime ? `${player.responseTime.toFixed(1)}s` : "N/A",
                              "value"
                            )
                          }
                          onMouseLeave={handleTextLeave}
                        >
                          {player.responseTime?.toFixed(1) || "N/A"}s
                        </div>
                        <div
                          className={styles.statSubtext}
                          onMouseEnter={(e) => handleTextHover(e, responseTimeRating, "subtext")}
                          onMouseLeave={handleTextLeave}
                        >
                          {responseTimeRating}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.statRow}>
                    <div className={styles.statItem}>
                      <div className={styles.statIcon}>
                        <TrendingUpIcon size={20} weight="fill" />
                      </div>
                      <div className={styles.statContent}>
                        <div className={styles.statLabel}>Performance</div>
                        <div
                          className={styles.statValue}
                          onMouseEnter={(e) => handleTextHover(e, performanceRating, "value")}
                          onMouseLeave={handleTextLeave}
                        >
                          {performanceRating}
                        </div>
                        <div
                          className={styles.statSubtext}
                          onMouseEnter={(e) => handleTextHover(e, performanceText, "subtext")}
                          onMouseLeave={handleTextLeave}
                        >
                          {performanceText}
                        </div>
                      </div>
                    </div>

                    <div className={styles.statItem}>
                      <div className={styles.statIcon}>
                        <LightningIcon size={20} weight="fill" />
                      </div>
                      <div className={styles.statContent}>
                        <div className={styles.statLabel}>Total Attempts</div>
                        <div
                          className={styles.statValue}
                          onMouseEnter={(e) => handleTextHover(e, `${totalAttempts}`, "value")}
                          onMouseLeave={handleTextLeave}
                        >
                          {totalAttempts}
                        </div>
                        <div
                          className={styles.statSubtext}
                          onMouseEnter={(e) =>
                            handleTextHover(
                              e,
                              `${player.correct || 0} correct + ${player.wrong || 0} wrong`,
                              "subtext"
                            )
                          }
                          onMouseLeave={handleTextLeave}
                        >
                          {player.correct || 0} correct + {player.wrong || 0} wrong
                        </div>
                        <div className={styles.seeDetailsContainer}></div>
                      </div>
                    </div>
                  </div>
                  <button
                    className={styles.seeDetailsButton}
                    onClick={() => handleSeeDetails(player)}
                  >
                    <EyeIcon size={14} weight="bold" />
                    See Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Stats Section */}
      {first && (
        <div className={styles.statsSection}>
          <h2 className={styles.statsTitle}>
            <StarIcon size={24} weight="fill" className={styles.titleIcon} />
            TOP PERFORMER STATS
          </h2>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E0" />
                <XAxis dataKey="name" stroke="#4A5568" fontSize={10} />
                <YAxis stroke="#4A5568" fontSize={10} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#FFFAF7",
                    border: "2px solid #2D3748",
                    borderRadius: 0,
                    color: "#2D3748",
                  }}
                />
                <Bar dataKey="score" radius={[2, 2, 0, 0]}>
                  {barChartData.map((entry, index) => (
                    <Cell key={entry.key} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {first.correct !== undefined && (
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <CheckCircleIcon size={24} weight="fill" className={styles.statIcon} />
                <div
                  className={styles.statValue}
                  onMouseEnter={(e) => handleTextHover(e, `${first.correct}`, "value")}
                  onMouseLeave={handleTextLeave}
                >
                  {first.correct}
                </div>
                <div className={styles.statLabel}>Correct</div>
              </div>
              <div className={styles.statItem}>
                <XCircleIcon size={24} weight="fill" className={styles.statIcon} />
                <div
                  className={styles.statValue}
                  onMouseEnter={(e) => handleTextHover(e, `${first.wrong || 0}`, "value")}
                  onMouseLeave={handleTextLeave}
                >
                  {first.wrong || 0}
                </div>
                <div className={styles.statLabel}>Wrong</div>
              </div>
              <div className={styles.statItem}>
                <TargetIcon size={24} weight="fill" className={styles.statIcon} />
                <div
                  className={styles.statValue}
                  onMouseEnter={(e) =>
                    handleTextHover(
                      e,
                      `${(first.correct || 0) + (first.wrong || 0) > 0 ? Math.round(((first.correct || 0) / ((first.correct || 0) + (first.wrong || 0))) * 100) : 0}%`,
                      "value"
                    )
                  }
                  onMouseLeave={handleTextLeave}
                >
                  {(first.correct || 0) + (first.wrong || 0) > 0
                    ? Math.round(
                        ((first.correct || 0) / ((first.correct || 0) + (first.wrong || 0))) * 100
                      )
                    : 0}
                  %
                </div>
                <div className={styles.statLabel}>Accuracy</div>
              </div>
              <div className={styles.statItem}>
                <TrophyIcon size={24} weight="fill" className={styles.statIcon} />
                <div
                  className={styles.statValue}
                  onMouseEnter={(e) => handleTextHover(e, `${first.score}`, "value")}
                  onMouseLeave={handleTextLeave}
                >
                  {first.score}
                </div>
                <div className={styles.statLabel}>Points</div>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedPlayer && (
        <ResultModal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          player={selectedPlayer}
          gameCode={gameCode}
        />
      )}
    </div>
  );
}
