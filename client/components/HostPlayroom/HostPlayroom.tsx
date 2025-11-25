"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getGame } from "@/app/api/game/actions";
import styles from "./HostPlayroom.module.css";
import { useSocket } from "@/context/SocketContext/SocketContext";
import { useSession } from "next-auth/react";
import LoginModal from "../LoginModal/LoginModal";
import RetroErrorModal from "../RetroErrorModal/RetroErrorModal";
// import { createGameResult } from "@/app/api/gameResult/actions";

interface Answer {
  _id: string;
  text: string;
  correct: boolean;
}

interface Question {
  _id: string;
  text: string;
  answers: Answer[];
  time: number;
}

interface Game {
  _id: string;
  title: string;
  gameCode: string;
  questions: Question[];
  createdAt: string;
}

interface Player {
  id: string;
  name: string;
  avatar: string;
  isReady: boolean;
  score?: number;
  isHost: boolean;
  uuid: string;
  correct?: number;
  wrong?: number;
  answers?: any[];
}

const shapes = ["●", "■", "▲", "◆"];

export default function HostPlayroom() {
  const params = useParams();
  const gameCode = params.code as string;

  const [game, setGame] = useState<Game | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPreparation, setShowPreparation] = useState(false);
  const [preparationTime, setPreparationTime] = useState(3);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerCount, setPlayerCount] = useState(0);
  const [animationClass, setAnimationClass] = useState("");
  const [playersBoxAnimation, setPlayersBoxAnimation] = useState("");
  const [isQuestionGrowing, setIsQuestionGrowing] = useState(false);
  const [showQuestionContent, setShowQuestionContent] = useState(false);
  const [showAnswersButton, setShowAnswersButton] = useState(false);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [playerUUID, setPlayerUUID] = useState<string | null>(null);
  const [resultsSaved, setResultsSaved] = useState(false);

  const { data: session, status } = useSession();
  const router = useRouter();
  const socket = useSocket();

  const prevPlayerCountRef = useRef(0);
  const prevPlayersRef = useRef<Player[]>([]);

  const currentQuestion = game?.questions[currentQuestionIndex];
  const isLastQuestion = game && currentQuestionIndex === game.questions.length - 1;
  const gameStarted = timerActive || showCorrectAnswer || showQuestionContent;

  useEffect(() => {
    loadGame();
  }, [gameCode]);

  useEffect(() => {
    if (status === "loading") return; // still checking session

    if (!session) {
      setShowLoginModal(true);
    } else {
      setShowLoginModal(false);
    }
  }, [session, status]);

  useEffect(() => {
    if (!socket) return;

    socket.on("leaderboardUpdate", (data) => {
      setLeaderboard(data);
    });

    return () => {
      socket.off("leaderboardUpdate");
    };
  }, [socket]);

  // Timer effects (keep these the same)
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (timerActive && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timerActive && timeLeft === 0) {
      setShowCorrectAnswer(true);
      setTimerActive(false);
    }

    return () => clearTimeout(timer);
  }, [timerActive, timeLeft]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let uuid = localStorage.getItem("playerUUID");
    if (!uuid) {
      uuid = crypto.randomUUID();
      localStorage.setItem("playerUUID", uuid);
    }

    setPlayerUUID(uuid);
  }, []);

  useEffect(() => {
    if (!game || !session) return;

    // Assuming your game object has hostId
    if ((game as any).hostId && session.user.id !== (game as any).hostId) {
      setShowAccessDenied(true);
    } else {
      setShowAccessDenied(false);
    }
  }, [game, session]);
  useEffect(() => {
    if (!socket || !session || !playerUUID) return;

    const handleConnect = (code: string) => {
      socket.emit("joinGame", {
        gameCode,
        playerName: session?.user?.name || "Host",
        playerUUID,
        hostId: session?.user?.id,
        isHost: true,
      });

      socket.emit("getRoomPlayers", { gameCode: code });
    };

    const handlePlayersUpdate = ({ players }: { players: Player[] }) => {
      // Animation logic
      const newPlayerCount = players.filter((p) => !p.isHost).length;
      const oldPlayerCount = prevPlayerCountRef.current;

      // Determine animation type
      if (newPlayerCount > oldPlayerCount) {
        setAnimationClass("increasing");
        setPlayersBoxAnimation("updating");
      } else if (newPlayerCount < oldPlayerCount) {
        setAnimationClass("decreasing");
        setPlayersBoxAnimation("flashing");
      } else {
        // Check if any player became ready
        const newReadyPlayers = players.filter((p) => p.isReady && !p.isHost);
        const oldReadyPlayers = prevPlayersRef.current.filter((p) => p.isReady && !p.isHost);

        if (newReadyPlayers.length > oldReadyPlayers.length) {
          setAnimationClass("rolling");
          setPlayersBoxAnimation("updating");
        } else if (players.length !== prevPlayersRef.current.length) {
          // General update with glitch effect
          setAnimationClass("glitching");
        }
      }

      // Update state
      setPlayers(players);
      setPlayerCount(newPlayerCount);
      prevPlayerCountRef.current = newPlayerCount;
      prevPlayersRef.current = players;

      // Clear animations after they complete
      setTimeout(() => {
        setAnimationClass("");
        setPlayersBoxAnimation("");
      }, 600);
    };

    const handleConnectEvent = () => handleConnect(gameCode);

    socket.on("connect", handleConnectEvent);
    socket.on("playersUpdate", handlePlayersUpdate);

    if (socket.connected) handleConnect(gameCode);

    return () => {
      socket.off("connect", handleConnectEvent);
      socket.off("playersUpdate", handlePlayersUpdate);
    };
  }, [socket, gameCode, session]); // Added session dependency

  // Timer sync with guests
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (timerActive && timeLeft > 0) {
      timer = setTimeout(() => {
        const newTime = timeLeft - 1;
        setTimeLeft(newTime);
        socket!.emit("timerTick", { gameCode, timeLeft: newTime });
      }, 1000);
    } else if (timerActive && timeLeft === 0) {
      setShowCorrectAnswer(true);
      setTimerActive(false);
      socket!.emit("showCorrectAnswer", { gameCode });
    }

    return () => clearTimeout(timer);
  }, [timerActive, timeLeft, gameCode, socket]);

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

  const startQuestionAnimation = (questionIndex: number) => {
    setIsQuestionGrowing(true);
    setShowQuestionContent(true);

    // Grow for 2 seconds, then shrink and start timer
    setTimeout(() => {
      setIsQuestionGrowing(false);

      // Start the actual timer after shrink completes
      setTimeout(() => {
        socket!.emit("hostStartQuestion", { gameCode, questionIndex });
        startQuestionTimer();
      }, 1000); // Shrink duration
    }, 3500); // Grow duration
  };

  const startQuestion = () => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }

    if ((game as any).hostId && session.user.id !== (game as any).hostId) {
      setShowAccessDenied(true);
      return;
    }

    setShowCorrectAnswer(false);

    // ⬅ HERE: set timer from DB
    setTimeLeft(currentQuestion?.time ?? 10);

    setShowQuestionContent(false);

    socket!.emit("toggleReady", { gameCode, isReady: true });
    socket!.emit("startGame", { gameCode });

    setShowPreparation(true);
    setPreparationTime(3);

    const prepInterval = setInterval(() => {
      setPreparationTime((prev) => {
        if (prev <= 1) {
          clearInterval(prepInterval);
          setShowPreparation(false);
          startQuestionAnimation(currentQuestionIndex);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startQuestionTimer = () => {
    setTimerActive(true);
  };

  const nextQuestion = () => {
    const newIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(newIndex);
    setShowCorrectAnswer(false);

    // ⬅ use DB timer for next question
    setTimeLeft(game!.questions[newIndex].time ?? 10);

    setShowQuestionContent(false);

    if (newIndex === game!.questions.length - 1) {
      setShowAnswersButton(true);
    }

    startQuestionAnimation(newIndex);
  };

  const showResults = async () => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }

    try {
      // 1️⃣ End game for all players
      socket!.emit("endGame", { gameCode });

      // 2️⃣ Prepare results to save
      const playersToSave = leaderboard.map((p) => ({
        playerId: p.id, // 👈 use the real ObjectId coming from backend
        name: p.name,
        avatar: p.avatar,
        score: p.score || 0,
        correct: p.correct || 0,
        wrong: p.wrong || 0,
        answers: p.answers || [],
      }));

      const code = Array.isArray(gameCode) ? gameCode[0] : gameCode;

      // 3️⃣ Save to MongoDB
      // await createGameResult(code, session.user.id, playersToSave);

      // 4️⃣ Go to results page
      // router.push(`/leaderboard/${gameCode}`);
    } catch (err) {
      console.error("Failed to save game result:", err);
    }
  };

  const endGame = () => {
    if (!socket || !session) return;
    console.log("🛑 Host ending game");
    socket.emit("endGame", { gameCode });
  };

  useEffect(() => {
    if (!socket || !session) return;

    const handleGameEnded = ({ leaderboard }: { leaderboard: Player[] }) => {
      console.log("🏁 Final leaderboard received:", leaderboard);
      setLeaderboard(leaderboard);
      // router.push(`/leaderboard/${gameCode}`);
    };

    socket.on("gameEnded", handleGameEnded);

    return () => {
      socket.off("gameEnded", handleGameEnded);
    };
  }, [socket, router, gameCode, session]);

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
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

  return (
    <div className={styles.container}>
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={handleCloseLoginModal}
        onLoginSuccess={function (): void {
          throw new Error("Function not implemented.");
        }}
      />

      {/* Preparation Modal */}
      {showPreparation && (
        <div className={styles.preparationOverlay}>
          <div className={styles.preparationModal}>
            <div className={styles.preparationTitle}>GET READY!</div>
            <div className={styles.preparationCounter}>{preparationTime}</div>
            <div className={styles.preparationSubtitle}>Next question starting in...</div>
          </div>
        </div>
      )}

      {/* Header Row */}
      <div className={styles.headerRow}>
        <div className={styles.gameInfoBox}>
          <div className={styles.gameTitle}>{game.title}</div>
          <div className={styles.roomInfo}>#{game.gameCode}</div>
        </div>

        <div className={styles.timerBox}>
          {showAnswersButton && showCorrectAnswer ? (
            <>
              <button onClick={showResults} className={styles.answersButton}>
                ANSWERS
              </button>
            </>
          ) : (
            <>
              <div
                className={`${styles.timer} ${timerActive ? styles.timerActive : ""} ${timeLeft <= 5 ? styles.timerWarning : ""}`}
              >
                {timeLeft}s
              </div>
              <div className={styles.timerLabel}>
                {timerActive ? "TIME REMAINING" : showCorrectAnswer ? "TIME'S UP!" : "READY"}
              </div>
            </>
          )}
        </div>

        {/* Player Count Box - Now shows actual Redis-backed count */}
        <div
          className={`${styles.playersBox} ${playersBoxAnimation ? styles[playersBoxAnimation] : ""}`}
        >
          <div className={`${styles.playersCount} ${animationClass ? styles[animationClass] : ""}`}>
            {playerCount}
          </div>
          <div className={styles.playersLabel}>PLAYER{playerCount === 1 ? "" : "S"} JOINED</div>
        </div>

        <div className={styles.controlsBox}>
          {!gameStarted ? (
            <button onClick={startQuestion} className={styles.startButton}>
              START
            </button>
          ) : showCorrectAnswer ? (
            <div className={styles.controlsSplit}>
              {isLastQuestion ? (
                <button onClick={showResults} className={styles.resultsButton}>
                  SHOW RESULTS
                </button>
              ) : (
                <>
                  <button onClick={nextQuestion} className={styles.nextButton}>
                    NEXT
                  </button>
                  <button onClick={endGame} className={styles.endButton}>
                    END
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className={styles.controlsSplit}>
              <button onClick={endGame} className={styles.endButton}>
                END
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Question Section */}
      <div
        className={`${styles.questionSection} ${isQuestionGrowing ? styles.questionGrowing : ""} ${!showQuestionContent ? styles.questionHidden : ""}`}
      >
        <div className={styles.questionHeader}>
          <span className={styles.questionLabel}>QUESTION {currentQuestionIndex + 1}</span>
          <span className={styles.questionCounter}>
            {currentQuestionIndex + 1}/{game.questions.length}
          </span>
        </div>
        <div className={styles.questionText}>{currentQuestion?.text}</div>
      </div>

      {/* Answers Grid */}
      <div
        className={`${styles.answersSection} ${!showQuestionContent ? styles.contentBlurred : ""}`}
      >
        <div className={styles.answersGrid}>
          {currentQuestion?.answers.map((answer, index) => (
            <div
              key={answer._id}
              className={`${styles.answerCard} ${
                showCorrectAnswer && answer.correct ? styles.correctAnswer : ""
              }`}
            >
              <div className={styles.answerHeader}>
                <div className={styles.shape}>{shapes[index]}</div>
                <div className={styles.answerLabel}>ANSWER {index + 1}</div>
              </div>
              <div className={styles.answerText}>{answer.text}</div>
              {showCorrectAnswer && answer.correct && (
                <div className={styles.correctBadge}>✓ CORRECT</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Modal */}
      {showAccessDenied && (
        <RetroErrorModal isOpen={showAccessDenied} onClose={() => setShowAccessDenied(false)} />
      )}

      {/* Join Info */}
      <div className={styles.joinInfo}>Players join: preguntame.com/play/guest/{game.gameCode}</div>
    </div>
  );
}
