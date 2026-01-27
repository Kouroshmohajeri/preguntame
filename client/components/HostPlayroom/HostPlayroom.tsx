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
  isAssigned?: any;
  id?: string;
  playerId?: string;
  name: string;
  avatar?: string;
  isReady?: boolean;
  score?: number;
  isHost?: boolean;
  uuid: string;
  correct?: number;
  wrong?: number;
  answers?: any[];
  responseTime?: number;
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
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [selectedGameTrack, setSelectedGameTrack] = useState<string | null>(null);

  const gameMusicStartedRef = useRef(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const socket = useSocket();

  const prevPlayerCountRef = useRef(0);
  const prevPlayersRef = useRef<Player[]>([]);
  const audioInitializedRef = useRef(false);

  // ✅ Use ref to store complete players data immediately when received
  const completePlayersRef = useRef<Player[]>([]);
  const gameEndedListenerSetup = useRef(false);

  const currentQuestion = game?.questions[currentQuestionIndex];
  const isLastQuestion = game && currentQuestionIndex === game.questions.length - 1;
  const gameStarted = timerActive || showCorrectAnswer || showQuestionContent;

  // User interaction tracking
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

  // Initialize audio tracks
  useEffect(() => {
    if (audioInitializedRef.current) return;

    const audio = getGlobalAudio();
    audio.clearGameSelection();

    audio.register({
      id: "waitingRoom",
      url: "/sounds/waitingRoom.mp3",
      loop: true,
      fadeDuration: 500,
    });
    setTimeout(() => {
      audio.fadeIn("waitingRoom", 1);
    }, 100);

    audio.register({
      id: "countdown",
      url: "/sounds/countDown.mp3",
      fadeDuration: 200,
    });

    for (let i = 1; i <= 4; i++) {
      audio.register({
        id: `play${i}`,
        url: `/sounds/play/play${i}.mp3`,
        loop: true,
        fadeDuration: 800,
      });
    }

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

  // Control waiting room music
  useEffect(() => {
    const audio = getGlobalAudio();

    if (!gameStarted) {
      const waitingRoomEntry = audio["tracks"].get("waitingRoom");
      if (waitingRoomEntry && waitingRoomEntry.audio.volume === 0) {
        audio.fadeIn("waitingRoom", 1);
      }
    } else {
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

    if ((game as any).hostId && session.user.id !== (game as any).hostId) {
      setShowAccessDenied(true);
    } else {
      setShowAccessDenied(false);
    }
  }, [game, session]);

  useEffect(() => {
    if (!socket || !session || !playerUUID) return;

    const handleConnect = (code: string) => {
      socket.emit("hostInitializeRoom", {
        gameCode: code,
        hostId: session.user.id,
      });
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
      const nonHostPlayers = players.filter((p) => !p.isHost);
      const newPlayerCount = nonHostPlayers.length;
      const oldPlayerCount = prevPlayerCountRef.current;

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

      setPlayers(players);
      setPlayerCount(newPlayerCount);
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
  }, [socket, gameCode, session, playerUUID]);

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

  // ✅ CRITICAL: Setup gameEnded listener EARLY and keep it registered
  useEffect(() => {
    if (!socket) {
      console.warn("⚠️ Socket not available for gameEnded listener");
      return;
    }

    if (gameEndedListenerSetup.current) {
      console.log("✅ gameEnded listener already setup");
      return;
    }

    console.log("🔧 Setting up gameEnded listener");

    const handleGameEnded = ({ leaderboard }: { leaderboard: Player[] }) => {
      console.log("🎉 gameEnded event RECEIVED!");
      console.log("📊 gameEnded event received with player data:", leaderboard);
      console.log("📊 Number of players:", leaderboard.length);
      console.log("📊 Full leaderboard data:", JSON.stringify(leaderboard, null, 2));

      // ✅ Store in ref immediately (synchronous, no state update delay)
      completePlayersRef.current = leaderboard;

      // Also update state for display
      setLeaderboard(leaderboard);

      const audio = getGlobalAudio();

      // Stop all music
      audio.stop("waitingRoom");
      for (let i = 1; i <= 4; i++) {
        audio.stop(`play${i}`);
      }

      // Clear game music selection
      audio.clearGameSelection();
      gameMusicStartedRef.current = false;
      setSelectedGameTrack(null);
    };

    socket.on("gameEnded", handleGameEnded);
    gameEndedListenerSetup.current = true;

    console.log("✅ gameEnded listener registered");

    return () => {
      console.log("🧹 Cleaning up gameEnded listener");
      socket.off("gameEnded", handleGameEnded);
      gameEndedListenerSetup.current = false;
    };
  }, [socket]); // Only depend on socket, not session

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

  const startGameMusic = () => {
    const audio = getGlobalAudio();
    audio.fadeOut("waitingRoom");
    audio.startGameMusic();
    const selectedTrack = audio.getSelectedGameTrack();
    setSelectedGameTrack(selectedTrack);
    gameMusicStartedRef.current = true;
  };

  const resumeGameMusic = () => {
    const audio = getGlobalAudio();
    audio.play("woosh");

    setTimeout(() => {
      const countdownEntry = audio["tracks"].get("countdown");
      if (countdownEntry && countdownEntry.isPlaying) {
        countdownEntry.audio.pause();
        countdownEntry.audio.volume = 0;
        countdownEntry.isPlaying = false;
      }

      const selectedTrack = audio.getSelectedGameTrack();
      if (selectedTrack) {
        const trackEntry = audio["tracks"].get(selectedTrack);
        if (trackEntry) {
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

    setTimeout(() => {
      setIsQuestionGrowing(false);

      setTimeout(() => {
        socket!.emit("hostStartQuestion", { gameCode, questionIndex });
        startQuestionTimer();
      }, 1000);
    }, 3500);
  };

  const startQuestion = () => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }

    const audio = getGlobalAudio();
    audio.fadeOut("waitingRoom");

    if ((game as any).hostId && session.user.id !== (game as any).hostId) {
      setShowAccessDenied(true);
      return;
    }

    setShowCorrectAnswer(false);
    setTimeLeft(currentQuestion?.time ?? 10);
    setShowQuestionContent(false);

    socket!.emit("toggleReady", { gameCode, isReady: true });
    socket!.emit("startGame", { gameCode });

    // ✅ ADDED: Trigger guest countdown immediately
    socket!.emit("triggerCountdown", { gameCode });

    setShowPreparation(true);
    setPreparationTime(3);

    const prepInterval = setInterval(() => {
      setPreparationTime((prev) => {
        if (prev <= 1) {
          clearInterval(prepInterval);
          setShowPreparation(false);

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

  const nextQuestion = () => {
    const audio = getGlobalAudio();
    const newIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(newIndex);
    setShowCorrectAnswer(false);
    setTimeLeft(game!.questions[newIndex].time ?? 10);
    setShowQuestionContent(false);

    if (newIndex === game!.questions.length - 1) {
      setShowAnswersButton(true);
    }

    // ✅ ADDED: Trigger guest countdown immediately
    socket!.emit("triggerCountdown", { gameCode });

    setShowPreparation(true);
    setPreparationTime(3);

    const prepInterval = setInterval(() => {
      setPreparationTime((prev) => {
        if (prev <= 1) {
          clearInterval(prepInterval);
          setShowPreparation(false);
          resumeGameMusic();
          startQuestionAnimation(newIndex);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  // ✅ Updated showResults - uses ref with better debugging
  const showResults = async () => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }

    try {
      const code = Array.isArray(gameCode) ? gameCode[0] : gameCode;

      console.log("🎯 showResults called");
      console.log("🔌 Socket connected:", socket?.connected);
      console.log("🎮 GameCode:", code);

      // Check if listener is setup
      if (!gameEndedListenerSetup.current) {
        console.error("❌ gameEnded listener not setup!");
      }

      // Emit endGame to trigger socket processing
      console.log("📤 Emitting endGame event");
      socket!.emit("endGame", { gameCode: code });

      // Wait for complete player data from socket using ref
      console.log("⏳ Waiting for complete player data from socket...");
      console.log("📊 Current ref length before wait:", completePlayersRef.current.length);

      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("⚠️ Timeout waiting for complete player data");
          console.log("📊 Ref length at timeout:", completePlayersRef.current.length);
          resolve();
        }, 5000); // Increased to 5 seconds

        const checkData = setInterval(() => {
          console.log("🔍 Checking ref... current length:", completePlayersRef.current.length);

          // ✅ Check ref instead of state
          if (completePlayersRef.current.length > 0) {
            console.log("✅ Complete player data received in ref!");
            clearTimeout(timeout);
            clearInterval(checkData);
            resolve();
          }
        }, 100);
      });

      // ✅ Use ref data
      const completePlayers = completePlayersRef.current;

      console.log("📊 Final ref length:", completePlayers.length);

      if (completePlayers.length === 0) {
        return;
      }

      console.log("💾 Preparing to save with complete data:", completePlayers);

      // Build players array with complete data
      const playersToSave = completePlayers.map((p) => ({
        playerId: p.playerId || p.id || "",
        name: p.name,
        avatar: p.avatar || "",
        score: p.score || 0,
        correct: p.correct || 0,
        wrong: p.wrong || 0,
        answers: p.answers || [],
        isAssigned: false,
        uuid: p.uuid,
        responseTime: p.responseTime,
      }));

      // Validate
      const playersWithAnswers = playersToSave.filter((p) => p.answers && p.answers.length > 0);

      console.log(
        `📊 Validation: ${playersToSave.length} total, ${playersWithAnswers.length} with answers`
      );
      console.log("📋 Full data being saved:", JSON.stringify(playersToSave, null, 2));

      // Save to database
      console.log("💾 Calling API to save...");
      await createGameResult(code, session.user.id, playersToSave);
      console.log("✅ Game result saved successfully");

      // Clear ref for next game
      completePlayersRef.current = [];

      // Redirect
      router.push(`/leaderboard/${code}`);
    } catch (err) {
      console.error("❌ Failed saving results:", err);
      alert("Error saving game results. Please try again.");
    }
  };

  // ✅ Updated endGame - uses ref
  const endGame = async () => {
    if (!socket || !session) return;

    console.log("🛑 endGame called (early exit)");

    const audio = getGlobalAudio();
    audio.stop("waitingRoom");
    for (let i = 1; i <= 4; i++) {
      audio.stop(`play${i}`);
    }
    audio.clearGameSelection();
    gameMusicStartedRef.current = false;
    setSelectedGameTrack(null);

    // Emit endGame
    socket.emit("endGame", { gameCode });

    // Wait briefly for data
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(resolve, 2000);

      const checkData = setInterval(() => {
        if (completePlayersRef.current.length > 0) {
          clearTimeout(timeout);
          clearInterval(checkData);
          resolve();
        }
      }, 100);
    });

    // Try to save if we have data
    const completePlayers = completePlayersRef.current;

    if (completePlayers.length > 0) {
      try {
        const code = Array.isArray(gameCode) ? gameCode[0] : gameCode;
        const playersToSave = completePlayers.map((p) => ({
          playerId: p.playerId || p.id || "",
          name: p.name,
          avatar: p.avatar || "",
          score: p.score || 0,
          correct: p.correct || 0,
          wrong: p.wrong || 0,
          answers: p.answers || [],
          isAssigned: false,
          uuid: p.uuid,
          responseTime: p.responseTime,
        }));

        await createGameResult(code, session.user.id, playersToSave);
        console.log("✅ Game result saved before early exit");
      } catch (err) {
        console.error("❌ Error saving on early exit:", err);
      }
    }

    // Clear ref
    completePlayersRef.current = [];

    router.push(`/leaderboard/${gameCode}`);
  };

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
      <LoginModal
        isOpen={showLoginModal}
        onClose={handleCloseLoginModal}
        onLoginSuccess={function (): void {
          throw new Error("Function not implemented.");
        }}
      />

      {showPreparation && (
        <div className={styles.preparationOverlay}>
          <div className={styles.preparationModal}>
            <div className={styles.preparationTitle}>GET READY!</div>
            <div className={styles.preparationCounter}>{preparationTime}</div>
            <div className={styles.preparationSubtitle}>Next question starting in...</div>
          </div>
        </div>
      )}

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

      {showAccessDenied && (
        <RetroErrorModal isOpen={showAccessDenied} onClose={() => setShowAccessDenied(false)} />
      )}

      <div className={styles.joinInfo}>Players join: preguntame.eu/play/guest/{game.gameCode}</div>
    </div>
  );
}
