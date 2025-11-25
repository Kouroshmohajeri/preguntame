"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Leaderboard, { Player } from "@/components/LeaderBoard/LeaderBoard";
import { getGameResult, assignPlayer } from "@/app/api/gameResult/actions";
import { updateUserStats } from "@/app/api/users/actions";
import { useSession } from "next-auth/react";

export default function LeaderboardPage() {
  const params = useParams();
  const codeParam = params.code;
  const gameCode: string = Array.isArray(codeParam) ? codeParam[0] : codeParam!!;
  const { data: session } = useSession();

  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [playerUUID, setPlayerUUID] = useState<string | null>(null);

  useEffect(() => {
    setPlayerUUID(localStorage.getItem("playerUUID"));
  }, []);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const result = await getGameResult(gameCode);

        const mappedPlayers: Player[] = result.players.map((p) => ({
          id: p.playerId || "",
          name: p.name,
          score: p.score,
          correct: p.correct,
          wrong: p.wrong,
          uuid: p.uuid,
          responseTime: p.responseTime,
          isAssigned: p.isAssigned,
        }));

        setLeaderboard(mappedPlayers);

        const uuid = localStorage.getItem("playerUUID");
        if (!uuid) return;

        const current = mappedPlayers.find((p) => p.uuid === uuid);
        if (!current) return;

        // ❌ DO NOTHING if already assigned — prevents duplicates
        if (current.isAssigned) return;

        // User must be logged in
        if (session?.user?.email) {
          await updateUserStats({
            email: session.user.email,
            score: current.score,
            correct: current.correct || 0,
            wrong: current.wrong || 0,
          });

          // Mark player as assigned
          await assignPlayer(gameCode, uuid);
        }
      } catch (error) {
        console.error("Failed to load results:", error);
        setLeaderboard([]);
      }
    };

    loadResults();
  }, [gameCode, session]);

  return <Leaderboard leaderboard={leaderboard} />;
}
