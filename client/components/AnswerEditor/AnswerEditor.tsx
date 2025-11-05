"use client";
import { useState, useEffect } from "react";
import styles from "./AnswerEditor.module.css";
import { Question, Answer } from "../types";

interface AnswerEditorProps {
  selectedQuestion: Question | null;
  questionIndex: number | null;
  onAnswersChange: (questionIndex: number, answers: Answer[]) => void;
}

export default function AnswerEditor({
  selectedQuestion,
  questionIndex,
  onAnswersChange,
}: AnswerEditorProps) {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [duplicateError, setDuplicateError] = useState<number | null>(null);

  // ✅ Only update local answers if the question *actually changed*
  useEffect(() => {
    if (selectedQuestion) {
      setAnswers((prev) => {
        const incoming = selectedQuestion.answers || [];
        // prevent resetting answers if they’re identical
        const same =
          prev.length === incoming.length &&
          prev.every((a, i) => a.text === incoming[i]?.text && a.correct === incoming[i]?.correct);
        return same ? prev : incoming;
      });
    } else {
      setAnswers([]);
    }
    setDuplicateError(null);
  }, [selectedQuestion?.id]); // ✅ Only re-run when selected question truly changes

  // 🧩 Notify parent when answers actually change
  useEffect(() => {
    if (selectedQuestion && questionIndex !== null) {
      onAnswersChange(questionIndex, answers);
    }
  }, [answers]); // this is fine; it won’t loop anymore

  const addAnswer = () => {
    if (answers.length >= 4 || !selectedQuestion) return;

    const newAnswer: Answer = {
      id: Date.now().toString(),
      text: "",
      correct: false,
    };

    setAnswers((prev) => [...prev, newAnswer]);
  };

  const updateAnswer = (index: number, text: string) => {
    const updated = [...answers];
    updated[index] = { ...updated[index], text };
    setAnswers(updated);

    if (duplicateError === index) setDuplicateError(null);
  };

  const validateAnswer = (index: number, value: string) => {
    if (!value.trim()) return;

    const isDuplicate = answers.some(
      (answer, i) =>
        i !== index &&
        answer.text.toLowerCase().trim() === value.toLowerCase().trim()
    );

    if (isDuplicate) {
      setDuplicateError(index);
    } else {
      setDuplicateError(null);
    }
  };

  const deleteAnswer = (index: number) => {
    const newAnswers = answers.filter((_, i) => i !== index);
    setAnswers(newAnswers);
    if (duplicateError === index) setDuplicateError(null);
  };

  const toggleCorrectAnswer = (index: number) => {
    const newAnswers = answers.map((answer, i) => ({
      ...answer,
      correct: i === index,
    }));
    setAnswers(newAnswers);
  };

  if (!selectedQuestion)
    return (
      <div className={styles.placeholder}>
        Select a question to add answers.
      </div>
    );

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        Answers for: "{selectedQuestion.text}"
      </h2>

      <div className={styles.answersList}>
        {answers.map((answer, index) => (
          <div
            key={answer.id}
            className={`${styles.answerItem} ${
              duplicateError === index ? styles.duplicate : ""
            }`}
          >
            <button
              onClick={() => toggleCorrectAnswer(index)}
              className={`${styles.checkbox} ${
                answer.correct ? styles.checked : ""
              }`}
              aria-label={
                answer.correct ? "Correct answer" : "Mark as correct"
              }
              disabled={duplicateError === index}
            >
              {answer.correct && (
                <svg viewBox="0 0 12 12" className={styles.checkmark}>
                  <path
                    d="M10 3L4.5 8.5L2 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            <input
              value={answer.text}
              onChange={(e) => updateAnswer(index, e.target.value)}
              onBlur={(e) => validateAnswer(index, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  validateAnswer(index, answer.text);
                  if (
                    answers.length < 4 &&
                    index === answers.length - 1 &&
                    !duplicateError
                  ) {
                    addAnswer();
                  }
                }
                if (e.key === "Tab") {
                  validateAnswer(index, answer.text);
                }
              }}
              placeholder={`Answer ${index + 1}`}
              className={styles.answerInput}
            />

            <button
              onClick={() => deleteAnswer(index)}
              className={styles.deleteButton}
              aria-label="Delete answer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {answers.length < 4 && (
        <button onClick={addAnswer} className={styles.addButton}>
          + Add Answer
        </button>
      )}

      {answers.find((a) => a.correct) && (
        <div className={styles.correctIndicator}>
          Correct answer:{" "}
          <strong>{answers.find((a) => a.correct)?.text}</strong>
        </div>
      )}

      {duplicateError !== null && (
        <div className={styles.errorMessage}>
          ⚠️ This answer already exists. Please enter a unique answer.
        </div>
      )}
    </div>
  );
}
