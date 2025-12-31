import { Metadata } from "next";
import PixelMenu from "@/components/PixelMenu/PixelMenu";
import KahootAlternative from "@/components/KahootAlternative/KahootAlternative";

export const metadata: Metadata = {
  title: "Kahoot Alternative | Free Real-Time Quiz Platform - Pregúntame",
  description:
    "Looking for a Kahoot alternative? Pregúntame is a free real-time quiz platform with unlimited quizzes and unlimited players. Create live multiplayer quizzes with no subscriptions required.",
  keywords: [
    "kahoot alternative",
    "kahoot alternative free",
    "free kahoot alternative",
    "kahoot competitor",
    "kahoot vs preguntame",
    "free quiz platform",
    "kahoot free alternative",
    "interactive quiz tool",
    "live quiz platform free",
    "kahoot like platform",
    "kahoot substitute",
    "quiz platform comparison",
  ],
  authors: [{ name: "Preguntame" }],
  openGraph: {
    title: "Kahoot Alternative | Free Real-Time Quiz Platform - Pregúntame",
    description:
      "Pregúntame is a free Kahoot alternative with unlimited quizzes and players. No subscriptions required.",
    type: "website",
    locale: "en_US",
    siteName: "Preguntame",
    url: "https://preguntame.eu/kahoot-alternative",
    images: [
      {
        url: "https://preguntame.eu/images/logo.png",
        width: 1200,
        height: 630,
        alt: "Pregúntame - Free Kahoot Alternative",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kahoot Alternative | Free Real-Time Quiz Platform",
    description: "Pregúntame is a free Kahoot alternative with unlimited quizzes and players.",
  },
  alternates: {
    canonical: "https://preguntame.eu/kahoot-alternative",
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
        name: "Pregúntame - Kahoot Alternative",
        applicationCategory: ["EducationalApplication", "GameApplication"],
        operatingSystem: "Web Browser",
        description:
          "Pregúntame is a free Kahoot alternative offering unlimited real-time quizzes and unlimited players with no subscription fees. Perfect for educators, event organizers, and teams.",
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
          ratingValue: "4.9",
          ratingCount: "312",
          bestRating: "5",
          worstRating: "1",
        },
        featureList: [
          "Unlimited quizzes",
          "Unlimited players",
          "Real-time multiplayer",
          "Live leaderboards",
          "Speed-based scoring",
          "No subscriptions required",
          "Mobile responsive",
          "Instant game codes",
          "PDF export",
          "Analytics dashboard",
        ],
        screenshot: "https://preguntame.eu/images/logo.png",
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
            name: "What is the best Kahoot alternative?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Pregúntame is one of the best Kahoot alternatives, offering a free real-time quiz platform with unlimited quizzes and unlimited players. Unlike Kahoot which requires paid plans for many features, Pregúntame currently provides all features at no cost, including real-time multiplayer, live leaderboards, analytics, and speed-based scoring.",
            },
          },
          {
            "@type": "Question",
            name: "Is Pregúntame free like Kahoot?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, Pregúntame is currently free with all features included. Unlike Kahoot which has a free tier with limitations and requires paid subscriptions for full features, Pregúntame currently provides unlimited quizzes, unlimited players, and complete feature access at no cost. While we may introduce premium plans in the future, we're committed to maintaining a robust free tier that serves educators and users effectively.",
            },
          },
          {
            "@type": "Question",
            name: "How is Pregúntame different from Kahoot?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Pregúntame differs from Kahoot in several key ways: it's currently free with all features, supports unlimited players without restrictions, offers true real-time WebSocket synchronization, has no question limits, requires no account for players to join, and provides full analytics at no cost. It's built as a modern, accessible alternative focused on delivering value to educators and teams.",
            },
          },
          {
            "@type": "Question",
            name: "Can I use Pregúntame for the same purposes as Kahoot?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, Pregúntame works perfectly for all the same use cases as Kahoot: classroom assessments, corporate training, event engagement, team building, conferences, workshops, and any scenario where you need live, interactive quizzes. It provides the same real-time multiplayer experience with competitive scoring and leaderboards.",
            },
          },
          {
            "@type": "Question",
            name: "Does Pregúntame have player limits like Kahoot free plan?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No, Pregúntame currently has no player limits. While Kahoot's free plan restricts the number of participants, Pregúntame supports unlimited concurrent players in any quiz game, whether you have 5 students or 5000 conference attendees. There are currently no restrictions on player capacity.",
            },
          },
          {
            "@type": "Question",
            name: "Do I need to create an account to play on Pregúntame like Kahoot?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No, players don't need accounts on Pregúntame. Just like Kahoot, players join games using a simple game code. However, hosts also have a streamlined experience - you can create quizzes and host games with minimal setup, making it even more accessible than traditional quiz platforms.",
            },
          },
          {
            "@type": "Question",
            name: "What features does Pregúntame offer that Kahoot charges for?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Pregúntame currently offers many features at no cost that Kahoot includes only in paid plans: unlimited quizzes, advanced analytics, detailed reports, PDF exports, and full feature access. Everything that enhances learning and engagement is currently available to all users without payment.",
            },
          },
          {
            "@type": "Question",
            name: "Is Pregúntame as reliable as Kahoot for live events?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, Pregúntame uses modern WebSocket technology for true real-time synchronization, making it highly reliable for live events of any size. The platform handles concurrent players smoothly, maintains synchronized timers across all devices, and provides instant score updates. Many users find it performs excellently even with large audiences.",
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
            name: "Kahoot Alternative",
            item: "https://preguntame.eu/kahoot-alternative",
          },
        ],
      },
    ]),
  },
};

export default function KahootAlternativePage() {
  return (
    <>
      <PixelMenu alwaysHamburger={false} />
      <KahootAlternative />
    </>
  );
}
