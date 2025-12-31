import { Metadata } from "next";
import PixelMenu from "@/components/PixelMenu/PixelMenu";
import PrivacyPolicy from "@/components/PrivacyPolicy/PrivacyPolicy";

export const metadata: Metadata = {
  title: "Privacy Policy | Pregúntame - Data Protection & GDPR Compliance",
  description:
    "Read Pregúntame's privacy policy. Learn how we collect, use, and protect your data. GDPR compliant quiz platform with transparent data practices.",
  keywords: [
    "preguntame privacy policy",
    "data protection",
    "GDPR compliance",
    "privacy quiz platform",
    "user data security",
    "quiz data privacy",
  ],
  authors: [{ name: "Preguntame" }],
  openGraph: {
    title: "Privacy Policy | Pregúntame",
    description: "Learn how we protect your data and respect your privacy.",
    type: "website",
    locale: "en_US",
    siteName: "Preguntame",
    url: "https://preguntame.eu/privacy",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | Pregúntame",
    description: "Learn how we protect your data and respect your privacy.",
  },
  alternates: {
    canonical: "https://preguntame.eu/privacy",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Privacy Policy - Pregúntame",
      description: "Privacy policy and data protection information for Pregúntame quiz platform.",
      url: "https://preguntame.eu/privacy",
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
            name: "Privacy Policy",
            item: "https://preguntame.eu/privacy",
          },
        ],
      },
    }),
  },
};

export default function PrivacyPage() {
  return (
    <>
      <PixelMenu alwaysHamburger={false} />
      <PrivacyPolicy />
    </>
  );
}
