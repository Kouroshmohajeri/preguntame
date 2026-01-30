"use client";
import TypewriterTitle from "@/components/typewriter/TypewriterTitle";
import QuestionList from "@/components/QuestionList/QuestionList";
import AnswerEditor from "@/components/AnswerEditor/AnswerEditor";
import PixelMenu from "@/components/PixelMenu/PixelMenu";
import ConfirmPublishModal from "@/components/ConfirmPublishModal/ConfirmPublishModal";
import AnnouncementModal from "@/components/AnnouncementModal/AnnouncementModal";
import { useEffect, useState, useRef, useCallback } from "react";
import { createGame } from "@/app/api/game/actions";
import CelebrationModal from "@/components/CelebrationModal/CelebrationModal";
import { useSession } from "next-auth/react";
import styles from "./CreateGame.module.css";

export type Question = {
  id: string;
  text: string;
  answers: Answer[];
  time: number;
};

export type Answer = {
  id: string;
  text: string;
  correct: boolean;
};

export default function CreateGameClient() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const { data: session, status } = useSession();
  const [gameTitle, setGameTitle] = useState("");
  const [isMobileAnswersOpen, setIsMobileAnswersOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  // Store a snapshot of questions and title when publish is clicked
  const publishDataRef = useRef<{ title: string; questions: Question[] }>({
    title: "",
    questions: [],
  });

  useEffect(() => {
    console.log("SESSION DATA:", session);
  }, [session]);

  useEffect(() => {
    const saved = localStorage.getItem("draftGame");
    if (saved) {
      const parsed = JSON.parse(saved);
      setQuestions(parsed.questions || []);
      setSelectedQuestionIndex(parsed.selectedQuestionIndex ?? null);
      setGameTitle(parsed.title || "");
    }
  }, []);

  useEffect(() => {
    const data = {
      title: gameTitle,
      questions,
      selectedQuestionIndex,
    };
    localStorage.setItem("draftGame", JSON.stringify(data));
  }, [gameTitle, questions, selectedQuestionIndex]);

  // Handle announcement modal
  useEffect(() => {
    const hasSeenAnnouncement = localStorage.getItem("hasSeenWizardAnnouncement");
    if (!hasSeenAnnouncement) {
      setTimeout(() => setShowAnnouncementModal(true), 500);
    }

    // Listen for reopen event from floating button
    const handleReopen = () => {
      setShowAnnouncementModal(true);
    };

    window.addEventListener("reopenAnnouncement", handleReopen);
    return () => window.removeEventListener("reopenAnnouncement", handleReopen);
  }, []);

  const handleCloseAnnouncement = () => {
    setShowAnnouncementModal(false);
    localStorage.setItem("hasSeenWizardAnnouncement", "true");
  };

  const clearAll = () => {
    setQuestions([]);
    setSelectedQuestionIndex(null);
    setGameTitle("");
    localStorage.removeItem("draftGame");
  };

  const [publishedData, setPublishedData] = useState<{
    gameUrl: string;
    qrCode: string;
  } | null>(null);

  const addQuestion = (questionText: string, time: number = 20) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: questionText,
      answers: [],
      time: time,
    };
    setQuestions((prev) => [...prev, newQuestion]);
  };

  const updateQuestion = (index: number, text: string) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, text } : q)));
  };

  const deleteQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    if (selectedQuestionIndex === index) {
      setSelectedQuestionIndex(null);
      setIsMobileAnswersOpen(false);
    } else if (selectedQuestionIndex !== null && selectedQuestionIndex > index) {
      setSelectedQuestionIndex(selectedQuestionIndex - 1);
    }
  };

  const updateAnswers = (questionIndex: number, answers: Answer[]) => {
    setQuestions((prev) => prev.map((q, i) => (i === questionIndex ? { ...q, answers } : q)));
  };

  // This mimics the OLD handlePublish but with confirmation modal
  const handlePublish = useCallback(
    async (title: string) => {
      // Take a SNAPSHOT of current data before anything happens
      publishDataRef.current = {
        title: title,
        questions: [...questions], // Clone the array
      };

      console.log("📸 Snapshot saved:", publishDataRef.current);

      // Show confirmation modal
      setShowConfirmModal(true);
    },
    [questions]
  );

  // Actually publish the game after user confirms
  const handleConfirmPublish = async () => {
    const { title, questions: questionsToPublish } = publishDataRef.current;

    console.log("✅ User confirmed publish");
    console.log("=".repeat(50));
    console.log("🚀 Publishing game with SNAPSHOT data:");
    console.log("  Title:", title);
    console.log("  Questions count:", questionsToPublish.length);
    console.log("  Questions:", JSON.stringify(questionsToPublish, null, 2));
    console.log("  Host ID:", session?.user?.id);
    console.log("=".repeat(50));

    try {
      if (!session?.user?.id) {
        console.error("❌ No user ID found in session");
        setShowConfirmModal(false);
        return;
      }

      const hostId = session.user.id;

      // Use the SNAPSHOT data, not current state
      const result = await createGame(title, questionsToPublish, hostId);

      console.log("✅ Game created successfully:", result);

      if (result?.url && result?.qrCode) {
        setPublishedData({
          gameUrl: result.url,
          qrCode: result.qrCode,
        });

        // Close confirmation modal
        setShowConfirmModal(false);

        // NOW clear the form after successful publish
        clearAll();
      } else {
        console.error("❌ Invalid response from createGame:", result);
        alert("Failed to publish game. Please try again.");
        setShowConfirmModal(false);
      }
    } catch (error) {
      console.error("❌ Failed to publish game:", error);
      alert("Failed to publish game. Please try again.");
      setShowConfirmModal(false);
    }
  };

  const handleSelectQuestion = (index: number) => {
    setSelectedQuestionIndex(index);
    setIsMobileAnswersOpen(true);
  };

  const selectedQuestion = selectedQuestionIndex !== null ? questions[selectedQuestionIndex] : null;

  return (
    <>
      <PixelMenu />

      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <a href="/" className={styles.breadcrumbLink}>
            Home
          </a>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>Create Quiz</span>
        </nav>

        {/* Desktop Layout */}
        <div className={styles.desktopLayout}>
          {/* Left side – Questions */}
          <div className={styles.questionsPanel}>
            <TypewriterTitle text="Create a Game" />
            <div className={styles.questionsPanelContent}>
              <QuestionList
                questions={questions}
                selectedQuestionIndex={selectedQuestionIndex}
                onAddQuestion={addQuestion}
                onUpdateQuestion={updateQuestion}
                onDeleteQuestion={deleteQuestion}
                onSelectQuestion={handleSelectQuestion}
                onPublish={handlePublish}
                publishedData={publishedData}
                gameTitle={gameTitle}
                setGameTitle={setGameTitle}
                onClearAll={clearAll}
              />
            </div>
          </div>

          {/* Right side – Answers */}
          <div className={styles.answersPanel}>
            <div className={styles.answersPanelContent}>
              <AnswerEditor
                selectedQuestion={selectedQuestion}
                questionIndex={selectedQuestionIndex}
                onAnswersChange={updateAnswers}
              />
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className={styles.mobileLayout}>
          {!isMobileAnswersOpen ? (
            <div className={styles.mobileQuestionsPanel}>
              <TypewriterTitle text="Create a Game" />
              <QuestionList
                questions={questions}
                selectedQuestionIndex={selectedQuestionIndex}
                onAddQuestion={addQuestion}
                onUpdateQuestion={updateQuestion}
                onDeleteQuestion={deleteQuestion}
                onSelectQuestion={handleSelectQuestion}
                onPublish={handlePublish}
                publishedData={publishedData}
                gameTitle={gameTitle}
                setGameTitle={setGameTitle}
                onClearAll={clearAll}
              />
            </div>
          ) : (
            <div className={styles.mobileAnswersPanel}>
              <button
                className={styles.backButton}
                onClick={() => setIsMobileAnswersOpen(false)}
                aria-label="Back to questions"
              >
                ← Back to Questions
              </button>
              <AnswerEditor
                selectedQuestion={selectedQuestion}
                questionIndex={selectedQuestionIndex}
                onAnswersChange={updateAnswers}
              />
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        <ConfirmPublishModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmPublish}
          isLoading={false}
        />

        {/* Announcement Modal */}
        <AnnouncementModal
          isOpen={showAnnouncementModal}
          onClose={handleCloseAnnouncement}
          redirectUrl="/create/wizard"
        />

        {/* Celebration Modal */}
        {publishedData && (
          <CelebrationModal
            isOpen={true}
            onClose={() => setPublishedData(null)}
            gameUrl={publishedData.gameUrl}
            qrCode={publishedData.qrCode}
          />
        )}
      </div>
    </>
  );
}
