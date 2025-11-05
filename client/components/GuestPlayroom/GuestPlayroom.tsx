"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getGame } from "@/app/api/game/actions";
import styles from "./GuestPlayroom.module.css";
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

export default function GuestPlayroom() {
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
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const currentQuestion = game?.questions[currentQuestionIndex];
  const totalQuestions = game?.questions.length || 0;
  const answerCount = currentQuestion?.answers.length || 0;
  const progressPercentage = (timeLeft / 20) * 100;

  // Get grid layout class based on answer count
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
useEffect(() => {
  if (!socket.connected) socket.connect();

  const playerName = "Guest_" + Math.floor(Math.random() * 1000);
  socket.emit("joinGame", { gameCode, playerName });

  socket.on("startQuestion", ({ questionIndex }) => {
  setCurrentQuestionIndex(questionIndex);
  setShowPreparation(true);
  setShowCorrectAnswer(false);
  setSelectedAnswer(null);   
  setTimeLeft(5);           
  setTimerActive(false);     
  });


  socket.on("showCorrectAnswer", () => {
    setShowCorrectAnswer(true);
  });

  return () => {
    socket.emit("leaveGame", { gameCode });
    socket.off("startQuestion");
    socket.off("showCorrectAnswer");
    socket.disconnect();
  };
}, [gameCode]);
useEffect(() => {
  socket.on("updateTimer", ({ timeLeft }) => {
    setTimeLeft(timeLeft);
  });

  socket.on("showCorrectAnswer", () => {
    setShowCorrectAnswer(true);
    setTimerActive(false);
  });

  return () => {
    socket.off("updateTimer");
    socket.off("showCorrectAnswer");
  };
}, []);

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

  const startQuestionTimer = () => {
    setTimerActive(true);
    setSelectedAnswer(null);
  };

  const handleAnswerSelect = (answerId: string) => {
  if (timerActive && !showCorrectAnswer) {
    setSelectedAnswer(answerId);
    const isCorrect = currentQuestion?.answers.find(a => a._id === answerId)?.correct;
    socket.emit("submitAnswer", { gameCode, playerId: socket.id, correct: isCorrect });
  }
};


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

  return (
    <div className={styles.container}>
      {/* Preparation Modal */}
      {showPreparation && (
        <div className={styles.preparationOverlay}>
          <div className={styles.preparationModal}>
            <div className={styles.preparationTitle}>GET READY!</div>
            <div className={styles.preparationCounter}>{preparationTime}</div>
            <div className={styles.preparationSubtitle}>
              Next question starting...
            </div>
          </div>
        </div>
      )}

      {/* Mobile Progress Bar */}
      <div className={styles.progressBarContainer}>
        <div 
          className={`${styles.progressBar} ${timeLeft <= 5 ? styles.progressWarning : ''}`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Header - Hidden on mobile */}
      <div className={styles.header}>
        <div className={styles.gameInfo}>
          <div className={styles.gameTitle}>{game.title}</div>
          <div className={styles.roomCode}>#{game.gameCode}</div>
        </div>
        
        {/* Desktop Timer */}
        <div className={styles.timerDesktop}>
          <div className={`${styles.timer} ${timerActive ? styles.timerActive : ''} ${timeLeft <= 5 ? styles.timerWarning : ''}`}>
            {timeLeft}s
          </div>
          <div className={styles.timerLabel}>
            {timerActive ? "TIME REMAINING" : showCorrectAnswer ? "TIME'S UP!" : "READY"}
          </div>
        </div>
      </div>

      {/* Question Section - Hidden on mobile */}
      <div className={styles.questionSection}>
        <div className={styles.questionHeader}>
          <span className={styles.questionLabel}>QUESTION {currentQuestionIndex + 1}</span>
          <span className={styles.questionCounter}>
            {currentQuestionIndex + 1}/{totalQuestions}
          </span>
        </div>
        <div className={styles.questionText}>
          {currentQuestion?.text}
        </div>
      </div>

      {/* Answers Grid */}
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
                onClick={() => handleAnswerSelect(answer._id)}
                disabled={showCorrectAnswer || !timerActive}
              >
                <div className={styles.answerContent}>
                  <div className={styles.answerShape}>{shapes[index]}</div>
                  <div className={styles.answerText}>
                    {answer.text}
                  </div>
                </div>
                {showCorrect && (
                  <div className={styles.correctBadge}>✓ CORRECT</div>
                )}
                {showIncorrect && (
                  <div className={styles.incorrectBadge}>✗ WRONG</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress Info - Mobile only */}
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