import WhatIsPreguntame from "@/components/WhatIsPreguntame/WhatIsPreguntame";
import PixelMenu from "@/components/PixelMenu/PixelMenu";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "What is Preguntame? Free Real-Time Quiz Platform | Live Multiplayer Quizzes",
  description:
    "Preguntame is a free real-time quiz platform for educators, event organizers, and teams. Create live multiplayer quizzes with instant results, no downloads required. Perfect for classrooms, training, and interactive events.",
  keywords: [
    "preguntame",
    "free quiz platform",
    "real-time quiz",
    "live multiplayer quiz",
    "interactive quiz maker",
    "online quiz game",
    "kahoot alternative",
    "classroom quiz tool",
    "live quiz platform",
    "free quiz maker",
    "quiz game platform",
    "educational quiz tool",
    "event quiz software",
    "team building quiz",
    "no download quiz",
  ],
  authors: [{ name: "Preguntame" }],
  openGraph: {
    title: "What is Preguntame? Free Real-Time Quiz Platform",
    description:
      "Create and host live multiplayer quizzes for free. Perfect for classrooms, events, and team building with real-time scoring and instant feedback.",
    type: "website",
    locale: "en_US",
    siteName: "Preguntame",
    url: "https://preguntame.eu/what-is-preguntame",
  },
  twitter: {
    card: "summary_large_image",
    title: "What is Preguntame? Free Real-Time Quiz Platform",
    description:
      "Create and host live multiplayer quizzes for free. Perfect for classrooms, events, and team building.",
  },
  alternates: {
    canonical: "https://preguntame.eu/what-is-preguntame",
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
          name: "What is Preguntame",
          item: "https://preguntame.eu/what-is-preguntame",
        },
      ],
    }),
  },
};

export default function WhatIsPreguntamePage() {
  return (
    <>
      <PixelMenu currentPage="about" alwaysHamburger={false} />
      <WhatIsPreguntame />
    </>
  );
}
