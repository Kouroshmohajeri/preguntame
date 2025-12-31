import { Metadata } from "next";
import AuthPage from "@/components/AuthPage/AuthPage";

export const metadata: Metadata = {
  title: "Login & Register | Pregúntame - Create Free Account",
  description:
    "Sign in to Pregúntame to save your quizzes, track player statistics, and access your game history. Free account with Google sign-in. No credit card required.",
  keywords: [
    "preguntame login",
    "quiz platform login",
    "create quiz account",
    "free quiz account",
    "google sign in quiz",
    "register quiz platform",
    "quiz maker login",
    "save quiz games",
  ],
  authors: [{ name: "Preguntame" }],
  openGraph: {
    title: "Login & Register | Pregúntame",
    description: "Sign in to save your quizzes and track statistics. Free account creation.",
    type: "website",
    locale: "en_US",
    siteName: "Preguntame",
    url: "https://preguntame.eu/auth",
    images: [
      {
        url: "https://preguntame.eu/images/logo.png",
        width: 1200,
        height: 630,
        alt: "Pregúntame Login",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Login & Register | Pregúntame",
    description: "Sign in to save your quizzes and track statistics.",
  },
  alternates: {
    canonical: "https://preguntame.eu/auth",
  },
  robots: {
    index: true,
    follow: true,
    noarchive: true, // Don't cache login pages
    googleBot: {
      index: true,
      follow: true,
    },
  },
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Login & Register - Pregúntame",
      description: "Sign in to Pregúntame to access your quiz dashboard and saved games.",
      url: "https://preguntame.eu/auth",
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
            name: "Login",
            item: "https://preguntame.eu/auth",
          },
        ],
      },
      potentialAction: {
        "@type": "LoginAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://preguntame.eu/auth",
        },
      },
    }),
  },
};

export default function AuthLoginPage() {
  return <AuthPage />;
}
