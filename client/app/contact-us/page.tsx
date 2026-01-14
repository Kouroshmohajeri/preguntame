import { Metadata } from "next";
import PixelMenu from "@/components/PixelMenu/PixelMenu";
import ContactForm from "@/components/ContactForm/ContactForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Contact Us - Pregúntame | Get in Touch",
  description:
    "Contact Pregúntame for support, feedback, or inquiries. Reach us via email at info@preguntame.eu or connect on LinkedIn and GitHub.",
  keywords: [
    "contact preguntame",
    "preguntame support",
    "quiz platform contact",
    "get in touch",
    "preguntame email",
    "customer support",
  ],
  openGraph: {
    title: "Contact Us - Preguntame",
    description:
      "Get in touch with the Pregúntame team. We're here to help with your quiz platform needs.",
    type: "website",
    url: "https://preguntame.eu/contact-us",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us - Preguntame",
    description:
      "Get in touch with the Pregúntame team. We're here to help with your quiz platform needs.",
  },
  alternates: {
    canonical: "https://preguntame.eu/contact-us",
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
          name: "Contact Us",
          item: "https://preguntame.eu/contact-us",
        },
      ],
    }),
  },
};

export default function ContactUsPage() {
  return (
    <>
      <PixelMenu currentPage="contact" alwaysHamburger={false} />

      <main className={styles.mainContainer}>
        <div className={styles.contentWrapper}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <a href="/" className={styles.breadcrumbLink}>
              Home
            </a>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span className={styles.breadcrumbCurrent}>Contact Us</span>
          </nav>
          {/* Hero Section */}
          <section className={styles.heroSection}>
            <h1 className={styles.mainTitle}>Get in Touch</h1>
            <p className={styles.subtitle}>
              Have questions, feedback, or just want to say hello? We'd love to hear from you.
            </p>

            {/* Pixel Separator */}
            <div className={styles.pixelSeparator}>
              {[...Array(15)].map((_, i) => (
                <div key={i} className={styles.pixel} style={{ "--i": i } as React.CSSProperties} />
              ))}
            </div>
          </section>

          {/* Contact Form Component */}
          <ContactForm />

          {/* Additional Info */}
          <section className={styles.infoSection}>
            <div className={styles.infoBox}>
              <h2 className={styles.infoTitle}>Response Time</h2>
              <p className={styles.infoText}>
                We typically respond to all inquiries within 24-48 hours during business days.
              </p>
            </div>

            <div className={styles.infoBox}>
              <h2 className={styles.infoTitle}>Open Source</h2>
              <p className={styles.infoText}>
                Check out our GitHub repository for contributions, issues, or to explore the code.
              </p>
            </div>

            <div className={styles.infoBox}>
              <h2 className={styles.infoTitle}>Professional Network</h2>
              <p className={styles.infoText}>
                Connect with us on LinkedIn for updates, insights, and professional networking.
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.poweredBy}>Designed & Powered by WebGallery</p>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} Pregúntame. All rights reserved.
        </p>
      </footer>
    </>
  );
}
