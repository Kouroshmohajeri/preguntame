// components/AIQuestionWizard/components/review/QuestionCard.tsx
import { Clock, Trash, Lightbulb, DotsSixVertical, Info } from "@phosphor-icons/react";
import styles from "../../AIQuestionWizard.module.css";
import { AIGeneratedQuestion } from "../../types";

interface QuestionCardProps {
  question: AIGeneratedQuestion;
  index: number;
  isSelected: boolean;
  isDragging: boolean;
  onToggleSelect: (index: number) => void;
  onEdit: (index: number, field: string, value: any) => void;
  onEditOption: (qIndex: number, optIndex: number, value: string) => void;
  onDelete: (index: number) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
}

export default function QuestionCard({
  question,
  index,
  isSelected,
  isDragging,
  onToggleSelect,
  onEdit,
  onEditOption,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
}: QuestionCardProps) {
  return (
    <div
      className={`${styles.questionCard} ${isSelected ? styles.selected : ""} ${isDragging ? styles.dragging : ""}`}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
    >
      {/* Compact Header */}
      <div className={styles.questionHeader}>
        <div className={styles.questionHeaderLeft}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(index)}
            className={styles.questionCheckbox}
          />
          <button className={styles.dragHandle}>
            <DotsSixVertical size={20} weight="bold" />
          </button>
          <span className={styles.questionNumber}>Q{index + 1}</span>
        </div>
        <div className={styles.questionHeaderRight}>
          <div className={styles.timeControl}>
            <Clock size={16} weight="bold" />
            <input
              type="number"
              min="5"
              max="300"
              value={question.timeLimit}
              onChange={(e) => onEdit(index, "timeLimit", parseInt(e.target.value))}
              className={styles.timeInput}
            />
            <span>s</span>
          </div>
          <button onClick={() => onDelete(index)} className={styles.deleteBtn}>
            <Trash size={18} weight="fill" />
          </button>
        </div>
      </div>

      {/* Content - Vertical Stack */}
      <div className={styles.questionContent}>
        {/* Question */}
        <textarea
          value={question.question}
          onChange={(e) => onEdit(index, "question", e.target.value)}
          className={styles.questionTextarea}
          placeholder="Enter your question here..."
        />

        {/* Answers */}
        <div className={styles.answersSection}>
          <label className={styles.sectionLabel}>Answers</label>
          <div className={styles.answersList}>
            {question.options.map((opt, optIndex) => (
              <div
                key={optIndex}
                className={`${styles.answerRow} ${question.correctAnswer === optIndex ? styles.correctAnswer : ""}`}
              >
                <input
                  type="radio"
                  name={`correct-${index}`}
                  checked={question.correctAnswer === optIndex}
                  onChange={() => onEdit(index, "correctAnswer", optIndex)}
                  className={styles.answerRadio}
                />
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => onEditOption(index, optIndex, e.target.value)}
                  className={styles.answerInput}
                  placeholder={`Answer ${optIndex + 1}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* AI Explanation - Read Only */}
        {question.explanation && (
          <div className={styles.explanationSection}>
            <label className={styles.sectionLabel}>
              <Lightbulb size={14} weight="fill" />
              AI Explanation
            </label>
            <div className={styles.explanationDisplay}>{question.explanation}</div>
            <div className={styles.explanationNote}>
              <Info size={12} weight="fill" />
              For reference only • Not shown to players
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
