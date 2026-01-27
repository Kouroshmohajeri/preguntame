"use client";

import React, { useState, useEffect } from "react";
import styles from "./AIQuestionWizard.module.css";
import LoginModal from "../LoginModal/LoginModal";
import { useSession } from "next-auth/react";
import { useWizardState } from "./hooks/useWizardState";
import { useQuestionGeneration } from "./hooks/useQuestionGeneration";
import WizardHeader from "./components/WizardHeader";
import WizardProgressBar from "./components/WizardProgressBar";
import Step1GameTitle from "./components/steps/Step1GameTitle";
import Step2InputMethod from "./components/steps/Step2InputMethod";
import Step3Configuration from "./components/steps/Step3Configuration";
import Step4Review from "./components/steps/Step4Review";
import ErrorMessage from "./components/shared/ErrorMessage";
import { Question, AIGeneratedQuestion } from "./types";
import { useToast } from "@/context/ToastContext/ToastContext";
import {
  getUserCredits,
  deductCredits,
  refundCredits,
  checkGenerationEligibility,
} from "@/app/api/credits/actions";

interface AIQuestionWizardProps {
  onQuestionsGenerated: (questions: Question[]) => void;
  onClose: () => void;
  onPublish: (title: string, questions: Question[]) => void;
}

export default function AIQuestionWizard({
  onQuestionsGenerated,
  onClose,
  onPublish,
}: AIQuestionWizardProps) {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingPublish, setPendingPublish] = useState(false);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [creditsLoading, setCreditsLoading] = useState(true);

  const wizardState = useWizardState();
  const { loading, error: genError, generateQuestions } = useQuestionGeneration();

  // Fetch user credits on mount
  useEffect(() => {
    const fetchUserCredits = async () => {
      if (!session?.user?.email) {
        setCreditsLoading(false);
        return;
      }

      try {
        const data = await getUserCredits(session.user.email);
        if (data.success) {
          setUserCredits(data.credits || 0);
        }
      } catch (error: any) {
        console.error("Failed to fetch user credits:", error);
        showToast("Failed to fetch your credits. Please refresh the page.", "error");
      } finally {
        setCreditsLoading(false);
      }
    };

    fetchUserCredits();
  }, [session, showToast]);

  // Transform AI questions to match your Game model structure
  const transformToDBFormat = (aiQuestions: AIGeneratedQuestion[]): Question[] => {
    return aiQuestions.map((aiQ, index) => ({
      text: aiQ.question,
      answers: aiQ.options.map((optionText, optIndex) => ({
        text: optionText,
        correct: optIndex === aiQ.correctAnswer,
      })),
      order: index,
      time: aiQ.timeLimit,
    }));
  };

  const handleGenerate = async () => {
    // Validate user is logged in
    if (!session?.user?.email) {
      showToast("Please log in to generate questions.", "warning");
      setShowLoginModal(true);
      return;
    }

    try {
      // 1️⃣ Check eligibility first (status, license, credits)
      const eligibility = await checkGenerationEligibility(session.user.email, 10);

      if (!eligibility.eligible) {
        if (!eligibility.reasons.hasAccess) {
          showToast("Beta access required to use AI features.", "error");
          return;
        }
        if (!eligibility.reasons.hasLicense) {
          showToast("Active license required to use AI features.", "error");
          return;
        }
        if (!eligibility.reasons.hasCredits) {
          showToast("You need at least 10 credits to generate questions.", "error");
          return;
        }
      }

      // 2️⃣ Deduct credits BEFORE generation
      const deductResult = await deductCredits(session.user.email, 10);
      if (!deductResult.success) {
        showToast(deductResult.message || "Failed to deduct credits", "error");
        return;
      }

      // Update local credits
      setUserCredits(deductResult.creditsRemaining);
      showToast("10 credits deducted. Generating questions...", "success");

      // 3️⃣ Generate questions using AI actions
      const questions = await generateQuestions(
        wizardState.inputMethod,
        wizardState.prompt,
        wizardState.url,
        wizardState.file,
        wizardState.numberOfQuestions,
        wizardState.difficulty,
        wizardState.questionTypes,
        wizardState.language
      );

      // 4️⃣ Success - move to review step
      wizardState.setGeneratedQuestions(questions);
      wizardState.setStep(4);
      showToast(`${questions.length} questions generated successfully!`, "success");
    } catch (err: any) {
      console.error("Generation failed:", err);
      showToast(err.message || "Failed to generate questions. Please try again.", "error");

      // 5️⃣ REFUND credits on failure
      if (session?.user?.email) {
        try {
          const refundResult = await refundCredits(session.user.email, 10);
          if (refundResult.success) {
            setUserCredits(refundResult.creditsRemaining);
            showToast("Credits refunded due to generation failure.", "info");
          }
        } catch (refundError) {
          console.error("Failed to refund credits:", refundError);
        }
      }
    }
  };

  const handlePublishClick = () => {
    if (!session) {
      setPendingPublish(true);
      setShowLoginModal(true);
      return;
    }

    const transformedQuestions = transformToDBFormat(wizardState.generatedQuestions);
    onPublish(wizardState.gameTitle, transformedQuestions);
  };

  // Resume publish after login
  useEffect(() => {
    if (session && pendingPublish) {
      setPendingPublish(false);
      const transformedQuestions = transformToDBFormat(wizardState.generatedQuestions);
      onPublish(wizardState.gameTitle, transformedQuestions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, pendingPublish]);

  return (
    <div className={styles.container}>
      <WizardHeader onClose={onClose} />
      <WizardProgressBar currentStep={wizardState.step} />

      <div className={styles.content}>
        {wizardState.error && <ErrorMessage message={wizardState.error} />}
        {genError && <ErrorMessage message={genError} />}

        {wizardState.step === 1 && (
          <Step1GameTitle
            gameTitle={wizardState.gameTitle}
            setGameTitle={wizardState.setGameTitle}
            onNext={wizardState.handleNext}
          />
        )}

        {wizardState.step === 2 && (
          <Step2InputMethod
            inputMethod={wizardState.inputMethod}
            setInputMethod={wizardState.setInputMethod}
            prompt={wizardState.prompt}
            setPrompt={wizardState.setPrompt}
            url={wizardState.url}
            setUrl={wizardState.setUrl}
            file={wizardState.file}
            setFile={wizardState.setFile}
            onNext={wizardState.handleNext}
            onBack={wizardState.handleBack}
          />
        )}

        {wizardState.step === 3 && (
          <Step3Configuration
            numberOfQuestions={wizardState.numberOfQuestions}
            setNumberOfQuestions={wizardState.setNumberOfQuestions}
            language={wizardState.language}
            setLanguage={wizardState.setLanguage}
            difficulty={wizardState.difficulty}
            setDifficulty={wizardState.setDifficulty}
            questionTypes={wizardState.questionTypes}
            setQuestionTypes={wizardState.setQuestionTypes}
            loading={loading}
            userCredits={userCredits}
            onBack={wizardState.handleBack}
            onGenerate={handleGenerate}
          />
        )}

        {wizardState.step === 4 && (
          <Step4Review
            gameTitle={wizardState.gameTitle}
            generatedQuestions={wizardState.generatedQuestions}
            setGeneratedQuestions={wizardState.setGeneratedQuestions}
            selectedQuestions={wizardState.selectedQuestions}
            setSelectedQuestions={wizardState.setSelectedQuestions}
            bulkTime={wizardState.bulkTime}
            setBulkTime={wizardState.setBulkTime}
            showBulkActions={wizardState.showBulkActions}
            setShowBulkActions={wizardState.setShowBulkActions}
            draggedIndex={wizardState.draggedIndex}
            setDraggedIndex={wizardState.setDraggedIndex}
            onBack={wizardState.handleBack}
            onPublish={handlePublishClick}
          />
        )}
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          setPendingPublish(false);
        }}
        onLoginSuccess={() => setShowLoginModal(false)}
      />
    </div>
  );
}
