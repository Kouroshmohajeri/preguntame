import CreateGameClient from "@/components/CreateGameClient/CreateGameClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Quiz | Free Real-Time Quiz Maker - Pregúntame",
  description:
    "Create engaging real-time quizzes for free. Build interactive questions, set custom timers, and publish instantly. Perfect for teachers, trainers, and event organizers.",
  keywords:
    "create quiz, quiz maker, online quiz creator, real-time quiz builder, free quiz tool, interactive quiz, classroom quiz, education quiz maker, preguntame creator",
  authors: [{ name: "Pregúntame" }],
  creator: "Pregúntame",
  publisher: "Pregúntame",
  robots: "index, follow",
  openGraph: {
    title: "Create Quiz - Free Real-Time Quiz Maker | Pregúntame",
    description:
      "Build engaging real-time quizzes in minutes. Add questions, customize timers, and share with players instantly.",
    url: "https://preguntame.eu/create",
    siteName: "Preguntame",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Quiz - Free Real-Time Quiz Maker",
    description: "Build engaging real-time quizzes in minutes with Pregúntame.",
  },
  alternates: {
    canonical: "https://preguntame.eu/create",
  },
};

export default function CreateGamePage() {
  return <CreateGameClient />;
}
