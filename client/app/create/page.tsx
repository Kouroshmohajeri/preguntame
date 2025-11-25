"use client";
import TypewriterTitle from "@/components/typewriter/TypewriterTitle";
import QuestionList from "@/components/QuestionList/QuestionList";
import AnswerEditor from "@/components/AnswerEditor/AnswerEditor";
import { useEffect, useState } from "react";
import { createGame } from "../api/game/actions";
import CelebrationModal from "@/components/CelebrationModal/CelebrationModal";
import { useSession } from "next-auth/react";

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

export default function CreateGame() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const { data: session, status } = useSession();
  useEffect(() => {
    console.log("SESSION DATA:", session);
  }, [session]);
  // ✅ Hold the published data to pass to QuestionList
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
    } else if (selectedQuestionIndex !== null && selectedQuestionIndex > index) {
      setSelectedQuestionIndex(selectedQuestionIndex - 1);
    }
  };

  const updateAnswers = (questionIndex: number, answers: Answer[]) => {
    setQuestions((prev) => prev.map((q, i) => (i === questionIndex ? { ...q, answers } : q)));
  };

  const handlePublish = async (title: string) => {
    try {
      if (!session?.user?.id) {
        console.error("❌ No user ID found in session");
        return;
      }

      const hostId = session.user.id; // 🔥 This is your ObjectId from the backend DB

      const result = await createGame(title, questions, hostId);

      if (result?.url && result?.qrCode) {
        setPublishedData({
          gameUrl: result.url,
          qrCode: result.qrCode,
        });
      }
    } catch (error) {
      console.error("Failed to publish game:", error);
    }
  };

  const selectedQuestion = selectedQuestionIndex !== null ? questions[selectedQuestionIndex] : null;

  return (
    <div className="h-screen bg-[#fefaf6] dark:bg-gray-900 text-black dark:text-white font-[Nunito] flex flex-row overflow-hidden">
      {/* Left side – Questions */}
      <div className="w-1/2 border-r-4 border-black dark:border-white p-8 flex flex-col overflow-hidden">
        <TypewriterTitle text="Create a Game" />

        <div className="flex-1 overflow-hidden">
          <QuestionList
            questions={questions}
            selectedQuestionIndex={selectedQuestionIndex}
            onAddQuestion={addQuestion}
            onUpdateQuestion={updateQuestion}
            onDeleteQuestion={deleteQuestion}
            onSelectQuestion={setSelectedQuestionIndex}
            onPublish={handlePublish}
            publishedData={publishedData}
          />
        </div>
      </div>

      {/* Right side – Answers */}
      <div className="w-1/2 p-8 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <AnswerEditor
            selectedQuestion={selectedQuestion}
            questionIndex={selectedQuestionIndex}
            onAnswersChange={updateAnswers}
          />
        </div>
      </div>
      {publishedData && (
        <CelebrationModal
          isOpen={true}
          onClose={() => setPublishedData(null)}
          gameUrl={publishedData.gameUrl}
          qrCode={publishedData.qrCode}
        />
      )}
    </div>
  );
}
