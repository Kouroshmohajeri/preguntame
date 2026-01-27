// components/AIQuestionWizard/components/review/QuestionsList.tsx
import QuestionCard from "./QuestionCard";
import { Plus } from "@phosphor-icons/react";
import styles from "../../AIQuestionWizard.module.css";
import { AIGeneratedQuestion } from "../../types";

interface QuestionsListProps {
  questions: AIGeneratedQuestion[];
  selectedQuestions: Set<number>;
  draggedIndex: number | null;
  onToggleSelect: (index: number) => void;
  onEdit: (index: number, field: string, value: any) => void;
  onEditOption: (qIndex: number, optIndex: number, value: string) => void;
  onDelete: (index: number) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onAddQuestion?: () => void; // ✅ Optional prop for wizard mode
}

export default function QuestionsList({
  questions,
  selectedQuestions,
  draggedIndex,
  onToggleSelect,
  onEdit,
  onEditOption,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
  onAddQuestion,
}: QuestionsListProps) {
  return (
    <div className={styles.questionsList}>
      {questions.map((q, qIndex) => (
        <QuestionCard
          key={qIndex}
          question={q}
          index={qIndex}
          isSelected={selectedQuestions.has(qIndex)}
          isDragging={draggedIndex === qIndex}
          onToggleSelect={onToggleSelect}
          onEdit={onEdit}
          onEditOption={onEditOption}
          onDelete={onDelete}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        />
      ))}

      {/* ✅ Add Question Box - Only in wizard mode */}
      {onAddQuestion && (
        <button onClick={onAddQuestion} className={styles.addQuestionBox}>
          <Plus size={48} weight="bold" />
          <span>Add Question</span>
        </button>
      )}
    </div>
  );
}
