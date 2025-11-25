"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getGame } from "@/app/api/game/actions";
import { useSocket } from "@/context/SocketContext/SocketContext";
import styles from "./GuestPlayroom.module.css";

interface Answer {
  _id: string;
  text: string;
  correct: boolean;
}

interface Question {
  _id: string;
  text: string;
  answers: Answer[];
}

interface Game {
  _id: string;
  title: string;
  gameCode: string;
  questions: Question[];
  createdAt: string;
}

const shapes = ["●", "■", "▲", "◆"];

export default function GuestPlayroom() {
  const params = useParams();
  const codeParam = params.code;
  const gameCode = Array.isArray(codeParam) ? codeParam[0] : codeParam;
  if (!gameCode) {
    console.error("❌ No gameCode found in URL");
    return null;
  }
  const socket = useSocket();

  const [game, setGame] = useState<Game | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [timerActive, setTimerActive] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPreparation, setShowPreparation] = useState(false);
  const [preparationTime, setPreparationTime] = useState(3);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const currentQuestion = game?.questions[currentQuestionIndex];
  const totalQuestions = game?.questions.length || 0;
  const answerCount = currentQuestion?.answers.length || 0;
  const progressPercentage = (timeLeft / 20) * 100;
  function getOrCreatePlayerUUID() {
    let uuid = localStorage.getItem("playerUUID");
    if (!uuid) {
      uuid = crypto.randomUUID();
      localStorage.setItem("playerUUID", uuid);
    }
    return uuid;
  }
  const playerUUID = getOrCreatePlayerUUID();

  // 🧩 Server-authoritative socket join + question start
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log("✅ Guest connected, joining:", gameCode);

      const storedPlayer = localStorage.getItem("playerInfo");
      const playerName = storedPlayer
        ? JSON.parse(storedPlayer).name
        : "Guest_" + Math.floor(Math.random() * 1000);

      socket.emit("joinGame", { gameCode, playerName, playerUUID });
    };

    const handleStartQuestion = ({
      questionIndex,
      timeLeft,
    }: {
      questionIndex: number;
      timeLeft?: number;
    }) => {
      setCurrentQuestionIndex(questionIndex);
      setShowPreparation(false);
      setShowCorrectAnswer(false);
      setSelectedAnswer(null);
      setTimeLeft(typeof timeLeft === "number" ? timeLeft : 20);
      setTimerActive(true);
    };

    const handleShowCorrectAnswer = () => {
      setShowCorrectAnswer(true);
      setTimerActive(false);
    };

    socket.on("connect", handleConnect);
    socket.on("startQuestion", handleStartQuestion);
    socket.on("showCorrectAnswer", handleShowCorrectAnswer);

    if (socket.connected) handleConnect();

    return () => {
      socket.emit("leaveGame", { gameCode });
      socket.off("connect", handleConnect);
      socket.off("startQuestion", handleStartQuestion);
      socket.off("showCorrectAnswer", handleShowCorrectAnswer);
    };
  }, [socket, gameCode]);

  // Sync time from host
  useEffect(() => {
    if (!socket) return;

    const handleUpdateTimer = ({ timeLeft }: { timeLeft: number }) => {
      setTimeLeft(timeLeft);
    };

    socket.on("updateTimer", handleUpdateTimer);
    return () => {
      socket.off("updateTimer", handleUpdateTimer);
    };
  }, [socket]);

  // ⏱️ Local timer fallback (for smoother UX)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timerActive && timeLeft === 0) {
      setShowCorrectAnswer(true);
      setTimerActive(false);
    }
    return () => clearTimeout(timer);
  }, [timerActive, timeLeft]);

  // 🧠 Preparation countdown
  useEffect(() => {
    let prepTimer: NodeJS.Timeout;
    if (showPreparation && preparationTime > 0) {
      prepTimer = setTimeout(() => setPreparationTime((t) => t - 1), 1000);
    } else if (showPreparation && preparationTime === 0) {
      setShowPreparation(false);
      setPreparationTime(3);
      startQuestionTimer();
    }
    return () => clearTimeout(prepTimer);
  }, [showPreparation, preparationTime]);

  // 🎮 Load game data
  const loadGame = async () => {
    try {
      const gameData = await getGame(gameCode);
      setGame(gameData);
    } catch (err) {
      console.error("Error loading game:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadGame();
  }, [gameCode]);

  const startQuestionTimer = () => {
    setTimerActive(true);
    setSelectedAnswer(null);
  };

  // 🧩 Handle answer submission
  const handleAnswer = (answerId: string) => {
    if (!socket || !timerActive || showCorrectAnswer || !currentQuestion) return;

    setSelectedAnswer(answerId);

    const isCorrect = currentQuestion.answers.find((a) => a._id === answerId)?.correct || false;

    socket.emit("playerAnswer", {
      gameCode,
      playerUUID,
      questionIndex: currentQuestionIndex,
      answerId,
      timeLeft,
    });

    console.log(`Answer sent → ${isCorrect ? "✅ Correct" : "❌ Wrong"} (${timeLeft}s left)`);
  };

  // 🧱 UI Rendering
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>JOINING GAME...</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Game not found</div>
      </div>
    );
  }

  const getGridLayout = () => {
    switch (answerCount) {
      case 2:
        return styles.twoAnswers;
      case 3:
        return styles.threeAnswers;
      case 4:
        return styles.fourAnswers;
      default:
        return styles.twoAnswers;
    }
  };

  return (
    <div className={styles.container}>
      {/* Preparation Overlay */}
      {showPreparation && (
        <div className={styles.preparationOverlay}>
          <div className={styles.preparationModal}>
            <div className={styles.preparationTitle}>GET READY!</div>
            <div className={styles.preparationCounter}>{preparationTime}</div>
            <div className={styles.preparationSubtitle}>Next question starting...</div>
          </div>
        </div>
      )}

      {/* Timer bar */}
      <div className={styles.progressBarContainer}>
        <div
          className={`${styles.progressBar} ${timeLeft <= 5 ? styles.progressWarning : ""}`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.gameInfo}>
          <div className={styles.gameTitle}>{game.title}</div>
          <div className={styles.roomCode}>#{game.gameCode}</div>
        </div>
        <div className={styles.timerDesktop}>
          <div
            className={`${styles.timer} ${
              timerActive ? styles.timerActive : ""
            } ${timeLeft <= 5 ? styles.timerWarning : ""}`}
          >
            {timeLeft}s
          </div>
          <div className={styles.timerLabel}>
            {timerActive ? "TIME REMAINING" : showCorrectAnswer ? "TIME'S UP!" : "READY"}
          </div>
        </div>
      </div>

      {/* Question */}
      <div className={styles.questionSection}>
        <div className={styles.questionHeader}>
          <span className={styles.questionLabel}>QUESTION {currentQuestionIndex + 1}</span>
          <span className={styles.questionCounter}>
            {currentQuestionIndex + 1}/{totalQuestions}
          </span>
        </div>
        <div className={styles.questionText}>{currentQuestion?.text}</div>
      </div>

      {/* Answers */}
      <div className={styles.answersSection}>
        <div className={`${styles.answersGrid} ${getGridLayout()}`}>
          {currentQuestion?.answers.map((answer, index) => {
            const isSelected = selectedAnswer === answer._id;
            const isCorrect = answer.correct;
            const showCorrect = showCorrectAnswer && isCorrect;
            const showIncorrect = showCorrectAnswer && isSelected && !isCorrect;

            return (
              <button
                key={answer._id}
                className={`${styles.answerButton} ${
                  isSelected ? styles.selectedAnswer : ""
                } ${showCorrect ? styles.correctAnswer : ""} ${
                  showIncorrect ? styles.incorrectAnswer : ""
                }`}
                onClick={() => handleAnswer(answer._id)}
                disabled={showCorrectAnswer || !timerActive}
              >
                <div className={styles.answerContent}>
                  <div className={styles.answerShape}>{shapes[index]}</div>
                  <div className={styles.answerText}>{answer.text}</div>
                </div>
                {showCorrect && <div className={styles.correctBadge}>✓ CORRECT</div>}
                {showIncorrect && <div className={styles.incorrectBadge}>✗ WRONG</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile footer */}
      <div className={styles.progressInfo}>
        Question {currentQuestionIndex + 1} of {totalQuestions}
        {showCorrectAnswer && (
          <span className={styles.answerStatus}>
            • {selectedAnswer ? "Answer submitted" : "No answer submitted"}
          </span>
        )}
      </div>
    </div>
  );
}
