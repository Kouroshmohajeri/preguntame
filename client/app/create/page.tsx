"use client";
import TypewriterTitle from "@/components/typewriter/TypewriterTitle";
import QuestionList from "@/components/QuestionList/QuestionList";
import AnswerEditor from "@/components/AnswerEditor/AnswerEditor";
import { useState } from "react";
import { createGame } from "../api/game/actions";
import CelebrationModal from "@/components/CelebrationModal/CelebrationModal";

export type Question = {
  id: string;
  text: string;
  answers: Answer[];
};

export type Answer = {
  id: string;
  text: string;
  correct: boolean;
};

export default function CreateGame() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);

  // ✅ Hold the published data to pass to QuestionList
  const [publishedData, setPublishedData] = useState<{
    gameUrl: string;
    qrCode: string;
  } | null>(null);

  const addQuestion = (questionText: string) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: questionText,
      answers: []
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const updateQuestion = (index: number, text: string) => {
    setQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, text } : q
    ));
  };

  const deleteQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
    if (selectedQuestionIndex === index) {
      setSelectedQuestionIndex(null);
    } else if (selectedQuestionIndex !== null && selectedQuestionIndex > index) {
      setSelectedQuestionIndex(selectedQuestionIndex - 1);
    }
  };

  const updateAnswers = (questionIndex: number, answers: Answer[]) => {
    setQuestions(prev => prev.map((q, i) => 
      i === questionIndex ? { ...q, answers } : q
    ));
  };

  const handlePublish = async (title: string) => {
    try {

      const result = await createGame(title, questions);


      // ✅ Save the published data
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
