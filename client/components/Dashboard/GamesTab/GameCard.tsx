"use client";
import { useRouter } from "next/navigation";
import { Game } from "../type";
import { QuestionMark, CalendarHeart, Sparkle, Trophy } from "@phosphor-icons/react";
import { useToast } from "@/context/ToastContext/ToastContext";

import { exportGameToPdf } from "@/utils/exportGameToPdf";
import styles from "./GameCard.module.css";
import { getGame } from "@/app/api/game/actions";
import { deleteGameResult, getGameResult } from "@/app/api/gameResult/actions";

interface Props {
  game: Game;
  onShare: () => void;
  onDelete: () => void;
}

export default function GameCard({ game, onShare, onDelete }: Props) {
  const router = useRouter();
  const { showToast } = useToast();

  const handleExportGame = async () => {
    try {
      const fetchedGame = await getGame(game.gameCode);
      const exportableGame = {
        title: fetchedGame.title,
        gameCode: fetchedGame.gameCode,
        createdAt: fetchedGame.createdAt,
        questions: fetchedGame.questions.map((q: any) => ({
          text: q.text,
          answers: q.answers.map((a: any) => ({
            text: a.text,
            correct: a.correct,
            _id: a._id,
          })),
          order: q.order,
          time: q.time,
          _id: q._id,
        })),
      };
      await exportGameToPdf(exportableGame);
      showToast("PDF exported successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to export PDF", "error");
    }
  };

  const handleHost = async () => {
    try {
      const existing = await getGameResult(game.gameCode);
      if (existing?._id) {
        await deleteGameResult(game.gameCode);
      }
    } catch (e) {
      // ignore 404
    }
    router.push(`/play/host/${game.gameCode}`);
  };

  // ✅ Handle leaderboard navigation
  const handleLeaderboard = () => {
    router.push(`/leaderboard/${game.gameCode}`);
  };

  // Check if game is AI-generated
  const isAiGame = game.isAi === true;
  // ✅ Check if game has been played
  const hasBeenPlayed = game.hasPlayed === true;

  return (
    <div className={styles.gameCard}>
      <div className={styles.gameHeader}>
        <div className={styles.titleSection}>
          <h3 className={styles.gameTitle}>{game.title}</h3>
          <div className={styles.badgeContainer}>
            {/* ✅ Show AI badge if game is AI-generated */}
            {isAiGame && (
              <div className={styles.aiBadge}>
                <Sparkle size={14} weight="fill" />
                AI Generated
              </div>
            )}
            {/* ✅ Show Played badge if game has been played */}
            {hasBeenPlayed && (
              <div className={styles.playedBadge}>
                <Trophy size={14} weight="fill" />
                Played
              </div>
            )}
          </div>
        </div>
        <div className={styles.gameCode}>#{game.gameCode}</div>
      </div>

      <div className={styles.gameStats}>
        <div className={styles.gameStat}>
          <QuestionMark size={20} className={styles.statIconSmall} />
          {game.questions.length} Question{game.questions.length !== 1 ? "s" : ""}
        </div>
        <div className={styles.gameStat}>
          <CalendarHeart size={20} className={styles.statIconSmall} />
          {new Date(game.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className={styles.gameActions}>
        <button onClick={handleHost} className={styles.playButton}>
          HOST
        </button>
        {/* ✅ Show LEADERBOARD button only if game has been played */}
        {hasBeenPlayed && (
          <button onClick={handleLeaderboard} className={styles.leaderboardButton}>
            LEADERBOARD
          </button>
        )}
        <button onClick={onShare} className={styles.shareButton}>
          SHARE
        </button>
        <button onClick={() => router.push(`/edit/${game.gameCode}`)} className={styles.editButton}>
          EDIT
        </button>
        <button onClick={handleExportGame} className={styles.exportButton}>
          EXPORT
        </button>
        <button onClick={onDelete} className={styles.deleteButton}>
          DELETE
        </button>
      </div>
    </div>
  );
}
