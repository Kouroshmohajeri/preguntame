import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components/Providers/Providers";
import { SocketProvider } from "@/context/SocketContext/SocketContext";

// Load Nunito from local file
const nunito = localFont({
  src: "../public/Fonts/Nunito-Medium.ttf",
  variable: "--font-nunito",
  weight: "500",
  style: "normal",
});

// Comprehensive SEO metadata
export const metadata: Metadata = {
  title: "Pregúntame | Real-Time Quiz Platform - Interactive Live Trivia Game",
  description:
    "Create, join, and host real-time quiz games for free! Engage in live trivia competitions, multiplayer quizzes, and interactive learning. Perfect for classrooms, parties, and team building.",
  keywords: [
    "real-time quiz",
    "live trivia",
    "interactive quiz platform",
    "multiplayer quiz game",
    "create quiz online",
    "join quiz game",
    "free quiz platform",
    "live competition",
    "trivia game",
    "educational quiz",
  ],
  authors: [{ name: "Web Gallery" }],
  creator: "Pregúntame",
  publisher: "Pregúntame",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://preguntame.eu",
    title: "Pregúntame | Real-Time Quiz Platform",
    description:
      "Create, join, and host real-time quiz games for free! Engage in live trivia competitions.",
    siteName: "Pregúntame",
    images: [
      {
        url: "https://preguntame.eu/images/logo/logo.png",
        width: 1200,
        height: 630,
        alt: "Pregúntame Real-Time Quiz Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pregúntame | Real-Time Quiz Platform",
    description: "Create, join, and host real-time quiz games for free!",
    images: ["https://preguntame.eu/images/logo/logo.png"],
    creator: "@preguntame",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  verification: {
    // verification codes here when available
    // google: "verification-code",
    // yandex: "verification-code",
    // yahoo: "verification-code",
  },
  alternates: {
    canonical: "https://preguntame.eu",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/images/p.svg" />
        <link rel="icon" type="image/png" href="/images/logo/logo.png" />
        {/* Preconnect to improve performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        {/* Structured Data for Rich Results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Pregúntame",
              url: "https://preguntame.eu",
              description:
                "Free real-time quiz platform for creating and hosting interactive multiplayer trivia games",
              applicationCategory: ["GameApplication", "EducationalApplication"],
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                description: "Free plan with premium features available",
              },
              featureList: [
                "Real-time multiplayer quizzes",
                "Interactive game hosting",
                "Speed-based scoring system",
                "Detailed player analytics",
                "PDF export functionality",
                "Mobile-responsive design",
              ],
              screenshot: "https://preguntame.eu/images/logo/logo.png",
              author: {
                "@type": "Organization",
                name: "Web Gallery",
              },
            }),
          }}
        />
        {/* Mobile Web App Capable */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Theme Color */}
        <meta name="theme-color" content="#fefaf6" />
      </head>
      <body className={`${nunito.variable} font-sans antialiased bg-[#fefaf6] dark:bg-gray-900`}>
        <Providers>
          <SocketProvider>
            <main id="main-content">{children}</main>
          </SocketProvider>
        </Providers>
      </body>
    </html>
  );
}
