// components/AIQuestionWizard/components/steps/Step3Configuration.tsx
"use client";

import { useState } from "react";
import { ArrowLeft, Sparkle, Translate } from "@phosphor-icons/react";
import styles from "../../AIQuestionWizard.module.css";
import { Difficulty } from "../../types";
import { SUPPORTED_LANGUAGES } from "@/types/languages";
import GenerateConfirmationModal from "../modals/GenerateConfirmationModal";

interface Step3ConfigurationProps {
  numberOfQuestions: number;
  setNumberOfQuestions: (num: number) => void;
  language: string;
  setLanguage: (lang: string) => void;
  difficulty: Difficulty;
  setDifficulty: (diff: Difficulty) => void;
  questionTypes: string[];
  setQuestionTypes: (types: string[]) => void;
  loading: boolean;
  userCredits: number;
  onBack: () => void;
  onGenerate: () => void;
}

export default function Step3Configuration({
  numberOfQuestions,
  setNumberOfQuestions,
  language,
  setLanguage,
  difficulty,
  setDifficulty,
  questionTypes,
  setQuestionTypes,
  loading,
  userCredits,
  onBack,
  onGenerate,
}: Step3ConfigurationProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleQuestionTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setQuestionTypes([...questionTypes, type]);
    } else {
      setQuestionTypes(questionTypes.filter((t) => t !== type));
    }
  };

  const handleGenerateClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmGenerate = () => {
    setShowConfirmModal(false);
    onGenerate();
  };

  return (
    <>
      <div className={styles.step}>
        <h2 className={styles.stepTitle}>Configure your questions</h2>

        <div className={styles.configContainer}>
          {/* Left Column - Main Settings */}
          <div className={styles.configColumn}>
            <div className={styles.configCard}>
              <h3 className={styles.configCardTitle}>Basic Settings</h3>

              <div className={styles.configRow}>
                <div className={styles.configGroup}>
                  <label>Number of questions</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={numberOfQuestions}
                    onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                    className={styles.numberInput}
                  />
                </div>

                <div className={styles.configGroup}>
                  <label>
                    <Translate size={18} weight="bold" />
                    Output Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className={styles.selectInput}
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name} ({lang.nativeName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Advanced Settings */}
          <div className={styles.configColumn}>
            <div className={styles.configCard}>
              <h3 className={styles.configCardTitle}>Difficulty & Type</h3>

              <div className={styles.configGroup}>
                <label>Difficulty level</label>
                <div className={styles.radioGroup}>
                  {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
                    <label key={level} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="difficulty"
                        value={level}
                        checked={difficulty === level}
                        onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                      />
                      <span>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.configGroup}>
                <label>Question types</label>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={questionTypes.includes("multiple-choice")}
                      onChange={(e) =>
                        handleQuestionTypeChange("multiple-choice", e.target.checked)
                      }
                    />
                    <span>Multiple Choice</span>
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={questionTypes.includes("true-false")}
                      onChange={(e) => handleQuestionTypeChange("true-false", e.target.checked)}
                    />
                    <span>True/False</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button onClick={onBack} className={styles.btnSecondary}>
            <ArrowLeft size={20} weight="bold" />
            Back
          </button>
          <button onClick={handleGenerateClick} className={styles.btnPrimary} disabled={loading}>
            {loading ? (
              "Generating..."
            ) : (
              <>
                Generate Questions (10 AI Credits)
                <Sparkle size={20} weight="fill" />
              </>
            )}
          </button>
        </div>
      </div>

      <GenerateConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmGenerate}
        numberOfQuestions={numberOfQuestions}
        difficulty={difficulty}
        language={language}
        questionTypes={questionTypes}
        userCredits={userCredits}
        loading={loading}
      />
    </>
  );
}
