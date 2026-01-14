import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics Dashboard - Pregúntame",
  description: "Real-time analytics and statistics",
  icons: {
    icon: [{ url: "/images/logo.svg", type: "image/svg+xml" }],
    apple: [{ url: "/images/logo.svg", type: "image/svg+xml" }],
  },
  appleWebApp: {
    capable: true,
    title: "Analytics",
    statusBarStyle: "black-translucent",
  },
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
