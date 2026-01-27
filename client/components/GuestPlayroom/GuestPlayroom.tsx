"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  const router = useRouter();

  const [game, setGame] = useState<Game | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [timerActive, setTimerActive] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [waitingForQuestion, setWaitingForQuestion] = useState(true);

  // ✅ NEW: State for countdown/preparation
  const [isPreparing, setIsPreparing] = useState(false);
  const [prepCount, setPrepCount] = useState(3);

  const hasJoinedRef = useRef(false);

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

  // Load game data
  useEffect(() => {
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

    loadGame();
  }, [gameCode]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      if (hasJoinedRef.current) return;

      const storedPlayer = localStorage.getItem("playerInfo");
      const playerName = storedPlayer
        ? JSON.parse(storedPlayer).name
        : "Guest_" + Math.floor(Math.random() * 1000);

      // nclude avatar from localStorage
      const avatar = storedPlayer ? JSON.parse(storedPlayer).avatar : undefined;

      socket.emit("joinGame", {
        gameCode,
        playerName,
        playerUUID,
        avatar,
      });

      hasJoinedRef.current = true;
    };

    // ✅ UPDATED: Handle countdown signal with "Read Question" phase
    const handleShowPreparation = () => {
      setWaitingForQuestion(false);
      setIsPreparing(true);
      setPrepCount(3);

      let count = 3;
      const interval = setInterval(() => {
        count--;
        if (count > 0) {
          setPrepCount(count);
        } else {
          // When we reach 0, we don't stop showing the screen
          // We just set it to 0 to trigger the "Read Question" message
          setPrepCount(0);
          clearInterval(interval);
        }
      }, 1000);
    };

    const handleStartQuestion = ({
      questionIndex,
      timeLeft: initialTime,
    }: {
      questionIndex: number;
      timeLeft?: number;
    }) => {
      setIsPreparing(false); // Stop countdown screen immediately
      setWaitingForQuestion(false);
      setCurrentQuestionIndex(questionIndex);
      setShowCorrectAnswer(false);
      setSelectedAnswer(null);
      setTimeLeft(typeof initialTime === "number" ? initialTime : 20);
      setTimerActive(true);
    };

    const handleUpdateTimer = ({ timeLeft: newTime }: { timeLeft: number }) => {
      setTimeLeft(newTime);
    };

    const handleShowCorrectAnswer = () => {
      setShowCorrectAnswer(true);
      setTimerActive(false);
    };

    const handleGameEnded = ({ leaderboard }: { leaderboard: any[] }) => {
      localStorage.removeItem("playerInfo");
      localStorage.removeItem(`draft_${gameCode}`);

      setTimeout(() => {
        router.push(`/leaderboard/${gameCode}`);
      }, 500);
    };

    socket.on("connect", handleConnect);
    socket.on("showPreparation", handleShowPreparation);
    socket.on("startQuestion", handleStartQuestion);
    socket.on("updateTimer", handleUpdateTimer);
    socket.on("showCorrectAnswer", handleShowCorrectAnswer);
    socket.on("gameEnded", handleGameEnded);

    if (socket.connected) handleConnect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("showPreparation", handleShowPreparation);
      socket.off("startQuestion", handleStartQuestion);
      socket.off("updateTimer", handleUpdateTimer);
      socket.off("showCorrectAnswer", handleShowCorrectAnswer);
      socket.off("gameEnded", handleGameEnded);
    };
  }, [socket, gameCode, playerUUID, router]);

  // Local timer fallback
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

  const handleAnswer = (answerId: string) => {
    if (!socket || !timerActive || showCorrectAnswer || !currentQuestion) return;

    setSelectedAnswer(answerId);

    socket.emit("playerAnswer", {
      gameCode,
      playerUUID,
      questionIndex: currentQuestionIndex,
      answerId,
      timeLeft,
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>LOADING GAME...</div>
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

  // ✅ UPDATED: Countdown Display Logic
  if (isPreparing) {
    return (
      <div className={styles.container}>
        <div className={styles.waitingScreen}>
          {prepCount > 0 ? (
            // 3... 2... 1...
            <>
              <div className={styles.waitingTitle} style={{ fontSize: "5rem", color: "#FF6B6B" }}>
                {prepCount}
              </div>
              <div className={styles.waitingMessage}>GET READY!</div>
            </>
          ) : (
            // After 1, show this until the answers appear
            <>
              <div className={styles.waitingTitle} style={{ fontSize: "3rem", color: "#4ECDC4" }}>
                👀
              </div>
              <div
                className={styles.waitingMessage}
                style={{
                  fontSize: "1.5rem",
                  marginTop: "1rem",
                  maxWidth: "80%",
                  textAlign: "center",
                  lineHeight: "1.4",
                }}
              >
                READ THE QUESTION
                <br />
                ON HOST SCREEN
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (waitingForQuestion) {
    return (
      <div className={styles.container}>
        <div className={styles.waitingScreen}>
          <div className={styles.waitingTitle}>GET READY!</div>
          <div className={styles.waitingMessage}>Waiting for host to start the game...</div>
          <div className={styles.waitingSpinner}>⏳</div>
        </div>
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
