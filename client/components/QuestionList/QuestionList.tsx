"use client";
import { useState } from "react";
import styles from "./QuestionList.module.css";

import { Question } from "../types";


interface QuestionListProps {
  questions: Question[];
  selectedQuestionIndex: number | null;
  onAddQuestion: (question: string) => void;
  onUpdateQuestion: (index: number, text: string) => void;
  onDeleteQuestion: (index: number) => void;
  onSelectQuestion: (index: number) => void;
  onPublish: (title:string) => void;
  publishedData: { gameUrl: string; qrCode: string } | null;
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
  
}: QuestionListProps) {
  const [newQuestion, setNewQuestion] = useState("");
  const [gameTitle, setGameTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const [hasValidationRun, setHasValidationRun] = useState(false);


  const addQuestion = () => {
    if (!newQuestion.trim()) return;
    onAddQuestion(newQuestion.trim());
    setNewQuestion("");
  };

  const isQuestionIncomplete = (question: Question) => {
    const hasCorrectAnswer = question.answers.some(a => a.correct);
    const hasEnoughAnswers = question.answers.length >= 2;
    const hasEmptyAnswers = question.answers.some(a => !a.text.trim());
    return !hasCorrectAnswer || !hasEnoughAnswers || hasEmptyAnswers;
  };

  const handlePublish = async () => {
    setHasValidationRun(true);
    if (!gameTitle.trim()) return alert("Please enter a game title!");
    if (questions.length === 0) return alert("Please add at least one question!");
    if (!gameTitle.trim()) {
      alert("Please enter a game title!");
      return;
    }
    if (questions.length === 0) {
      alert("Please add at least one question!");
      return;
    }

    const questionsWithoutCorrect = questions.filter(
      q => !q.answers.some(a => a.correct)
    );
    if (questionsWithoutCorrect.length > 0) {
      alert(
        `Please select a correct answer for: ${questionsWithoutCorrect
          .map(q => `"${q.text}"`)
          .join(", ")}`
      );
      return;
    }

    const questionsWithTooFew = questions.filter(q => q.answers.length < 2);
    if (questionsWithTooFew.length > 0) {
      alert(
        `Please add at least 2 answers for: ${questionsWithTooFew
          .map(q => `"${q.text}"`)
          .join(", ")}`
      );
      return;
    }

    const questionsWithEmpty = questions.filter(q =>
      q.answers.some(a => !a.text.trim())
    );
    if (questionsWithEmpty.length > 0) {
      alert(
        `Please fill all answers for: ${questionsWithEmpty
          .map(q => `"${q.text}"`)
          .join(", ")}`
      );
      return;
    }

    // ✅ Passed validation
    setLoading(true);
    try {

      onPublish(gameTitle);

      // ✅ Clear form and reset state after success
      setGameTitle("");
      setNewQuestion("");
      setHasValidationRun(false);
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
          onChange={e => setGameTitle(e.target.value)}
          placeholder="Enter game title..."
          className={styles.input}
        />
      </div>

      {/* New question */}
      <div className={styles.inputWrapper}>
        <input
          value={newQuestion}
          onChange={e => setNewQuestion(e.target.value)}
          placeholder="Type your question?"
          onKeyDown={e => e.key === "Enter" && addQuestion()}
          className={styles.input}
        />
        <button
          onClick={addQuestion}
          className={`${styles.addButton} ${
            newQuestion.trim() ? styles.active : ""
          }`}
        >
          <span>Add</span>
        </button>
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
              >
                <span
                  onClick={() => onSelectQuestion(i)}
                  className={styles.questionText}
                >
                  {q.text}
                  {isIncomplete && (
                    <span className={styles.warningIcon}> ⚠️</span>
                  )}
                </span>
                <button
                  onClick={() => onDeleteQuestion(i)}
                  className={styles.deleteButton}
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>

        {questions.length === 0 && (
          <div className={styles.empty}>No questions added yet</div>
        )}
      </div>

      {/* Publish */}
      <div className={styles.publishSection}>
        <button
          onClick={handlePublish}
          className={styles.publishButton}
          disabled={loading || questions.length === 0 || !gameTitle.trim()}
        >
          {loading ? "Publishing..." : "PUBLISH GAME"}
        </button>
      </div>
    </div>
  );
}
