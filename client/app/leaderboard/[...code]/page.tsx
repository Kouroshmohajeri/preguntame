// app/leaderboard/[code]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Leaderboard, { Player, PlayerAnswer } from "@/components/LeaderBoard/LeaderBoard";
import { getGameResult, assignPlayer } from "@/app/api/gameResult/actions";
import { updateUserStats } from "@/app/api/users/actions";
import { useSession } from "next-auth/react";
import { ConfettiSideCannons } from "@/components/ConfettiSideCannons/ConfettiSideCannons";
import LoadingLeaderboard from "@/components/LeaderBoard/LoadingLeaderboard/LoadingLeaderboard";
import PixelMenu from "@/components/PixelMenu/PixelMenu";

// Define the API response type
interface ApiPlayerAnswer {
  questionIndex: number;
  answerId: string;
  isCorrect: boolean;
  points: number;
  timeLeft: number;
  _id: string; // The API returns this!
}

interface ApiPlayer {
  playerId: string;
  name: string;
  avatar: string;
  uuid: string;
  score: number;
  correct: number;
  wrong: number;
  isAssigned: boolean;
  responseTime: number;
  answers: ApiPlayerAnswer[];
  _id: string;
}

interface ApiGameResult {
  _id: string;
  gameCode: string;
  hostId: string;
  players: ApiPlayer[];
  createdAt: string;
  __v: number;
}

export default function LeaderboardPage() {
  const params = useParams();
  const codeParam = params.code;
  const gameCode: string = Array.isArray(codeParam) ? codeParam[0] : codeParam!!;
  const { data: session } = useSession();

  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [playerUUID, setPlayerUUID] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasShownConfetti, setHasShownConfetti] = useState(false);

  useEffect(() => {
    setPlayerUUID(localStorage.getItem("playerUUID"));
  }, []);

  useEffect(() => {
    const loadResults = async () => {
      try {
        setIsLoading(true);
        const result = (await getGameResult(gameCode)) as ApiGameResult;

        // Create a Set to track processed UUIDs and prevent duplicates
        const seenUUIDs = new Set<string>();
        const mappedPlayers: Player[] = [];

        result.players.forEach((p, index) => {
          // Skip if we've already processed this UUID
          if (seenUUIDs.has(p.uuid)) {
            console.warn(`Duplicate player UUID detected: ${p.uuid} - skipping`);
            return;
          }

          seenUUIDs.add(p.uuid);

          // Convert API answers to component answers
          const playerAnswers: PlayerAnswer[] = (p.answers || []).map((answer) => ({
            questionIndex: answer.questionIndex,
            answerId: answer.answerId,
            isCorrect: answer.isCorrect,
            points: answer.points,
            timeLeft: answer.timeLeft,
            _id: answer._id, // This is included!
          }));

          mappedPlayers.push({
            // Create a stable ID without timestamp
            id: p.playerId,
            name: p.name,
            avatar: p.avatar,
            score: p.score,
            correct: p.correct,
            wrong: p.wrong,
            uuid: p.uuid,
            responseTime: p.responseTime,
            isAssigned: p.isAssigned,
            answers: playerAnswers, // Pass the converted answers
          });
        });

        // Sort by score descending
        const sortedPlayers = mappedPlayers.sort((a, b) => b.score - a.score);
        setLeaderboard(sortedPlayers);

        // Show confetti celebration when leaderboard loads (only once)
        if (!hasShownConfetti && sortedPlayers.length > 0) {
          setShowConfetti(true);
          setHasShownConfetti(true);

          // Auto-hide after 3 seconds (matches confetti duration)
          setTimeout(() => {
            setShowConfetti(false);
          }, 3000);
        }

        const uuid = localStorage.getItem("playerUUID");
        if (!uuid) {
          setIsLoading(false);
          return;
        }

        const current = mappedPlayers.find((p) => p.uuid === uuid);
        if (!current) {
          setIsLoading(false);
          return;
        }

        // Only proceed if player is not already assigned AND user is logged in
        if (!current.isAssigned && session?.user?.email) {
          try {
            await updateUserStats({
              email: session.user.email,
              score: current.score,
              correct: current.correct || 0,
              wrong: current.wrong || 0,
            });

            // Mark player as assigned
            await assignPlayer(gameCode, uuid);

            // Update the local state to reflect assignment
            setLeaderboard((prev) =>
              prev.map((player) =>
                player.uuid === uuid ? { ...player, isAssigned: true } : player
              )
            );
          } catch (error) {
            console.error("Failed to update user stats:", error);
          }
        }
      } catch (error) {
        console.error("Failed to load results:", error);
        setLeaderboard([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [gameCode, session, hasShownConfetti]);

  if (isLoading) {
    return <LoadingLeaderboard />;
  }

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 100,
        }}
      >
        <PixelMenu currentPage="leaderboard" />
      </div>
      {/* Confetti overlay - triggers automatically when showConfetti is true */}
      {showConfetti && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          <ConfettiSideCannons />
        </div>
      )}

      {/* Leaderboard */}
      <Leaderboard leaderboard={leaderboard} gameCode={gameCode} />
    </>
  );
}
