import type { Metadata } from "next";
import WizardInfoClient from "@/components/WizardInfoPage/WizardInfoClient";
import PixelMenu from "@/components/PixelMenu/PixelMenu";

export const metadata: Metadata = {
  title: "Pregúntame Wizard (AI) - AI-Powered Quiz Generator | Beta Access",
  description:
    "Create engaging quizzes instantly with Pregúntame Wizard (AI). Generate questions from prompts, documents, URLs, and YouTube videos. Get 500 free AI credits with beta access!",
  keywords: [
    "AI quiz generator",
    "Pregúntame Wizard",
    "AI-powered quiz",
    "quiz creation tool",
    "educational AI",
    "quiz maker",
    "AI questions generator",
    "beta access",
    "free AI credits",
    "YouTube quiz generator",
    "document to quiz",
  ],
  authors: [{ name: "Pregúntame" }],
  openGraph: {
    title: "Pregúntame Wizard (AI) - AI-Powered Quiz Generator",
    description:
      "Create quizzes from prompts, documents, URLs, and YouTube videos. Get 500 free AI credits with beta access!",
    url: "https://preguntame.eu/create/wizard",
    siteName: "Pregúntame",
    images: [
      {
        url: "/images/wizard-og.png",
        width: 1200,
        height: 630,
        alt: "Pregúntame Wizard AI",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pregúntame Wizard (AI) - AI-Powered Quiz Generator",
    description:
      "Create quizzes from prompts, documents, URLs, and YouTube videos. Get 500 free AI credits!",
    images: ["/images/wizard-og.png"],
    creator: "@preguntame",
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
  alternates: {
    canonical: "https://preguntame.eu/create/wizard",
  },
};

export default function WizardInfoPage() {
  return (
    <>
      <PixelMenu alwaysHamburger={false} />
      <WizardInfoClient />
    </>
  );
}
