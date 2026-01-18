import { Metadata } from "next";
import PixelMenu from "@/components/PixelMenu/PixelMenu";
import FreeLiveQuizGenerator from "@/components/FreeLiveQuizGenerator/FreeLiveQuizGenerator";

export const metadata: Metadata = {
  title: "Free Live Quiz Generator | Create Real-Time Quizzes Instantly - Pregúntame",
  description:
    "Free live quiz generator with real-time multiplayer. Create interactive quizzes instantly with unlimited players. No signup required for participants. Start your live quiz now!",
  keywords: [
    "free quiz generator",
    "live quiz generator",
    "free live quiz generator",
    "quiz maker free",
    "online quiz generator",
    "real-time quiz",
    "interactive quiz maker",
    "multiplayer quiz generator",
    "quiz creator free",
    "live quiz maker",
    "free quiz creator",
    "quiz generator online free",
  ],
  authors: [{ name: "Preguntame" }],
  openGraph: {
    title: "Free Live Quiz Generator | Create Real-Time Quizzes - Pregúntame",
    description:
      "Create interactive live quizzes for free. Real-time multiplayer with unlimited players. No signup required.",
    type: "website",
    locale: "en_US",
    siteName: "Preguntame",
    url: "https://preguntame.eu/free-live-quiz-generator",
    images: [
      {
        url: "https://preguntame.eu/images/logo.png",
        width: 1200,
        height: 630,
        alt: "Pregúntame - Free Live Quiz Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Live Quiz Generator | Real-Time Quizzes",
    description: "Create interactive live quizzes for free with unlimited players.",
  },
  alternates: {
    canonical: "https://preguntame.eu/free-live-quiz-generator",
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
        "@type": "WebApplication",
        name: "Pregúntame Free Live Quiz Generator",
        applicationCategory: ["EducationalApplication", "WebApplication"],
        operatingSystem: "Any",
        description:
          "Free live quiz generator that lets you create real-time multiplayer quizzes with instant scoring. No signup required for players.",
        url: "https://preguntame.eu/free-live-quiz-generator",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        featureList: [
          "Real-time multiplayer quizzes",
          "Unlimited players",
          "No signup for participants",
          "Instant scoring",
          "Live leaderboards",
          "Mobile responsive",
          "Free to use",
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "How to Create a Live Quiz",
        description: "Create a real-time multiplayer quiz in 3 simple steps",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Create Your Quiz",
            text: "Add your questions and answers using our intuitive quiz builder",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Share the Game Code",
            text: "Get your unique game code and share it with participants",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Start Playing",
            text: "Launch the quiz and watch real-time results with live leaderboards",
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
            name: "Free Live Quiz Generator",
            item: "https://preguntame.eu/free-live-quiz-generator",
          },
        ],
      },
    ]),
  },
};

export default function FreeLiveQuizGeneratorPage() {
  return (
    <>
      <PixelMenu alwaysHamburger={false} />
      <FreeLiveQuizGenerator />
    </>
  );
}
