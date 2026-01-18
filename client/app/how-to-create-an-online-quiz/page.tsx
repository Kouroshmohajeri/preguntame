import { Metadata } from "next";
import PixelMenu from "@/components/PixelMenu/PixelMenu";
import HowToCreateOnlineQuiz from "@/components/HowToCreateOnlineQuiz/HowToCreateOnlineQuiz";

export const metadata: Metadata = {
  title: "How to Create an Online Quiz: Complete Step-by-Step Guide (2026)",
  description:
    "Learn how to create an online quiz in minutes. Step-by-step guide to building interactive quizzes with real-time results, multiple choice questions, and instant scoring.",
  keywords: [
    "how to create an online quiz",
    "create online quiz",
    "make online quiz",
    "online quiz maker",
    "create quiz online free",
    "how to make a quiz",
    "online quiz creator",
    "build online quiz",
    "quiz creation guide",
    "create interactive quiz",
    "online quiz tutorial",
    "make quiz for free",
  ],
  authors: [{ name: "Preguntame" }],
  openGraph: {
    title: "How to Create an Online Quiz: Complete Step-by-Step Guide",
    description:
      "Step-by-step tutorial on creating engaging online quizzes with real-time results and interactive features.",
    type: "article",
    locale: "en_US",
    siteName: "Preguntame",
    url: "https://preguntame.eu/how-to-create-an-online-quiz",
    images: [
      {
        url: "https://preguntame.eu/images/logo.png",
        width: 1200,
        height: 630,
        alt: "How to Create an Online Quiz - Preguntame Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Create an Online Quiz: Step-by-Step Guide",
    description:
      "Complete tutorial on creating interactive online quizzes with real-time features.",
  },
  alternates: {
    canonical: "https://preguntame.eu/how-to-create-an-online-quiz",
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
        name: "How to Create an Online Quiz",
        description:
          "A complete step-by-step guide to creating interactive online quizzes with real-time features and instant scoring.",
        image: "https://preguntame.eu/images/logo.png",
        totalTime: "PT10M",
        estimatedCost: {
          "@type": "MonetaryAmount",
          currency: "USD",
          value: "0",
        },
        tool: [
          {
            "@type": "HowToTool",
            name: "Preguntame Quiz Platform",
          },
        ],
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Choose Your Quiz Platform",
            text: "Select a quiz creation platform that fits your needs. Look for features like real-time multiplayer, mobile responsiveness, and analytics.",
            url: "https://preguntame.eu/how-to-create-an-online-quiz#step-1",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Plan Your Quiz Content",
            text: "Decide on your quiz topic, difficulty level, and number of questions. Consider your audience and learning objectives.",
            url: "https://preguntame.eu/how-to-create-an-online-quiz#step-2",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Write Your Questions",
            text: "Create clear, engaging questions with multiple choice answers. Make sure one answer is correct and others are plausible distractors.",
            url: "https://preguntame.eu/how-to-create-an-online-quiz#step-3",
          },
          {
            "@type": "HowToStep",
            position: 4,
            name: "Set Time Limits",
            text: "Add time limits to each question to create urgency and prevent cheating. Typical limits range from 10-60 seconds per question.",
            url: "https://preguntame.eu/how-to-create-an-online-quiz#step-4",
          },
          {
            "@type": "HowToStep",
            position: 5,
            name: "Configure Quiz Settings",
            text: "Set up scoring rules, feedback options, and display preferences. Enable features like leaderboards and instant results.",
            url: "https://preguntame.eu/how-to-create-an-online-quiz#step-5",
          },
          {
            "@type": "HowToStep",
            position: 6,
            name: "Test Your Quiz",
            text: "Preview and test your quiz to ensure questions display correctly, timers work properly, and scoring is accurate.",
            url: "https://preguntame.eu/how-to-create-an-online-quiz#step-6",
          },
          {
            "@type": "HowToStep",
            position: 7,
            name: "Share and Launch",
            text: "Generate a game code or shareable link. Distribute to your participants and launch your live quiz session.",
            url: "https://preguntame.eu/how-to-create-an-online-quiz#step-7",
          },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "How to Create an Online Quiz: Complete Step-by-Step Guide",
        description:
          "Learn how to create engaging online quizzes with real-time features, multiple choice questions, and instant scoring.",
        image: "https://preguntame.eu/images/logo.png",
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
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is the best way to create an online quiz?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The best way to create an online quiz is using a dedicated quiz platform like Preguntame. Choose a platform, plan your content, write clear questions, set time limits, configure settings, test thoroughly, and share with participants.",
            },
          },
          {
            "@type": "Question",
            name: "How long does it take to create an online quiz?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Creating a basic online quiz takes 10-30 minutes depending on the number of questions. With platforms like Preguntame, you can create a 10-question quiz in under 15 minutes using the intuitive quiz builder.",
            },
          },
          {
            "@type": "Question",
            name: "Can I create an online quiz for free?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, you can create online quizzes for free using platforms like Preguntame. Many quiz creators offer free plans with unlimited quizzes and participants, making it accessible for educators and organizers.",
            },
          },
          {
            "@type": "Question",
            name: "What makes a good online quiz?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A good online quiz has clear questions, appropriate difficulty, reasonable time limits, engaging content, immediate feedback, and mobile compatibility. Interactive features like leaderboards and real-time scoring enhance engagement.",
            },
          },
        ],
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
            name: "How to Create an Online Quiz",
            item: "https://preguntame.eu/how-to-create-an-online-quiz",
          },
        ],
      },
    ]),
  },
};

export default function HowToCreateOnlineQuizPage() {
  return (
    <>
      <PixelMenu alwaysHamburger={false} />
      <HowToCreateOnlineQuiz />
    </>
  );
}
