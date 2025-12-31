import { Metadata } from "next";
import PixelMenu from "@/components/PixelMenu/PixelMenu";
import RealTimeQuizPlatform from "@/components/RealTimeQuizPlatform/RealTimeQuizPlatform";

export const metadata: Metadata = {
  title: "Real-Time Quiz Platform | Pregúntame - Live Multiplayer Quiz Games",
  description:
    "Pregúntame is the leading real-time quiz platform for live multiplayer games. Create interactive quizzes with instant results, real-time scoring, and live leaderboards. Free forever.",
  keywords: [
    "real-time quiz platform",
    "live quiz platform",
    "real-time multiplayer quiz",
    "instant quiz results",
    "live quiz game",
    "real-time scoring system",
    "interactive quiz platform",
    "live leaderboard quiz",
    "synchronous quiz platform",
    "real-time trivia platform",
    "live quiz software",
    "instant feedback quiz",
  ],
  authors: [{ name: "Preguntame" }],
  openGraph: {
    title: "Real-Time Quiz Platform | Pregúntame",
    description:
      "The leading real-time quiz platform for live multiplayer games with instant results and real-time scoring.",
    type: "website",
    locale: "en_US",
    siteName: "Preguntame",
    url: "https://preguntame.eu/real-time-quiz-platform",
    images: [
      {
        url: "https://preguntame.eu/images/logo.png",
        width: 1200,
        height: 630,
        alt: "Pregúntame Real-Time Quiz Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Real-Time Quiz Platform | Pregúntame",
    description:
      "The leading real-time quiz platform for live multiplayer games with instant results.",
  },
  alternates: {
    canonical: "https://preguntame.eu/real-time-quiz-platform",
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
        "@type": "SoftwareApplication",
        name: "Pregúntame Real-Time Quiz Platform",
        applicationCategory: ["EducationalApplication", "GameApplication"],
        operatingSystem: "Web Browser",
        description:
          "Pregúntame is a real-time quiz platform that enables live multiplayer quiz games with instant results, real-time scoring, and synchronized gameplay for classrooms, events, and teams.",
        url: "https://preguntame.eu",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          description: "Free real-time quiz platform with unlimited quizzes and players",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "250",
          bestRating: "5",
          worstRating: "1",
        },
        featureList: [
          "Real-time synchronization",
          "Live multiplayer gameplay",
          "Instant result updates",
          "Real-time leaderboards",
          "WebSocket technology",
          "Speed-based scoring",
          "Live countdown timers",
          "Simultaneous player responses",
          "Real-time analytics",
          "Mobile and desktop support",
        ],
        screenshot: "https://preguntame.eu/images/logo.png",
        softwareVersion: "2.0",
        publisher: {
          "@type": "Organization",
          name: "Preguntame",
          url: "https://preguntame.eu",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a real-time quiz platform?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A real-time quiz platform is a live, interactive quiz system where multiple participants answer questions simultaneously, and results update instantly. Unlike traditional quiz platforms where responses are collected and reviewed later, real-time platforms use technologies like WebSockets to synchronize gameplay across all devices, display live leaderboards, and provide immediate feedback as players answer.",
            },
          },
          {
            "@type": "Question",
            name: "How does Pregúntame's real-time quiz platform work?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Pregúntame uses WebSocket technology to create truly real-time quiz experiences. When a host starts a game, all connected players see questions simultaneously. As players submit answers, the system instantly calculates scores based on accuracy and speed, updates leaderboards in real-time, and displays results immediately after each question. Everything happens live with zero delay.",
            },
          },
          {
            "@type": "Question",
            name: "What makes Pregúntame different from other quiz platforms?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Pregúntame is built specifically for real-time interaction. Unlike platforms that simulate real-time features or batch process results, we use genuine WebSocket connections for instant synchronization. Our platform is completely free, requires no downloads, supports unlimited players, and provides speed-based scoring that rewards both accuracy and quick thinking.",
            },
          },
          {
            "@type": "Question",
            name: "Is Pregúntame really a real-time platform?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, Pregúntame is a genuine real-time quiz platform. We use WebSocket technology for bidirectional communication between servers and clients, ensuring all players see questions at the exact same moment, scores update instantly as answers are submitted, and leaderboards refresh in real-time without page reloads. This creates a truly synchronized, live experience for all participants.",
            },
          },
          {
            "@type": "Question",
            name: "Who should use a real-time quiz platform?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Real-time quiz platforms like Pregúntame are ideal for educators conducting formative assessments, event organizers engaging audiences, corporate trainers measuring knowledge retention, team leaders building collaboration, and anyone who wants to create interactive, competitive quiz experiences where live engagement and instant feedback matter.",
            },
          },
          {
            "@type": "Question",
            name: "How many people can use Pregúntame's real-time platform simultaneously?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Pregúntame supports unlimited concurrent players in a single real-time quiz game. Whether you have 10 students in a classroom or 1000 attendees at a conference, our real-time infrastructure scales to handle simultaneous connections while maintaining instant synchronization and zero lag.",
            },
          },
          {
            "@type": "Question",
            name: "What technology powers real-time quiz platforms?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Modern real-time quiz platforms like Pregúntame use WebSocket technology, which maintains persistent connections between servers and clients. This allows bidirectional, low-latency communication essential for synchronizing quiz questions, collecting answers instantly, updating scores in real-time, and broadcasting leaderboard changes to all participants simultaneously.",
            },
          },
          {
            "@type": "Question",
            name: "Do I need special software to use a real-time quiz platform?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No, Pregúntame runs entirely in web browsers. Players and hosts access the real-time quiz platform through any modern browser on desktop, tablet, or mobile devices. No downloads, installations, or special software required. Just enter a game code and start playing in real-time.",
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
            name: "Real-Time Quiz Platform",
            item: "https://preguntame.eu/real-time-quiz-platform",
          },
        ],
      },
    ]),
  },
};

export default function RealTimeQuizPlatformPage() {
  return (
    <>
      <PixelMenu alwaysHamburger={false} />
      <RealTimeQuizPlatform />
    </>
  );
}
