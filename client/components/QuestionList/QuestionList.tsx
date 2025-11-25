// components/QuestionList/QuestionList.tsx
"use client";
import { useState, useEffect } from "react";
import styles from "./QuestionList.module.css";
import { Question } from "../types";

interface QuestionListProps {
  questions: Question[];
  selectedQuestionIndex: number | null;
  onAddQuestion: (question: string, time: number) => void;
  onUpdateQuestion: (index: number, text: string) => void;
  onDeleteQuestion: (index: number) => void;
  onSelectQuestion: (index: number) => void;
  onPublish: (title: string) => void;
  publishedData: { gameUrl: string; qrCode: string } | null;
  initialTitle?: string;
  isEditMode?: boolean;
}

export default function QuestionList({
  questions,
  selectedQuestionIndex,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onSelectQuestion,
  onPublish,
  publishedData,
  initialTitle = "",
  isEditMode = false,
}: QuestionListProps) {
  const [newQuestion, setNewQuestion] = useState("");
  const [gameTitle, setGameTitle] = useState(initialTitle);
  const [selectedTime, setSelectedTime] = useState<number>(10);
  const [customTime, setCustomTime] = useState<string>("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasValidationRun, setHasValidationRun] = useState(false);

  // Update game title when initialTitle changes (for edit mode)
  useEffect(() => {
    setGameTitle(initialTitle);
  }, [initialTitle]);

  // Pre-set time options
  const timeOptions = [
    { value: 5, label: "5s" },
    { value: 10, label: "10s" },
    { value: 20, label: "20s" },
    { value: 30, label: "30s" },
    { value: -1, label: "Custom" },
  ];

  const handleQuestionChange = (text: string) => {
    setNewQuestion(text);
    if (text.trim() && !showTimeSelector) {
      setShowTimeSelector(true);
    }
  };

  const addQuestion = () => {
    if (!newQuestion.trim()) return;

    let actualTime = selectedTime;
    if (showCustomInput && customTime) {
      const customTimeValue = parseInt(customTime);
      if (!isNaN(customTimeValue) && customTimeValue > 0 && customTimeValue <= 300) {
        actualTime = customTimeValue;
      }
    }

    onAddQuestion(newQuestion.trim(), actualTime);
    setNewQuestion("");
    setSelectedTime(10);
    setCustomTime("");
    setShowCustomInput(false);
    setShowTimeSelector(false);
  };

  const isQuestionIncomplete = (question: Question) => {
    const hasCorrectAnswer = question.answers.some((a) => a.correct);
    const hasEnoughAnswers = question.answers.length >= 2;
    const hasEmptyAnswers = question.answers.some((a) => !a.text.trim());
    return !hasCorrectAnswer || !hasEnoughAnswers || hasEmptyAnswers;
  };

  const handleTimeChange = (value: number) => {
    if (value === -1) {
      setShowCustomInput(true);
      setSelectedTime(10);
    } else {
      setShowCustomInput(false);
      setSelectedTime(value);
      setCustomTime("");
    }
  };

  const handleCustomTimeChange = (value: string) => {
    setCustomTime(value);
    const timeValue = parseInt(value);
    if (!isNaN(timeValue) && timeValue > 0 && timeValue <= 300) {
      setSelectedTime(timeValue);
    }
  };

  const getDisplayTime = (time: number) => {
    return `${time}s`;
  };

  const handlePublish = async () => {
    setHasValidationRun(true);
    if (!gameTitle.trim()) return alert("Please enter a game title!");
    if (questions.length === 0) return alert("Please add at least one question!");

    const questionsWithoutCorrect = questions.filter((q) => !q.answers.some((a) => a.correct));
    if (questionsWithoutCorrect.length > 0) {
      alert(
        `Please select a correct answer for: ${questionsWithoutCorrect
          .map((q) => `"${q.text}"`)
          .join(", ")}`
      );
      return;
    }

    const questionsWithTooFew = questions.filter((q) => q.answers.length < 2);
    if (questionsWithTooFew.length > 0) {
      alert(
        `Please add at least 2 answers for: ${questionsWithTooFew
          .map((q) => `"${q.text}"`)
          .join(", ")}`
      );
      return;
    }

    const questionsWithEmpty = questions.filter((q) => q.answers.some((a) => !a.text.trim()));
    if (questionsWithEmpty.length > 0) {
      alert(
        `Please fill all answers for: ${questionsWithEmpty.map((q) => `"${q.text}"`).join(", ")}`
      );
      return;
    }

    setLoading(true);
    try {
      onPublish(gameTitle);
      if (!isEditMode) {
        setGameTitle("");
        setNewQuestion("");
        setSelectedTime(10);
        setCustomTime("");
        setShowCustomInput(false);
        setShowTimeSelector(false);
        setHasValidationRun(false);
      }
    } catch (error) {
      console.error("Failed to publish game:", error);
      alert("Failed to publish game. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Game title */}
      <div className={styles.inputWrapper}>
        <input
          value={gameTitle}
          onChange={(e) => setGameTitle(e.target.value)}
          placeholder="Enter game title..."
          className={styles.input}
        />
      </div>

      {/* New question input */}
      <div className={styles.questionInputSection}>
        <div className={styles.questionInputWrapper}>
          <input
            value={newQuestion}
            onChange={(e) => handleQuestionChange(e.target.value)}
            placeholder="Type your question?"
            onKeyDown={(e) => e.key === "Enter" && addQuestion()}
            className={styles.input}
          />
          <button
            onClick={addQuestion}
            className={`${styles.addButton} ${newQuestion.trim() ? styles.active : ""}`}
          >
            <span>Add</span>
          </button>
        </div>

        {/* Time Selection - Only shown when user is typing */}
        {showTimeSelector && (
          <div className={styles.timeSection}>
            <div className={styles.timeSelector}>
              <select
                value={showCustomInput ? -1 : selectedTime}
                onChange={(e) => handleTimeChange(Number(e.target.value))}
                className={styles.timeSelect}
              >
                {timeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {showCustomInput && (
                <div className={styles.customTimeInput}>
                  <input
                    type="number"
                    value={customTime}
                    onChange={(e) => handleCustomTimeChange(e.target.value)}
                    placeholder="Enter seconds (1-300)"
                    min="1"
                    max="300"
                    className={styles.customInput}
                  />
                  <span className={styles.timeUnit}>seconds</span>
                </div>
              )}

              {!showCustomInput && (
                <div className={styles.selectedTimeDisplay}>
                  Time: <strong>{getDisplayTime(selectedTime)}</strong>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Question list */}
      <div className={styles.listContainer}>
        <ul className={styles.list}>
          {questions.map((q, i) => {
            const isIncomplete = hasValidationRun && isQuestionIncomplete(q);
            return (
              <li
                key={i}
                className={`${styles.listItem} ${
                  selectedQuestionIndex === i ? styles.selected : ""
                } ${isIncomplete ? styles.incomplete : ""}`}
                onClick={() => onSelectQuestion(i)}
              >
                <div className={styles.questionContent}>
                  <span className={styles.questionText}>
                    {q.text}
                    {isIncomplete && <span className={styles.warningIcon}> ⚠️</span>}
                  </span>
                  <div className={styles.questionTime}>
                    <span className={styles.timeBadge}>{getDisplayTime(q.time)}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteQuestion(i);
                  }}
                  className={styles.deleteButton}
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>

        {questions.length === 0 && <div className={styles.empty}>No questions added yet</div>}
      </div>

      {/* Publish/Update button */}
      <div className={styles.publishSection}>
        <button
          onClick={handlePublish}
          className={styles.publishButton}
          disabled={loading || questions.length === 0 || !gameTitle.trim()}
        >
          {loading
            ? isEditMode
              ? "Updating..."
              : "Publishing..."
            : isEditMode
              ? "UPDATE GAME"
              : "PUBLISH GAME"}
        </button>

        {!loading && questions.length > 0 && (
          <div className={styles.publishInfo}>
            <strong>{questions.length}</strong> question{questions.length !== 1 ? "s" : ""} •
            Average time:{" "}
            <strong>
              {getDisplayTime(
                Math.round(questions.reduce((sum, q) => sum + q.time, 0) / questions.length)
              )}
            </strong>
          </div>
        )}
      </div>
    </div>
  );
}
