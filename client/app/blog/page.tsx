import { Metadata } from "next";
import PixelMenu from "@/components/PixelMenu/PixelMenu";
import BlogList from "@/components/BlogList/BlogList";

export const metadata: Metadata = {
  title: "Blog - Pregúntame | Quiz Tips, Education & Interactive Learning",
  description:
    "Explore the Pregúntame blog for tips on creating engaging quizzes, interactive learning strategies, classroom engagement ideas, and updates about our free real-time quiz platform.",
  keywords: [
    "quiz blog",
    "interactive learning",
    "education blog",
    "quiz tips",
    "classroom engagement",
    "teaching strategies",
    "online quiz guide",
    "preguntame blog",
    "educational technology",
    "quiz best practices",
  ],
  authors: [{ name: "Preguntame" }],
  openGraph: {
    title: "Blog - Pregúntame",
    description:
      "Tips, strategies, and insights for creating engaging quizzes and interactive learning experiences.",
    type: "website",
    locale: "en_US",
    siteName: "Preguntame",
    url: "https://preguntame.eu/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog - Pregúntame",
    description:
      "Tips, strategies, and insights for creating engaging quizzes and interactive learning experiences.",
  },
  alternates: {
    canonical: "https://preguntame.eu/blog",
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
      "@type": "Blog",
      name: "Pregúntame Blog",
      description:
        "Tips, strategies, and insights for creating engaging quizzes and interactive learning experiences.",
      url: "https://preguntame.eu/blog",
      publisher: {
        "@type": "Organization",
        name: "Preguntame",
        logo: {
          "@type": "ImageObject",
          url: "https://preguntame.eu/images/logo.svg",
        },
      },
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
            name: "Blog",
            item: "https://preguntame.eu/blog",
          },
        ],
      },
    }),
  },
};

export default function BlogPage() {
  return (
    <>
      <PixelMenu currentPage="blog" alwaysHamburger={false} />
      <BlogList />
    </>
  );
}
