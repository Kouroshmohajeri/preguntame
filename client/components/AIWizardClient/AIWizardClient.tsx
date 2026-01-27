"use client";

import { useState, useCallback, useRef } from "react";
import AIQuestionWizard from "@/components/AIQuestionWizard/AIQuestionWizard";
import CelebrationModal from "@/components/CelebrationModal/CelebrationModal";
import ConfirmPublishModal from "@/components/ConfirmPublishModal/ConfirmPublishModal";
import { createGame } from "@/app/api/game/actions";
import { useSession } from "next-auth/react";

export default function AIWizardClient() {
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<any[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [publishedData, setPublishedData] = useState<{
    gameUrl: string;
    qrCode: string;
  } | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const { data: session } = useSession();

  const publishDataRef = useRef<{ title: string; questions: any[] }>({
    title: "",
    questions: [],
  });

  const handleAIQuestionsGenerated = (questions: any[]) => {
    setAiGeneratedQuestions(questions);
  };

  const handleCloseWizard = () => {
    // Wizard close handler - you can add navigation if needed
    console.log("Wizard closed");
  };

  const handlePublish = useCallback(async (title: string, questions: any[]) => {
    publishDataRef.current = {
      title: title,
      questions: [...questions],
    };

    setShowConfirmModal(true);
  }, []);

  const handleConfirmPublish = async () => {
    const { title, questions: questionsToPublish } = publishDataRef.current;

    try {
      if (!session?.user?.id) {
        alert("Please log in to publish a game.");
        setShowConfirmModal(false);
        return;
      }

      setIsPublishing(true);
      const hostId = session.user.id;

      const result = await createGame(title, questionsToPublish, hostId, true);

      if (result?.url && result?.qrCode) {
        setPublishedData({
          gameUrl: result.url,
          qrCode: result.qrCode,
        });

        setShowConfirmModal(false);
        setAiGeneratedQuestions([]);
      } else {
        alert("Failed to publish game. Please try again.");
        setShowConfirmModal(false);
      }
    } catch (error) {
      console.error("Publish error:", error);
      alert("Failed to publish game. Please try again.");
      setShowConfirmModal(false);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      {/* SEO Content - Hidden but crawlable */}
      <div style={{ position: "absolute", left: "-9999px" }}>
        <h1>AI Quiz Wizard | Preguntame - Generate Questions with AI</h1>
        <p>
          Create engaging quiz games instantly with AI-powered question generation. Generate custom
          trivia questions from topics, URLs, YouTube videos, or upload your own documents. Our
          advanced AI technology creates high-quality questions in seconds.
        </p>
        <h2>AI Question Generation Features</h2>
        <ul>
          <li>Generate from any topic or subject</li>
          <li>Extract questions from web pages and articles</li>
          <li>Create quizzes from YouTube videos</li>
          <li>Upload PDF, Word, or text documents</li>
          <li>Customize difficulty levels (easy, medium, hard)</li>
          <li>Choose question quantity (5-50 questions)</li>
          <li>Multiple-choice and true/false formats</li>
          <li>Instant preview and editing</li>
          <li>Bulk actions for efficient editing</li>
          <li>Drag and drop to reorder questions</li>
          <li>One-click publishing</li>
        </ul>
        <h2>How It Works</h2>
        <ol>
          <li>Choose your input method (topic, URL, video, or file)</li>
          <li>Set your preferences (difficulty, quantity, types)</li>
          <li>Let AI generate your questions</li>
          <li>Review and edit if needed</li>
          <li>Add a title and publish instantly</li>
        </ol>
        <h2>Start Creating with AI</h2>
        <p>
          Transform any content into an engaging quiz game in minutes. Perfect for educators,
          trainers, content creators, and anyone who wants to create interactive learning
          experiences quickly.
        </p>
      </div>

      {/* Main Content - AI Wizard */}
      <AIQuestionWizard
        onQuestionsGenerated={handleAIQuestionsGenerated}
        onClose={handleCloseWizard}
        onPublish={handlePublish}
      />

      {/* Confirmation Modal */}
      <ConfirmPublishModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmPublish}
        isLoading={isPublishing}
      />

      {/* Success Modal */}
      {publishedData && (
        <CelebrationModal
          isOpen={true}
          onClose={() => setPublishedData(null)}
          gameUrl={publishedData.gameUrl}
          qrCode={publishedData.qrCode}
        />
      )}
    </>
  );
}
