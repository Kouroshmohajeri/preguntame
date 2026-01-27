import { useState } from "react";
import { ArrowLeft, CheckCircle, SelectionAll } from "@phosphor-icons/react";
import styles from "../../AIQuestionWizard.module.css";
import { AIGeneratedQuestion } from "../../types";
import BulkActionsBar from "../review/BulkActionsBar";
import QuestionsList from "../review/QuestionsList";
import ConfirmPublishModal from "@/components/ConfirmPublishModal/ConfirmPublishModal";
import ConfirmBackModal from "@/components/ConfirmBackModal/ConfirmBackModal";

interface Step4ReviewProps {
  gameTitle: string;
  generatedQuestions: AIGeneratedQuestion[];
  setGeneratedQuestions: (questions: AIGeneratedQuestion[]) => void;
  selectedQuestions: Set<number>;
  setSelectedQuestions: (selected: Set<number>) => void;
  bulkTime: number;
  setBulkTime: (time: number) => void;
  showBulkActions: boolean;
  setShowBulkActions: (show: boolean) => void;
  draggedIndex: number | null;
  setDraggedIndex: (index: number | null) => void;
  onBack: () => void;
  onPublish: () => void;
}

export default function Step4Review({
  gameTitle,
  generatedQuestions,
  setGeneratedQuestions,
  selectedQuestions,
  setSelectedQuestions,
  bulkTime,
  setBulkTime,
  showBulkActions,
  setShowBulkActions,
  draggedIndex,
  setDraggedIndex,
  onBack,
  onPublish,
}: Step4ReviewProps) {
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showBackModal, setShowBackModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleEditQuestion = (index: number, field: string, value: any) => {
    const updated = [...generatedQuestions];
    (updated[index] as any)[field] = value;
    setGeneratedQuestions(updated);
  };

  const handleEditOption = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...generatedQuestions];
    updated[qIndex].options[optIndex] = value;
    setGeneratedQuestions(updated);
  };

  const handleDeleteQuestion = (index: number) => {
    setGeneratedQuestions(generatedQuestions.filter((_, i) => i !== index));
    setSelectedQuestions(new Set());
  };

  const toggleSelectQuestion = (index: number) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedQuestions(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const selectAllQuestions = () => {
    if (selectedQuestions.size === generatedQuestions.length) {
      setSelectedQuestions(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedQuestions(new Set(generatedQuestions.map((_, i) => i)));
      setShowBulkActions(true);
    }
  };

  const applyBulkTime = () => {
    const updated = [...generatedQuestions];
    selectedQuestions.forEach((index) => {
      updated[index].timeLimit = bulkTime;
    });
    setGeneratedQuestions(updated);
    setSelectedQuestions(new Set());
    setShowBulkActions(false);
  };

  const deleteBulkQuestions = () => {
    const updated = generatedQuestions.filter((_, i) => !selectedQuestions.has(i));
    setGeneratedQuestions(updated);
    setSelectedQuestions(new Set());
    setShowBulkActions(false);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...generatedQuestions];
    const draggedItem = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);

    setGeneratedQuestions(updated);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleAddQuestion = () => {
    const newQuestion: AIGeneratedQuestion = {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      timeLimit: 30,
      explanation: "",
      type: "multiple-choice",
    };
    setGeneratedQuestions([...generatedQuestions, newQuestion]);
  };

  // Handle Back with confirmation
  const handleBackClick = () => {
    setShowBackModal(true);
  };

  const confirmBack = () => {
    setShowBackModal(false);
    onBack();
  };

  // Handle Publish with confirmation
  const handlePublishClick = () => {
    setShowPublishModal(true);
  };

  const confirmPublish = async () => {
    setIsPublishing(true);
    try {
      await onPublish();
      setShowPublishModal(false);
    } catch (error) {
      console.error("Publishing failed:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className={styles.step}>
      {/* Header with bulk actions */}
      <div className={styles.reviewHeader}>
        <div>
          <h2 className={styles.stepTitle}>{gameTitle}</h2>
          <p className={styles.reviewSubtitle}>{generatedQuestions.length} questions</p>
        </div>
        <div className={styles.reviewActions}>
          <button onClick={selectAllQuestions} className={styles.selectAllBtn}>
            <SelectionAll size={20} weight="bold" />
            {selectedQuestions.size === generatedQuestions.length ? "Deselect All" : "Select All"}
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <BulkActionsBar
          selectedCount={selectedQuestions.size}
          bulkTime={bulkTime}
          setBulkTime={setBulkTime}
          onApplyTime={applyBulkTime}
          onDeleteSelected={deleteBulkQuestions}
          onCancel={() => {
            setSelectedQuestions(new Set());
            setShowBulkActions(false);
          }}
        />
      )}

      {/* Questions List */}
      <QuestionsList
        questions={generatedQuestions}
        selectedQuestions={selectedQuestions}
        draggedIndex={draggedIndex}
        onToggleSelect={toggleSelectQuestion}
        onEdit={handleEditQuestion}
        onEditOption={handleEditOption}
        onDelete={handleDeleteQuestion}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onAddQuestion={handleAddQuestion}
      />

      {/* Sticky Footer Buttons */}
      <div className={styles.stickyFooter}>
        <div className={styles.stickyFooterContent}>
          <button onClick={handleBackClick} className={styles.btnSecondary}>
            <ArrowLeft size={20} weight="bold" />
            Back
          </button>
          <button
            onClick={handlePublishClick}
            className={styles.btnPrimary}
            disabled={generatedQuestions.length === 0}
          >
            Publish Game
            <CheckCircle size={20} weight="fill" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <ConfirmPublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onConfirm={confirmPublish}
        isLoading={isPublishing}
      />

      <ConfirmBackModal
        isOpen={showBackModal}
        onClose={() => setShowBackModal(false)}
        onConfirm={confirmBack}
      />
    </div>
  );
}
