import AIQuizGeneratorPageClient from "@/components/AIQuizGeneratorPageClient/AIQuizGeneratorPageClient";
import PixelMenu from "@/components/PixelMenu/PixelMenu";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Quiz Generator | Create Quizzes from Text, Docs & Videos – Pregúntame",
  description:
    "Use AI to generate quizzes from prompts, documents, websites, or YouTube videos. Pregúntame Wizard creates real-time interactive quizzes in seconds. Free beta access available.",
  alternates: {
    canonical: "https://preguntame.eu/ai-quiz-generator",
  },
  keywords: [
    "AI quiz generator",
    "AI quiz maker",
    "generate quiz from text",
    "create quiz from document",
    "AI classroom quiz tool",
    "quiz generator from video",
    "AI assessment tool",
  ],
  openGraph: {
    title: "AI Quiz Generator | Pregúntame Wizard",
    description:
      "Generate interactive quizzes from text prompts, documents, websites, or YouTube videos using Pregúntame Wizard (AI). Perfect for classrooms, training, and events.",
    url: "https://preguntame.eu/ai-quiz-generator",
    siteName: "Pregúntame",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Quiz Generator – Pregúntame Wizard",
    description:
      "Turn your content into live quizzes with AI. Generate quizzes from prompts, docs, URLs, or videos in seconds.",
  },
};

function getSoftwareApplicationSchema() {
  // SoftwareApplication / WebApplication schema for Pregúntame Wizard [web:26][web:27][web:33][web:36]
  return {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "WebApplication"],
    name: "Pregúntame Wizard",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    url: "https://preguntame.eu/ai-quiz-generator",
    mainEntityOfPage: "https://preguntame.eu/ai-quiz-generator",
    description:
      "Pregúntame Wizard is an AI quiz generator that creates live, interactive quizzes from text prompts, documents, websites, and YouTube videos.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
      category: "beta",
      description: "Free beta access with AI credits for early users.",
    },
    creator: {
      "@type": "Organization",
      name: "Pregúntame",
      url: "https://preguntame.eu",
    },
    keywords: [
      "AI quiz generator",
      "AI quiz maker",
      "generate quiz with AI",
      "create quiz from document",
      "AI classroom quiz generator",
      "quiz generator from video",
      "AI assessment tool",
      "real-time quiz platform",
    ],
  };
}

function getFAQSchema() {
  // FAQ schema best practices: JSON-LD, concise, visible on page [web:32][web:35][web:38]
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is an AI quiz generator?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "An AI quiz generator is a tool that automatically creates questions and answers from content such as text, documents, websites, or videos, saving time for teachers and trainers.",
        },
      },
      {
        "@type": "Question",
        name: "Can I generate a quiz from a PDF?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. With Pregúntame Wizard you can upload PDFs or other documents and the AI will turn them into structured quiz questions.",
        },
      },
      {
        "@type": "Question",
        name: "Can AI create quizzes from videos?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The AI can use YouTube video transcripts or key moments to generate questions that focus on the most important ideas in the video.",
        },
      },
      {
        "@type": "Question",
        name: "Is Pregúntame Wizard free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Pregúntame Wizard is currently in a free beta. Early users receive AI credits so they can test the full experience at no cost.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need technical skills to use the AI quiz generator?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. You only need to type a prompt, upload a file, or paste a link. The AI handles the rest and creates a quiz you can review and edit.",
        },
      },
      {
        "@type": "Question",
        name: "Can I edit the AI-generated quiz?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can review, edit, and reorder all AI-generated questions and answers before hosting your quiz live.",
        },
      },
    ],
  };
}

export default function AIQuizGeneratorPage() {
  const softwareSchema = getSoftwareApplicationSchema();
  const faqSchema = getFAQSchema();

  return (
    <>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Client-side UI */}
      <PixelMenu alwaysHamburger={false} />
      <AIQuizGeneratorPageClient />
    </>
  );
}
