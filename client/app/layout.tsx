import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components/Providers/Providers";
import { SocketProvider } from "@/context/SocketContext/SocketContext";

// Load Nunito from local file
const nunito = localFont({
  src: "../public/fonts/Nunito-Medium.ttf",
  variable: "--font-nunito",
  weight: "500",
  style: "normal",
});

// Keep your existing metadata
export const metadata: Metadata = {
  title: "Pregúntame",
  description: "Generated questions for free!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/images/p.svg" />
        {/* Optional PNG fallback if desired */}
        {/* <link rel="icon" type="image/png" href="/images/logo.svg" /> */}
      </head>
      <body className={`${nunito.variable} font-sans antialiased`}>
        <Providers>
          <SocketProvider>{children}</SocketProvider>
        </Providers>
      </body>
    </html>
  );
}
