import { Metadata } from "next";
import PixelMenu from "@/components/PixelMenu/PixelMenu";
import HowToCreatePreguntameQuiz from "@/components/HowToCreatePreguntameQuiz/HowToCreatePreguntameQuiz";

export const metadata: Metadata = {
  title: "How to Create a Pregúntame Quiz - Step-by-Step Tutorial",
  description:
    "Learn how to create your first Pregúntame quiz in minutes. Complete step-by-step guide to building interactive real-time quizzes with our free platform.",
  keywords: [
    "how to use preguntame",
    "preguntame tutorial",
    "create preguntame quiz",
    "preguntame guide",
    "preguntame how to",
    "preguntame quiz maker",
  ],
  authors: [{ name: "Preguntame" }],
  openGraph: {
    title: "How to Create a Pregúntame Quiz - Tutorial",
    description:
      "Step-by-step guide to creating your first quiz on Pregúntame. Learn all the features and get started in minutes.",
    type: "website",
    locale: "en_US",
    siteName: "Preguntame",
    url: "https://preguntame.eu/how-to-create-a-preguntame-quiz",
    images: [
      {
        url: "https://preguntame.eu/images/logo.png",
        width: 1200,
        height: 630,
        alt: "How to Create a Pregúntame Quiz",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Create a Pregúntame Quiz",
    description: "Complete tutorial for creating quizzes on Pregúntame",
  },
  alternates: {
    canonical: "https://preguntame.eu/how-to-create-a-preguntame-quiz",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "application/ld+json": JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "How to Create a Pregúntame Quiz",
        description:
          "Complete step-by-step tutorial for creating your first quiz on Pregúntame platform.",
        totalTime: "PT5M",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Access the Quiz Creator",
            text: "Navigate to preguntame.eu and click 'Create Quiz' or go directly to /create",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Name Your Quiz",
            text: "Enter a clear, descriptive title for your quiz that tells players what to expect",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Add Questions",
            text: "Click 'Add Question' and enter your question text with 4 answer options",
          },
          {
            "@type": "HowToStep",
            position: 4,
            name: "Set Correct Answer",
            text: "Mark the correct answer by clicking the checkmark next to it",
          },
          {
            "@type": "HowToStep",
            position: 5,
            name: "Configure Time Limit",
            text: "Set how long players have to answer (10-60 seconds recommended)",
          },
          {
            "@type": "HowToStep",
            position: 6,
            name: "Save and Launch",
            text: "Click 'Save Quiz' and then 'Start Game' to get your game code",
          },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "How to Create a Pregúntame Quiz",
        description: "Complete tutorial for creating interactive quizzes on Pregúntame",
        author: {
          "@type": "Organization",
          name: "Preguntame",
        },
        publisher: {
          "@type": "Organization",
          name: "Preguntame",
          logo: {
            "@type": "ImageObject",
            url: "https://preguntame.eu/images/logo.png",
          },
        },
        datePublished: "2026-01-18",
        dateModified: "2026-01-18",
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://preguntame.eu",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "How to Create a Pregúntame Quiz",
            item: "https://preguntame.eu/how-to-create-a-preguntame-quiz",
          },
        ],
      },
    ]),
  },
};

export default function HowToCreatePreguntameQuizPage() {
  return (
    <>
      <PixelMenu alwaysHamburger={false} />
      <HowToCreatePreguntameQuiz />
    </>
  );
}
