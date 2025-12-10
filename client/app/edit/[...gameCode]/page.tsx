// app/edit/[gameCode]/page.tsx
"use client";
import TypewriterTitle from "@/components/typewriter/TypewriterTitle";
import QuestionList from "@/components/QuestionList/QuestionList";
import AnswerEditor from "@/components/AnswerEditor/AnswerEditor";
import { useEffect, useState } from "react";
import { getGame, updateGame } from "@/app/api/game/actions";
import CelebrationModal from "@/components/CelebrationModal/CelebrationModal";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";

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

export default function EditGame() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const [gameTitle, setGameTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [originalGame, setOriginalGame] = useState<any>(null);

  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const gameCode = params.gameCode as string;

  // ✅ Hold the published data to pass to QuestionList
  const [publishedData, setPublishedData] = useState<{
    gameUrl: string;
    qrCode: string;
  } | null>(null);

  // Load existing game data
  useEffect(() => {
    const loadGame = async () => {
      if (!gameCode) return;

      try {
        setLoading(true);
        const gameData = await getGame(gameCode);

        if (!gameData) {
          alert("Game not found!");
          router.push("/dashboard");
          return;
        }

        setOriginalGame(gameData);
        setGameTitle(gameData.title);

        // Transform questions from database format to component format
        // Based on the actual API response structure
        const transformedQuestions: Question[] = gameData.questions.map(
          (q: any, index: number) => ({
            id: q._id || `question-${index}`,
            text: q.text, // Changed from q.questionText to q.text
            time: q.time || 20, // Changed from q.timeLimit to q.time
            answers: q.answers.map((opt: any, optIndex: number) => ({
              // Changed from q.options to q.answers
              id: opt._id || `answer-${index}-${optIndex}`,
              text: opt.text, // Changed from opt.optionText to opt.text
              correct: opt.correct, // Changed from opt.isCorrect to opt.correct
            })),
          })
        );

        setQuestions(transformedQuestions);
      } catch (error) {
        console.error("Failed to load game:", error);
        alert("Failed to load game data");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (gameCode && status !== "loading") {
      loadGame();
    }
  }, [gameCode, status, router]);

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

  const handleUpdate = async (title: string) => {
    try {
      if (!session?.user?.id) {
        console.error("❌ No user ID found in session");
        return;
      }

      if (!originalGame) {
        console.error("❌ No original game data found");
        return;
      }

      const hostId = session.user.id;

      // Transform questions back to database format
      const transformedQuestions = questions.map((q) => ({
        text: q.text, // Changed from questionText to text
        time: q.time, // Changed from timeLimit to time
        answers: q.answers.map((a) => ({
          text: a.text, // Changed from optionText to text
          correct: a.correct, // Changed from isCorrect to correct
        })),
      }));

      const result = await updateGame(gameCode, title, transformedQuestions, hostId);

      if (result?.url && result?.qrCode) {
        setPublishedData({
          gameUrl: result.url,
          qrCode: result.qrCode,
        });
      }
    } catch (error) {
      console.error("Failed to update game:", error);
      alert("Failed to update game. Please try again.");
    }
  };

  const selectedQuestion = selectedQuestionIndex !== null ? questions[selectedQuestionIndex] : null;

  if (loading) {
    return (
      <div className="h-screen bg-[#fefaf6] dark:bg-gray-900 text-black dark:text-white font-[Nunito] flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Loading Game...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#fefaf6] dark:bg-gray-900 text-black dark:text-white font-[Nunito] flex flex-row overflow-hidden">
      {/* Left side – Questions */}
      <div className="w-1/2 border-r-4 border-black dark:border-white p-8 flex flex-col overflow-hidden">
        <TypewriterTitle text="Edit Game" />

        <div className="flex-1 overflow-hidden">
          <QuestionList
            questions={questions}
            selectedQuestionIndex={selectedQuestionIndex}
            onAddQuestion={addQuestion}
            onUpdateQuestion={updateQuestion}
            onDeleteQuestion={deleteQuestion}
            onSelectQuestion={setSelectedQuestionIndex}
            onPublish={handleUpdate}
            publishedData={publishedData}
            initialTitle={gameTitle}
            isEditMode={true}
            gameTitle={gameTitle}
            setGameTitle={setGameTitle}
            onClearAll={() => {}}
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
