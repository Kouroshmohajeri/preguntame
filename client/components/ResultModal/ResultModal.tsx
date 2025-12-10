"use client";
import React, { useEffect, useState } from "react";
import styles from "./ResultModal.module.css";
import {
  X,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  Target,
  User,
  ArrowRight,
  Lightning,
  Timer,
  ChartBar,
} from "@phosphor-icons/react";
import { getGame } from "@/app/api/game/actions";

interface Question {
  text: string;
  answers: Answer[];
  order: number;
  time: number;
  _id: string;
}

interface Answer {
  text: string;
  correct: boolean;
  _id: string;
}

interface PlayerAnswer {
  questionIndex: number;
  answerId: string;
  isCorrect: boolean;
  points: number;
  timeLeft: number;
  _id: string;
}

interface Player {
  id: string;
  name: string;
  uuid: string;
  score: number;
  correct?: number;
  wrong?: number;
  responseTime?: number;
  answers: PlayerAnswer[];
}

interface GameData {
  _id: string;
  title: string;
  gameCode: string;
  questions: Question[];
}

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  gameCode: string;
}

export default function ResultModal({ isOpen, onClose, player, gameCode }: ResultModalProps) {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questionAnswersMap, setQuestionAnswersMap] = useState<Map<string, PlayerAnswer>>(
    new Map()
  );

  useEffect(() => {
    if (isOpen && gameCode) {
      fetchGameData();
    }
  }, [isOpen, gameCode]);

  const fetchGameData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getGame(gameCode);

      if (data && data.questions) {
        setGameData(data);

        // Create a map of question IDs to player answers for easy lookup
        const answersMap = new Map<string, PlayerAnswer>();

        // Map player answers by questionIndex to question IDs
        // IMPORTANT: questionIndex is 0-indexed, order field is 1-indexed
        player.answers?.forEach((answer) => {
          // Find the question that matches the questionIndex
          const matchingQuestion = data.questions.find((q: { order: number }) => {
            // Convert questionIndex (0-based) to order (1-based) for comparison
            return q.order === answer.questionIndex + 1;
          });

          if (matchingQuestion) {
            answersMap.set(matchingQuestion._id, answer);
          } else {
            // Fallback: try to find by array index if order doesn't match
            if (data.questions[answer.questionIndex]) {
              const questionId = data.questions[answer.questionIndex]._id;
              answersMap.set(questionId, answer);
            }
          }
        });

        setQuestionAnswersMap(answersMap);

        // Set first question as selected by default
        if (data.questions.length > 0) {
          setSelectedQuestion(data.questions[0]);
        }
      } else {
        throw new Error("Invalid game data structure");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load game data");
      console.error("Error fetching game data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Updated to use the map for O(1) lookup
  const getPlayerAnswerForQuestion = (questionId: string) => {
    return questionAnswersMap.get(questionId);
  };

  const getSelectedAnswer = (questionId: string, answerId: string) => {
    const question = gameData?.questions.find((q) => q._id === questionId);
    return question?.answers.find((a) => a._id === answerId);
  };

  const getCorrectAnswer = (questionId: string) => {
    const question = gameData?.questions.find((q) => q._id === questionId);
    return question?.answers.find((a) => a.correct);
  };

  const getQuestionNumber = (questionId: string) => {
    if (!gameData) return 0;
    const question = gameData.questions.find((q) => q._id === questionId);
    return question ? question.order : 0;
  };

  const getPerformanceColor = (isCorrect: boolean) => {
    return isCorrect ? "#38A169" : "#E53E3E";
  };

  const getTimeColor = (timeLeft: number, totalTime: number) => {
    const percentage = (timeLeft / totalTime) * 100;
    if (percentage >= 70) return "#38A169";
    if (percentage >= 40) return "#D69E2E";
    return "#E53E3E";
  };

  const calculateAccuracy = () => {
    if (!player.correct && !player.wrong) return 0;
    const total = (player.correct || 0) + (player.wrong || 0);
    return Math.round(((player.correct || 0) / total) * 100);
  };

  const calculateAverageResponseTime = () => {
    if (!player.answers || player.answers.length === 0) return 0;
    const totalTime = player.answers.reduce((sum, answer) => sum + answer.timeLeft, 0);
    return totalTime / player.answers.length;
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.playerInfo}>
            <div className={styles.playerAvatar}>
              <User size={24} weight="bold" />
            </div>
            <div>
              <h2 className={styles.playerName}>{player.name}</h2>
              <div className={styles.playerStats}>
                <span className={styles.statBadge}>
                  <Trophy size={14} weight="fill" />
                  {player.score} points
                </span>
                <span className={styles.statBadge}>
                  <Target size={14} weight="fill" />
                  {calculateAccuracy()}% accuracy
                </span>
                <span className={styles.statBadge}>
                  <Timer size={14} weight="fill" />
                  Avg: {calculateAverageResponseTime().toFixed(1)}s
                </span>
              </div>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} weight="bold" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading game details...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className={styles.errorContainer}>
            <XCircle size={48} weight="fill" className={styles.errorIcon} />
            <h3>Error Loading Data</h3>
            <p>{error}</p>
            <button className={styles.retryButton} onClick={fetchGameData}>
              Try Again
            </button>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && gameData && (
          <div className={styles.contentContainer}>
            {/* Left Side - Questions List */}
            <div className={styles.questionsSidebar}>
              <h3 className={styles.sidebarTitle}>
                <ChartBar size={20} weight="bold" />
                Questions ({gameData.questions.length})
              </h3>
              <div className={styles.questionsList}>
                {gameData.questions.map((question) => {
                  const playerAnswer = getPlayerAnswerForQuestion(question._id);
                  const isSelected = selectedQuestion?._id === question._id;

                  return (
                    <button
                      key={question._id}
                      className={`${styles.questionItem} ${isSelected ? styles.selected : ""}`}
                      onClick={() => setSelectedQuestion(question)}
                    >
                      <div className={styles.questionHeader}>
                        <span className={styles.questionNumber}>Q{question.order}</span>
                        {playerAnswer && (
                          <div className={styles.answerIndicator}>
                            {playerAnswer.isCorrect ? (
                              <CheckCircle size={14} weight="fill" className={styles.correctIcon} />
                            ) : (
                              <XCircle size={14} weight="fill" className={styles.wrongIcon} />
                            )}
                            <span className={styles.points}>{playerAnswer.points} pts</span>
                          </div>
                        )}
                      </div>
                      <p className={styles.questionPreview}>{question.text.substring(0, 50)}...</p>
                      <div className={styles.timeInfo}>
                        <Clock size={12} />
                        <span>
                          {playerAnswer?.timeLeft || 0}s left of {question.time}s
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Side - Question Details */}
            <div className={styles.questionDetail}>
              {selectedQuestion && (
                <>
                  <div className={styles.questionHeader}>
                    <h3 className={styles.questionTitle}>Question {selectedQuestion.order}</h3>
                    <div className={styles.questionStats}>
                      <span className={styles.timeStat}>
                        <Timer size={16} />
                        {selectedQuestion.time} seconds
                      </span>
                      <span className={styles.pointsStat}>
                        <Trophy size={16} />
                        Max: {selectedQuestion.time * 10} points
                      </span>
                    </div>
                  </div>

                  <div className={styles.questionText}>{selectedQuestion.text}</div>

                  <div className={styles.answersContainer}>
                    <h4 className={styles.answersTitle}>
                      <ArrowRight size={20} weight="bold" />
                      Answers
                    </h4>

                    <div className={styles.answersGrid}>
                      {selectedQuestion.answers.map((answer) => {
                        const playerAnswer = getPlayerAnswerForQuestion(selectedQuestion._id);
                        const isPlayerAnswer = playerAnswer?.answerId === answer._id;
                        const isCorrectAnswer = answer.correct;

                        let answerClass = styles.answerItem;
                        if (isPlayerAnswer && isCorrectAnswer) {
                          answerClass += ` ${styles.correctAnswer}`;
                        } else if (isPlayerAnswer && !isCorrectAnswer) {
                          answerClass += ` ${styles.wrongAnswer}`;
                        } else if (isCorrectAnswer) {
                          answerClass += ` ${styles.correctAnswer}`;
                        }

                        return (
                          <div key={answer._id} className={answerClass}>
                            <div className={styles.answerHeader}>
                              <div className={styles.answerStatus}>
                                {isPlayerAnswer && (
                                  <span className={styles.playerSelection}>
                                    <User size={14} weight="bold" />
                                    Your choice
                                  </span>
                                )}
                                {isCorrectAnswer && !isPlayerAnswer && (
                                  <span className={styles.correctStatus}>
                                    <CheckCircle size={14} weight="fill" />
                                    Correct answer
                                  </span>
                                )}
                                {!isPlayerAnswer && !isCorrectAnswer && (
                                  <span className={styles.otherAnswer}>Other option</span>
                                )}
                              </div>
                              {isPlayerAnswer && playerAnswer && (
                                <div
                                  className={styles.pointsEarned}
                                  style={{ color: getPerformanceColor(playerAnswer.isCorrect) }}
                                >
                                  <Trophy size={14} />
                                  {playerAnswer.points} points
                                </div>
                              )}
                            </div>
                            <p className={styles.answerText}>{answer.text}</p>
                            {isPlayerAnswer && playerAnswer && (
                              <div className={styles.timeInfo}>
                                <div
                                  className={styles.timeBar}
                                  style={{
                                    width: `${(playerAnswer.timeLeft / selectedQuestion.time) * 100}%`,
                                    backgroundColor: getTimeColor(
                                      playerAnswer.timeLeft,
                                      selectedQuestion.time
                                    ),
                                  }}
                                />
                                <span className={styles.timeText}>
                                  Answered in {selectedQuestion.time - playerAnswer.timeLeft}s (
                                  {playerAnswer.timeLeft}s remaining)
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Summary for this question */}
                    <div className={styles.questionSummary}>
                      <h4>Question Summary</h4>
                      <div className={styles.summaryGrid}>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>Your Answer:</span>
                          <span className={styles.summaryValue}>
                            {(() => {
                              const playerAnswer = getPlayerAnswerForQuestion(selectedQuestion._id);
                              if (!playerAnswer) return "No answer";
                              const answer = getSelectedAnswer(
                                selectedQuestion._id,
                                playerAnswer.answerId
                              );
                              return answer?.text || "Unknown";
                            })()}
                          </span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>Correct Answer:</span>
                          <span className={styles.summaryValue}>
                            {getCorrectAnswer(selectedQuestion._id)?.text || "Unknown"}
                          </span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>Points Earned:</span>
                          <span
                            className={styles.summaryValue}
                            style={{
                              color: getPerformanceColor(
                                getPlayerAnswerForQuestion(selectedQuestion._id)?.isCorrect || false
                              ),
                            }}
                          >
                            {getPlayerAnswerForQuestion(selectedQuestion._id)?.points || 0} /{" "}
                            {selectedQuestion.time * 10}
                          </span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>Response Time:</span>
                          <span className={styles.summaryValue}>
                            {(() => {
                              const playerAnswer = getPlayerAnswerForQuestion(selectedQuestion._id);
                              if (!playerAnswer) return "N/A";
                              return `${selectedQuestion.time - playerAnswer.timeLeft}s (${playerAnswer.timeLeft}s remaining)`;
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={styles.modalFooter}>
          <div className={styles.footerStats}>
            <div className={styles.footerStat}>
              <CheckCircle size={20} weight="fill" className={styles.correctIcon} />
              <span>Correct: {player.correct || 0}</span>
            </div>
            <div className={styles.footerStat}>
              <XCircle size={20} weight="fill" className={styles.wrongIcon} />
              <span>Wrong: {player.wrong || 0}</span>
            </div>
            <div className={styles.footerStat}>
              <Target size={20} weight="fill" />
              <span>Accuracy: {calculateAccuracy()}%</span>
            </div>
            <div className={styles.footerStat}>
              <Lightning size={20} weight="fill" />
              <span>Avg Response: {calculateAverageResponseTime().toFixed(1)}s</span>
            </div>
          </div>
          <button className={styles.closeModalButton} onClick={onClose}>
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
