"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getGame } from "@/app/api/game/actions";
import styles from "./HostPlayroom.module.css";
import { useSocket } from "@/context/SocketContext/SocketContext";
import { useSession } from "next-auth/react";
import LoginModal from "../LoginModal/LoginModal";
import RetroErrorModal from "../RetroErrorModal/RetroErrorModal";
import AudioToggle from "../AudioToggle/AudioToggle";
import { getGlobalAudio } from "@/utils/globalAudio";
import {
  checkGameCode,
  createGameResult,
  deleteGameResult,
  getGameResult,
} from "@/app/api/gameResult/actions";

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
  isAssigned: any;
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
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [selectedGameTrack, setSelectedGameTrack] = useState<string | null>(null);

  const gameMusicStartedRef = useRef(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const socket = useSocket();

  const prevPlayerCountRef = useRef(0);
  const prevPlayersRef = useRef<Player[]>([]);
  const audioInitializedRef = useRef(false);

  const currentQuestion = game?.questions[currentQuestionIndex];
  const isLastQuestion = game && currentQuestionIndex === game.questions.length - 1;
  const gameStarted = timerActive || showCorrectAnswer || showQuestionContent;
  // Simplify the user interaction useEffect - just track interaction:
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!hasUserInteracted) {
        setHasUserInteracted(true);
      }
    };

    window.addEventListener("click", handleUserInteraction, { once: true });
    window.addEventListener("keydown", handleUserInteraction, { once: true });
    window.addEventListener("touchstart", handleUserInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
    };
  }, [hasUserInteracted]);

  // Initialize all audio tracks - start them muted/silently

  useEffect(() => {
    if (audioInitializedRef.current) return;

    const audio = getGlobalAudio();

    // Clear any previous game selection
    audio.clearGameSelection();

    // Register waiting room music
    audio.register({
      id: "waitingRoom",
      url: "/sounds/waitingRoom.mp3",
      loop: true,
      fadeDuration: 500,
    });
    setTimeout(() => {
      audio.fadeIn("waitingRoom", 1);
    }, 100);
    // Register countdown
    audio.register({
      id: "countdown",
      url: "/sounds/countDown.mp3",
      fadeDuration: 200,
    });

    // Register game music tracks
    for (let i = 1; i <= 4; i++) {
      audio.register({
        id: `play${i}`,
        url: `/sounds/play/play${i}.mp3`,
        loop: true,
        fadeDuration: 800,
      });
    }

    // Register sound effects
    audio.register({
      id: "woosh",
      url: "/sounds/whoosh.mp3",
      fadeDuration: 0,
    });

    audioInitializedRef.current = true;
  }, []);

  useEffect(() => {
    if (showPreparation && preparationTime === 3 && hasUserInteracted) {
      getGlobalAudio().play("countdown");
    }
  }, [showPreparation, preparationTime, hasUserInteracted]);

  // Control waiting room music based on game state

  useEffect(() => {
    const audio = getGlobalAudio();

    if (!gameStarted) {
      // Make sure waiting room is playing
      const waitingRoomEntry = audio["tracks"].get("waitingRoom");
      if (waitingRoomEntry && waitingRoomEntry.audio.volume === 0) {
        audio.fadeIn("waitingRoom", 1);
      }
    } else {
      // Fade out waiting room when game starts
      audio.fadeOut("waitingRoom");
    }
  }, [gameStarted]);

  useEffect(() => {
    loadGame();
  }, [gameCode]);

  useEffect(() => {
    if (status === "loading") return;
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

  // Timer effects
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
      // Filter out host more reliably
      const nonHostPlayers = players.filter((p) => !p.isHost);
      const newPlayerCount = nonHostPlayers.length;
      const oldPlayerCount = prevPlayerCountRef.current;

      // Your existing animation logic...
      if (newPlayerCount > oldPlayerCount) {
        setAnimationClass("increasing");
        setPlayersBoxAnimation("updating");
      } else if (newPlayerCount < oldPlayerCount) {
        setAnimationClass("decreasing");
        setPlayersBoxAnimation("flashing");
      } else {
        const newReadyPlayers = nonHostPlayers.filter((p) => p.isReady);
        const oldReadyPlayers = prevPlayersRef.current.filter((p) => p.isReady && !p.isHost);

        if (newReadyPlayers.length > oldReadyPlayers.length) {
          setAnimationClass("rolling");
          setPlayersBoxAnimation("updating");
        } else if (players.length !== prevPlayersRef.current.length) {
          setAnimationClass("glitching");
        }
      }

      // Update state with filtered players for display if needed
      setPlayers(players);
      setPlayerCount(newPlayerCount); // This now only counts non-host players
      prevPlayerCountRef.current = newPlayerCount;
      prevPlayersRef.current = players;
    };

    const handleConnectEvent = () => handleConnect(gameCode);

    socket.on("connect", handleConnectEvent);
    socket.on("playersUpdate", handlePlayersUpdate);

    if (socket.connected) handleConnect(gameCode);

    return () => {
      socket.off("connect", handleConnectEvent);
      socket.off("playersUpdate", handlePlayersUpdate);
    };
  }, [socket, gameCode, session]);

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
  // Function to start game music (only once at the beginning of the game)

  const startGameMusic = () => {
    const audio = getGlobalAudio();

    // Fade out waiting room music (don't stop completely)
    audio.fadeOut("waitingRoom");

    // Start game music with random track selection
    audio.startGameMusic();

    // Store the selected track
    const selectedTrack = audio.getSelectedGameTrack();
    setSelectedGameTrack(selectedTrack);
    gameMusicStartedRef.current = true;
  };

  // Function to resume game music (for subsequent questions)

  const resumeGameMusic = () => {
    const audio = getGlobalAudio();

    // Play transition SFX
    audio.play("woosh");

    // Slight delay for transition impact
    setTimeout(() => {
      // Stop countdown if playing (but don't reset its position)
      const countdownEntry = audio["tracks"].get("countdown");
      if (countdownEntry && countdownEntry.isPlaying) {
        countdownEntry.audio.pause();
        countdownEntry.audio.volume = 0;
        countdownEntry.isPlaying = false;
      }

      // Resume the previously selected game music from where it left off
      const selectedTrack = audio.getSelectedGameTrack();
      if (selectedTrack) {
        const trackEntry = audio["tracks"].get(selectedTrack);
        if (trackEntry) {
          // Don't reset currentTime, just resume playing
          trackEntry.audio.play().catch(console.error);
          trackEntry.isPlaying = true;
          audio["currentlyPlaying"] = selectedTrack;
          audio.fadeIn(selectedTrack, 1);
        }
      }
    }, 200);
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

  // Replace your current startQuestion function with this:
  const startQuestion = () => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }

    const audio = getGlobalAudio();

    // Fade out waiting room (don't stop completely)
    audio.fadeOut("waitingRoom");

    if ((game as any).hostId && session.user.id !== (game as any).hostId) {
      setShowAccessDenied(true);
      return;
    }

    setShowCorrectAnswer(false);

    // Set timer from DB
    setTimeLeft(currentQuestion?.time ?? 10);

    setShowQuestionContent(false);

    socket!.emit("toggleReady", { gameCode, isReady: true });
    socket!.emit("startGame", { gameCode });

    setShowPreparation(true);
    setPreparationTime(3);

    // Countdown will be handled by the useEffect above
    const prepInterval = setInterval(() => {
      setPreparationTime((prev) => {
        if (prev <= 1) {
          clearInterval(prepInterval);
          setShowPreparation(false);

          // Start game music (only on first question) and start question animation
          if (!gameMusicStartedRef.current) {
            startGameMusic();
          } else {
            resumeGameMusic();
          }

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

  // Replace your current nextQuestion function with this:
  const nextQuestion = () => {
    const audio = getGlobalAudio();
    const newIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(newIndex);
    setShowCorrectAnswer(false);

    // use DB timer for next question
    setTimeLeft(game!.questions[newIndex].time ?? 10);

    setShowQuestionContent(false);

    if (newIndex === game!.questions.length - 1) {
      setShowAnswersButton(true);
    }

    setShowPreparation(true);
    setPreparationTime(3);

    const prepInterval = setInterval(() => {
      setPreparationTime((prev) => {
        if (prev <= 1) {
          clearInterval(prepInterval);
          setShowPreparation(false);

          // Resume game music for subsequent questions
          resumeGameMusic();
          startQuestionAnimation(newIndex);

          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  };

  const showResults = async () => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }

    try {
      const code = Array.isArray(gameCode) ? gameCode[0] : gameCode;

      // 1️⃣ Check if GameResult already exists
      const exists = await checkGameCode(code);
      console.log(exists);

      // 2️⃣ If it exists → delete the old result
      if (exists) {
        try {
          await deleteGameResult(code);
        } catch (err) {
          console.error("Failed to delete existing game result:", err);
          // continue anyway
        }
      }

      // 3️⃣ End game for all players (socket)
      socket!.emit("endGame", { gameCode: code });

      // 4️⃣ Build the players array for saving
      const playersToSave = leaderboard.map((p) => ({
        playerId: p.id,
        name: p.name,
        avatar: p.avatar,
        score: p.score || 0,
        correct: p.correct || 0,
        wrong: p.wrong || 0,
        answers: p.answers || [],
      }));

      // 5️⃣ Create the NEW GameResult
      // await createGameResult(code, session.user.id, playersToSave);

      // 6️⃣ Redirect to leaderboard
      router.push(`/leaderboard/${code}`);
    } catch (err) {
      console.error("Failed finishing results:", err);
    }
  };

  const endGame = () => {
    if (!socket || !session) return;

    const audio = getGlobalAudio();

    // Stop all music
    audio.stop("waitingRoom");
    for (let i = 1; i <= 4; i++) {
      audio.stop(`play${i}`);
    }

    // Clear game music selection for next game
    audio.clearGameSelection();
    gameMusicStartedRef.current = false;
    setSelectedGameTrack(null);

    socket.emit("endGame", { gameCode });
    router.push(`/leaderboard/${gameCode}`);
  };

  useEffect(() => {
    if (!socket || !session) return;

    // Replace the handleGameEnded socket listener in your useEffect with this:
    const handleGameEnded = ({ leaderboard }: { leaderboard: Player[] }) => {
      setLeaderboard(leaderboard);

      const audio = getGlobalAudio();

      // Stop all music
      audio.stop("waitingRoom");
      for (let i = 1; i <= 4; i++) {
        audio.stop(`play${i}`);
      }

      // Clear game music selection for next game
      audio.clearGameSelection();
      gameMusicStartedRef.current = false;
      setSelectedGameTrack(null);

      router.push(`/leaderboard/${gameCode}`);
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

        {/* Audio Toggle Component */}
        <div className={styles.audioToggleContainer}>
          <AudioToggle
            size={50}
            colors={{
              background: "rgb(39, 39, 39)",
              hoverBackground: "rgb(61, 61, 61)",
              icon: "#fff",
            }}
            position={{
              bottom: "30px",
              right: "30px",
            }}
            showHover={true}
          />
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
