import { Metadata } from "next";
import AIWizardClient from "@/components/AIWizardClient/AIWizardClient";

export const metadata: Metadata = {
  title: "Create Quiz Game With AI | Preguntame - Build Custom Trivia Questions",
  description:
    "Create engaging quiz games with Preguntame's manual creator or AI wizard. Build custom trivia questions, set difficulty levels, and share with friends instantly.",
  keywords: [
    "create quiz",
    "quiz maker",
    "trivia creator",
    "custom quiz game",
    "AI question generator",
    "build trivia",
    "preguntame creator",
    "online quiz builder",
  ],
  openGraph: {
    title: "Create Quiz Game | Preguntame",
    description:
      "Build custom quiz games with manual creator or AI wizard. Create engaging trivia questions and share instantly.",
    type: "website",
    url: "https://preguntame.eu/create",
    siteName: "Preguntame",
    images: [
      {
        url: "https://preguntame.eu/images/og-create.png",
        width: 1200,
        height: 630,
        alt: "Preguntame Quiz Creator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Quiz Game | Preguntame",
    description:
      "Build custom quiz games with manual creator or AI wizard. Create engaging trivia questions instantly.",
    images: ["https://preguntame.eu/images/og-create.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://preguntame.eu/create",
  },
};

export default function CreatePage() {
  return <AIWizardClient />;
}
