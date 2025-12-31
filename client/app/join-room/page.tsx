import { Metadata } from "next";
import PixelMenu from "@/components/PixelMenu/PixelMenu";
import JoinRoom from "@/components/JoinRoom/static/JoinRoom";

export const metadata: Metadata = {
  title: "Join Game - Pregúntame | Enter Game Code to Play Live Quiz",
  description:
    "Join a live quiz game on Pregúntame. Enter your 6-digit game code to participate in real-time multiplayer quizzes. No account required - start playing instantly.",
  keywords: [
    "join quiz game",
    "enter game code",
    "play live quiz",
    "multiplayer quiz join",
    "preguntame join",
    "quiz game code",
    "instant quiz join",
    "live quiz participation",
    "real-time quiz",
    "no login quiz",
  ],
  authors: [{ name: "Preguntame" }],
  openGraph: {
    title: "Join Game - Pregúntame",
    description:
      "Enter a 6-digit game code to join a live quiz. Play instantly without registration.",
    type: "website",
    locale: "en_US",
    siteName: "Preguntame",
    url: "https://preguntame.eu/join-room",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join Game - Pregúntame",
    description:
      "Enter a 6-digit game code to join a live quiz. Play instantly without registration.",
  },
  alternates: {
    canonical: "https://preguntame.eu/join-room",
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
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Join Game",
      description: "Join a live quiz game on Pregúntame by entering a 6-digit game code.",
      url: "https://preguntame.eu/join-room",
      breadcrumb: {
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
            name: "Join Game",
            item: "https://preguntame.eu/join-room",
          },
        ],
      },
    }),
  },
};

export default function JoinRoomPage() {
  return (
    <>
      <PixelMenu currentPage="join" alwaysHamburger={false} />
      <JoinRoom />
    </>
  );
}
