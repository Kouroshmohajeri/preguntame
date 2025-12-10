"use client";
import { useState, useEffect } from "react";
import styles from "./QuestionList.module.css";
import { Question } from "../types";
import { useSession } from "next-auth/react";
import LoginModal from "../LoginModal/LoginModal";

interface QuestionListProps {
  questions: Question[];
  selectedQuestionIndex: number | null;
  onAddQuestion: (question: string, time: number) => void;
  onUpdateQuestion: (index: number, text: string) => void;
  onDeleteQuestion: (index: number) => void;
  onSelectQuestion: (index: number) => void;
  onPublish: (title: string) => void;
  onClearAll: () => void;
  publishedData: { gameUrl: string; qrCode: string } | null;
  initialTitle?: string;
  isEditMode?: boolean;
  gameTitle: string;
  setGameTitle: (title: string) => void;
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
  onClearAll,
  initialTitle = "",
  isEditMode = false,
  gameTitle, // parent-controlled title
  setGameTitle,
}: QuestionListProps) {
  const [newQuestion, setNewQuestion] = useState("");
  // local editable title (keeps user's local edits safe, but synced with parent)
  const [localTitle, setLocalTitle] = useState<string>(gameTitle || initialTitle || "");
  const [selectedTime, setSelectedTime] = useState<number>(10);
  const [customTime, setCustomTime] = useState<string>("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasValidationRun, setHasValidationRun] = useState(false);
  const { data: session } = useSession();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingPublish, setPendingPublish] = useState(false);

  // keep localTitle in sync when parent restores title (e.g. from localStorage)
  useEffect(() => {
    // only update local when parent changed (avoid overwriting user's typing)
    if ((gameTitle || initialTitle || "") !== localTitle) {
      setLocalTitle(gameTitle || initialTitle || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameTitle, initialTitle]);

  // If user types, update both local and parent so parent saves draft
  const handleTitleChange = (value: string) => {
    setLocalTitle(value);
    setGameTitle(value);
  };

  // Pre-set time options
  const timeOptions = [
    { value: 5, label: "5s" },
    { value: 10, label: "10s" },
    { value: 20, label: "20s" },
    { value: 30, label: "30s" },
    { value: -1, label: "Custom" },
  ];

  // Resume publish after successful login
  useEffect(() => {
    if (session && pendingPublish) {
      setPendingPublish(false);
      // small delay ensures session state is ready
      setTimeout(() => {
        handlePublish();
      }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

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
      const customTimeValue = parseInt(customTime, 10);
      if (!isNaN(customTimeValue) && customTimeValue > 0 && customTimeValue <= 300) {
        actualTime = customTimeValue;
      }
    }

    // Add the question
    onAddQuestion(newQuestion.trim(), actualTime);

    // Select the new question — call onSelectQuestion after next tick so parent can update
    // We use a short timeout so React has time to append the new question in parent state.
    setTimeout(() => {
      onSelectQuestion(questions.length); // new question will be at previous length index
    }, 0);

    // Reset UI
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
    const timeValue = parseInt(value, 10);
    if (!isNaN(timeValue) && timeValue > 0 && timeValue <= 300) {
      setSelectedTime(timeValue);
    }
  };

  const getDisplayTime = (time: number) => {
    return `${time}s`;
  };

  const handlePublish = async () => {
    setHasValidationRun(true);

    // Make sure parent has latest title
    setGameTitle(localTitle);

    // Check login first
    if (!session) {
      setPendingPublish(true); // remember the user wanted to publish
      setShowLoginModal(true); // open login modal
      return;
    }

    if (!localTitle.trim()) return alert("Please enter a game title!");
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
      onPublish(localTitle);
      if (!isEditMode) {
        onClearAll();

        setLocalTitle("");
        setNewQuestion("");
        setSelectedTime(10);
        setCustomTime("");
        setShowCustomInput(false);
        setShowTimeSelector(false);
        setHasValidationRun(false);
        setGameTitle(""); // clear parent title too
      }
      // parent saves draft / clears localStorage as needed
      localStorage.removeItem("draftGame");
      onClearAll();
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
          value={localTitle}
          onChange={(e) => handleTitleChange(e.target.value)}
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
          disabled={loading || questions.length === 0 || !localTitle.trim()}
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

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => {
            setShowLoginModal(false);
            setPendingPublish(false);
          }}
          onLoginSuccess={() => {
            setShowLoginModal(false);
          }}
        />
      </div>
    </div>
  );
}
