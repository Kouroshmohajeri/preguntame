"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getGame } from "@/app/api/game/actions";
import styles from "./HostPlayroom.module.css";
import socket from "@/utils/socket";



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

export default function HostPlayroom() {
    const params = useParams();
    const gameCode = params.code as string;
    
    const [game, setGame] = useState<Game | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(20);
    const [timerActive, setTimerActive] = useState(false);
    const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showPreparation, setShowPreparation] = useState(false);
    const [preparationTime, setPreparationTime] = useState(3);
    const [playerCount, setPlayerCount] = useState(0);


  const currentQuestion = game?.questions[currentQuestionIndex];
  const isLastQuestion = game && currentQuestionIndex === game.questions.length - 1;
  const gameStarted = timerActive || showCorrectAnswer;

  useEffect(() => {
    loadGame();
  }, [gameCode]);

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
    let prepTimer: NodeJS.Timeout;
    
    if (showPreparation && preparationTime > 0) {
      prepTimer = setTimeout(() => setPreparationTime(preparationTime - 1), 1000);
    } else if (showPreparation && preparationTime === 0) {
      setShowPreparation(false);
      setPreparationTime(3);
      startQuestionTimer();
    }
    
    return () => clearTimeout(prepTimer);
  }, [showPreparation, preparationTime]);

  // Simulate player count updates (in real app, this would come from WebSocket)
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayerCount(prev => {
        // Simulate player joining/leaving
        const change = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        const newCount = prev + change;
        return Math.max(0, Math.min(newCount, 50)); // Cap between 0-50
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);
useEffect(() => {
  if (!socket.connected) socket.connect();

  socket.emit("joinGame", { gameCode, playerName: "HOST" });

  socket.on("playerCountUpdate", ({ count }) => {
    setPlayerCount(count);
  });

  socket.on("playerAnswered", (data) => {
    console.log("A player answered:", data);
  });

  return () => {
    socket.emit("leaveGame", { gameCode });
    socket.off("playerCountUpdate");
    socket.off("playerAnswered");
    socket.disconnect();
  };
}, [gameCode]);
useEffect(() => {
  let timer: NodeJS.Timeout;

  if (timerActive && timeLeft > 0) {
    timer = setTimeout(() => {
      const newTime = timeLeft - 1;
      setTimeLeft(newTime);
      socket.emit("timerTick", { gameCode, timeLeft: newTime });
    }, 1000);
  } else if (timerActive && timeLeft === 0) {
    setShowCorrectAnswer(true);
    setTimerActive(false);
    socket.emit("showCorrectAnswer", { gameCode });
  }

  return () => clearTimeout(timer);
}, [timerActive, timeLeft]);

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

  const startQuestion = () => {
  setShowCorrectAnswer(false);
  setTimeLeft(20);
  setShowPreparation(true);
  socket.emit("hostStartQuestion", { gameCode, questionIndex: currentQuestionIndex });
};


  const startQuestionTimer = () => {
    setTimerActive(true);
  };

  const nextQuestion = () => {
    const newIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex((prev) => prev + 1);
    setShowCorrectAnswer(false);
    setTimeLeft(20);
    setShowPreparation(true);
    socket.emit("hostStartQuestion", { gameCode, questionIndex: newIndex });
  };

  const showResults = () => {
    // TODO: Implement show results logic
    console.log("Show results");
  };

  const endGame = () => {
    // TODO: Implement end game logic
    console.log("End game");
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
      {/* Preparation Modal */}
      {showPreparation && (
        <div className={styles.preparationOverlay}>
          <div className={styles.preparationModal}>
            <div className={styles.preparationTitle}>GET READY!</div>
            <div className={styles.preparationCounter}>{preparationTime}</div>
            <div className={styles.preparationSubtitle}>
              Next question starting in...
            </div>
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
          <div className={`${styles.timer} ${timerActive ? styles.timerActive : ''} ${timeLeft <= 5 ? styles.timerWarning : ''}`}>
            {timeLeft}s
          </div>
          <div className={styles.timerLabel}>
            {timerActive ? "TIME REMAINING" : showCorrectAnswer ? "TIME'S UP!" : "READY"}
          </div>
        </div>

        {/* Player Count Box */}
        <div className={styles.playersBox}>
          <div className={styles.playersCount}>{playerCount}</div>
          <div className={styles.playersLabel}>
            PLAYER{playerCount === 1 ? '' : 'S'} JOINED
          </div>
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
      <div className={styles.questionSection}>
        <div className={styles.questionHeader}>
          <span className={styles.questionLabel}>QUESTION {currentQuestionIndex + 1}</span>
          <span className={styles.questionCounter}>
            {currentQuestionIndex + 1}/{game.questions.length}
          </span>
        </div>
        <div className={styles.questionText}>
          {currentQuestion?.text}
        </div>
      </div>

      {/* Answers Grid */}
      <div className={styles.answersSection}>
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
              <div className={styles.answerText}>
                {answer.text}
              </div>
              {showCorrectAnswer && answer.correct && (
                <div className={styles.correctBadge}>✓ CORRECT</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Join Info */}
      <div className={styles.joinInfo}>
        Players join: preguntame.com/play/guest/{game.gameCode}
      </div>
    </div>
  );
}