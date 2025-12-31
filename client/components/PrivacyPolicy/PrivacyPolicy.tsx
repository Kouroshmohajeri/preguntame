"use client";

import { useState, useEffect } from "react";
import {
  ArrowUp,
  ShieldCheck,
  Eye,
  Lock,
  Database,
  UserCircle,
  Globe,
} from "@phosphor-icons/react";
import styles from "./PrivacyPolicy.module.css";

export default function PrivacyPolicy() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);

      // Update active section based on scroll position
      const sections = document.querySelectorAll("[data-section]");
      let current = "";

      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        if (window.scrollY >= sectionTop - 100) {
          current = section.getAttribute("data-section") || "";
        }
      });

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({ top: elementPosition, behavior: "smooth" });
    }
  };

  const lastUpdated = "December 31, 2024";

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <a href="/" className={styles.breadcrumbLink}>
              Home
            </a>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span className={styles.breadcrumbCurrent}>Privacy Policy</span>
          </nav>

          <div className={styles.heroIcon}>
            <ShieldCheck size={64} weight="fill" />
          </div>

          <h1 className={styles.mainTitle}>Privacy Policy</h1>

          <div className={styles.lastUpdated}>
            <strong>Last Updated:</strong> {lastUpdated}
          </div>

          <div className={styles.introText}>
            <p>
              At <strong>Pregúntame</strong>, we take your privacy seriously. This Privacy Policy
              explains how we collect, use, protect, and handle your personal information when you
              use our real-time quiz platform.
            </p>
            <p>
              We are committed to transparency and compliance with the{" "}
              <strong>General Data Protection Regulation (GDPR)</strong> and other applicable data
              protection laws.
            </p>
          </div>

          <div className={styles.pixelSeparator} aria-hidden="true">
            {[...Array(15)].map((_, i) => (
              <div key={i} className={styles.pixel} style={{ "--i": i } as React.CSSProperties} />
            ))}
          </div>
        </section>

        {/* Main Content Grid */}
        <div className={styles.mainContent}>
          {/* Table of Contents */}
          <aside className={styles.sidebar}>
            <div className={styles.tocCard}>
              <h2 className={styles.tocTitle}>Table of Contents</h2>
              <nav className={styles.tocList}>
                <a
                  href="#information-we-collect"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("information-we-collect");
                  }}
                  className={activeSection === "information-we-collect" ? styles.active : ""}
                >
                  <Database size={16} weight="fill" />
                  Information We Collect
                </a>
                <a
                  href="#how-we-use"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("how-we-use");
                  }}
                  className={activeSection === "how-we-use" ? styles.active : ""}
                >
                  <Eye size={16} weight="fill" />
                  How We Use Information
                </a>
                <a
                  href="#data-sharing"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("data-sharing");
                  }}
                  className={activeSection === "data-sharing" ? styles.active : ""}
                >
                  <Globe size={16} weight="fill" />
                  Data Sharing
                </a>
                <a
                  href="#data-security"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("data-security");
                  }}
                  className={activeSection === "data-security" ? styles.active : ""}
                >
                  <Lock size={16} weight="fill" />
                  Data Security
                </a>
                <a
                  href="#your-rights"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("your-rights");
                  }}
                  className={activeSection === "your-rights" ? styles.active : ""}
                >
                  <UserCircle size={16} weight="fill" />
                  Your Rights
                </a>
                <a
                  href="#cookies"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("cookies");
                  }}
                  className={activeSection === "cookies" ? styles.active : ""}
                >
                  Cookies Policy
                </a>
                <a
                  href="#children"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("children");
                  }}
                  className={activeSection === "children" ? styles.active : ""}
                >
                  Children's Privacy
                </a>
                <a
                  href="#changes"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("changes");
                  }}
                  className={activeSection === "changes" ? styles.active : ""}
                >
                  Policy Changes
                </a>
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("contact");
                  }}
                  className={activeSection === "contact" ? styles.active : ""}
                >
                  Contact Us
                </a>
              </nav>
            </div>
          </aside>

          {/* Policy Content */}
          <article className={styles.policyContent}>
            {/* Section 1: Information We Collect */}
            <section
              id="information-we-collect"
              data-section="information-we-collect"
              className={styles.section}
            >
              <div className={styles.sectionIcon}>
                <Database size={32} weight="fill" />
              </div>
              <h2>1. Information We Collect</h2>

              <h3>1.1 Account Information</h3>
              <p>When you create an account using Google Sign-In, we collect:</p>
              <ul>
                <li>
                  <strong>Name</strong> (first and last name from your Google account)
                </li>
                <li>
                  <strong>Email address</strong>
                </li>
                <li>
                  <strong>Google profile ID</strong>
                </li>
              </ul>

              <h3>1.2 Quiz Player Information</h3>
              <p>When players join quiz games without accounts, we may temporarily collect:</p>
              <ul>
                <li>
                  <strong>Display name</strong> (chosen by the player)
                </li>
                <li>
                  <strong>Game session data</strong> (responses, scores, timestamps)
                </li>
                <li>
                  <strong>IP address</strong> (for security and fraud prevention)
                </li>
              </ul>
              <p className={styles.note}>
                <strong>Note:</strong> Anonymous players' data is only stored for the duration of
                the game session and is automatically deleted after the game ends unless the host
                exports results.
              </p>

              <h3>1.3 Automatically Collected Information</h3>
              <p>We automatically collect certain technical information:</p>
              <ul>
                <li>
                  <strong>Device information</strong> (browser type, operating system, device type)
                </li>
                <li>
                  <strong>Usage data</strong> (pages visited, features used, time spent)
                </li>
                <li>
                  <strong>IP address</strong> and general location (country/city level)
                </li>
                <li>
                  <strong>Cookies and similar tracking technologies</strong>
                </li>
              </ul>

              <h3>1.4 Quiz Content</h3>
              <p>If you create quizzes, we store:</p>
              <ul>
                <li>Quiz questions and answers</li>
                <li>Quiz settings and configurations</li>
                <li>Game results and analytics</li>
              </ul>
            </section>

            {/* Section 2: How We Use Information */}
            <section id="how-we-use" data-section="how-we-use" className={styles.section}>
              <div className={styles.sectionIcon}>
                <Eye size={32} weight="fill" />
              </div>
              <h2>2. How We Use Your Information</h2>

              <p>We use your personal information for the following purposes:</p>

              <div className={styles.purposeCard}>
                <h3>2.1 Service Provision</h3>
                <ul>
                  <li>Creating and managing your account</li>
                  <li>Enabling quiz creation, hosting, and participation</li>
                  <li>Storing your quiz content and game history</li>
                  <li>Processing and displaying real-time game data</li>
                </ul>
              </div>

              <div className={styles.purposeCard}>
                <h3>2.2 Communication</h3>
                <ul>
                  <li>Sending important service updates and notifications</li>
                  <li>Responding to your inquiries and support requests</li>
                  <li>Sending promotional emails (with your consent, opt-out available)</li>
                </ul>
              </div>

              <div className={styles.purposeCard}>
                <h3>2.3 Improvement & Analytics</h3>
                <ul>
                  <li>Analyzing platform usage to improve features</li>
                  <li>Understanding user behavior and preferences</li>
                  <li>Developing new features and services</li>
                  <li>Conducting research and analysis</li>
                </ul>
              </div>

              <div className={styles.purposeCard}>
                <h3>2.4 Security & Legal Compliance</h3>
                <ul>
                  <li>Preventing fraud, abuse, and security incidents</li>
                  <li>Enforcing our Terms of Service</li>
                  <li>Complying with legal obligations</li>
                  <li>Protecting our rights and property</li>
                </ul>
              </div>
            </section>

            {/* Section 3: Data Sharing */}
            <section id="data-sharing" data-section="data-sharing" className={styles.section}>
              <div className={styles.sectionIcon}>
                <Globe size={32} weight="fill" />
              </div>
              <h2>3. How We Share Your Information</h2>

              <p>
                We do <strong>not sell</strong> your personal information. We may share your data
                only in the following circumstances:
              </p>

              <h3>3.1 Service Providers</h3>
              <p>We share data with trusted third-party service providers who help us operate:</p>
              <ul>
                <li>
                  <strong>Hosting Services:</strong> AWS (Amazon Web Services), Vercel, Render
                </li>
                <li>
                  <strong>Authentication:</strong> Google OAuth for sign-in
                </li>
                <li>
                  <strong>Database:</strong> MongoDB, Redis, DynamoDB
                </li>
                <li>
                  <strong>Analytics:</strong> Vercel Analytics (privacy-focused, no personal data)
                </li>
              </ul>
              <p className={styles.note}>
                All service providers are contractually required to protect your data and use it
                only for providing services to us.
              </p>

              <h3>3.2 Quiz Hosts</h3>
              <p>When you join a quiz game, the quiz host (creator) has access to:</p>
              <ul>
                <li>Your chosen display name</li>
                <li>Your quiz responses and scores</li>
                <li>Game performance metrics</li>
              </ul>
              <p className={styles.note}>
                Quiz hosts are independent data controllers responsible for their own use of this
                data.
              </p>

              <h3>3.3 Legal Requirements</h3>
              <p>We may disclose your information if required by law or to:</p>
              <ul>
                <li>Comply with legal processes, court orders, or government requests</li>
                <li>Protect our rights, property, or safety</li>
                <li>Prevent fraud or security threats</li>
                <li>Enforce our Terms of Service</li>
              </ul>

              <h3>3.4 Business Transfers</h3>
              <p>
                In the event of a merger, acquisition, or sale of assets, your information may be
                transferred to the new entity. We will notify you of any such change.
              </p>
            </section>

            {/* Section 4: Data Security */}
            <section id="data-security" data-section="data-security" className={styles.section}>
              <div className={styles.sectionIcon}>
                <Lock size={32} weight="fill" />
              </div>
              <h2>4. Data Security</h2>

              <p>
                We implement industry-standard security measures to protect your personal
                information:
              </p>

              <div className={styles.securityGrid}>
                <div className={styles.securityItem}>
                  <Lock size={24} weight="fill" />
                  <h4>Encryption</h4>
                  <p>All data transmitted is encrypted using HTTPS/TLS protocols</p>
                </div>

                <div className={styles.securityItem}>
                  <ShieldCheck size={24} weight="fill" />
                  <h4>Secure Storage</h4>
                  <p>Data stored on secure servers with restricted access</p>
                </div>

                <div className={styles.securityItem}>
                  <Database size={24} weight="fill" />
                  <h4>Regular Backups</h4>
                  <p>Automated backups to prevent data loss</p>
                </div>

                <div className={styles.securityItem}>
                  <ShieldCheck size={24} weight="fill" />
                  <h4>Access Controls</h4>
                  <p>Limited access to personal data by authorized personnel only</p>
                </div>
              </div>

              <p className={styles.warning}>
                <strong>Important:</strong> While we take reasonable measures to protect your data,
                no method of transmission over the internet is 100% secure. We cannot guarantee
                absolute security.
              </p>
            </section>

            {/* Section 5: Your Rights */}
            <section id="your-rights" data-section="your-rights" className={styles.section}>
              <div className={styles.sectionIcon}>
                <UserCircle size={32} weight="fill" />
              </div>
              <h2>5. Your Privacy Rights</h2>

              <p>
                Under GDPR and other privacy laws, you have the following rights regarding your
                personal data:
              </p>

              <div className={styles.rightsCard}>
                <h3>🔍 Right to Access</h3>
                <p>You can request a copy of all personal data we hold about you.</p>
              </div>

              <div className={styles.rightsCard}>
                <h3>✏️ Right to Rectification</h3>
                <p>You can request corrections to inaccurate or incomplete data.</p>
              </div>

              <div className={styles.rightsCard}>
                <h3>🗑️ Right to Erasure ("Right to be Forgotten")</h3>
                <p>
                  You can request deletion of your personal data. We will comply within 30 days
                  unless we have legal obligations to retain it.
                </p>
              </div>

              <div className={styles.rightsCard}>
                <h3>⛔ Right to Restrict Processing</h3>
                <p>You can request that we limit how we use your data.</p>
              </div>

              <div className={styles.rightsCard}>
                <h3>📦 Right to Data Portability</h3>
                <p>
                  You can request your data in a machine-readable format to transfer to another
                  service.
                </p>
              </div>

              <div className={styles.rightsCard}>
                <h3>🚫 Right to Object</h3>
                <p>You can object to processing of your data for marketing or other purposes.</p>
              </div>

              <div className={styles.rightsCard}>
                <h3>⚖️ Right to Withdraw Consent</h3>
                <p>You can withdraw consent for data processing at any time.</p>
              </div>

              <p className={styles.ctaText}>
                To exercise any of these rights, please contact us at{" "}
                <a href="mailto:privacy@preguntame.eu" className={styles.emailLink}>
                  privacy@preguntame.eu
                </a>
              </p>
            </section>

            {/* Section 6: Cookies */}
            <section id="cookies" data-section="cookies" className={styles.section}>
              <div className={styles.sectionIcon}>
                <Database size={32} weight="fill" />
              </div>
              <h2>6. Cookies and Tracking Technologies</h2>

              <p>
                We use cookies and similar technologies to enhance your experience and analyze
                platform usage.
              </p>

              <h3>6.1 What Are Cookies?</h3>
              <p>
                Cookies are small text files stored on your device that help us recognize you and
                remember your preferences.
              </p>

              <h3>6.2 Types of Cookies We Use</h3>

              <div className={styles.cookieTable}>
                <div className={styles.cookieRow}>
                  <div className={styles.cookieType}>
                    <strong>Essential Cookies</strong>
                  </div>
                  <div className={styles.cookieDesc}>
                    Required for the platform to function (login sessions, security)
                  </div>
                  <div className={styles.cookieRequired}>Required</div>
                </div>

                <div className={styles.cookieRow}>
                  <div className={styles.cookieType}>
                    <strong>Performance Cookies</strong>
                  </div>
                  <div className={styles.cookieDesc}>
                    Help us analyze usage and improve features
                  </div>
                  <div className={styles.cookieOptional}>Optional</div>
                </div>

                <div className={styles.cookieRow}>
                  <div className={styles.cookieType}>
                    <strong>Functional Cookies</strong>
                  </div>
                  <div className={styles.cookieDesc}>Remember your preferences and settings</div>
                  <div className={styles.cookieOptional}>Optional</div>
                </div>
              </div>

              <h3>6.3 Managing Cookies</h3>
              <p>
                You can control cookies through your browser settings. Note that disabling cookies
                may affect platform functionality.
              </p>
            </section>

            {/* Section 7: Children's Privacy */}
            <section id="children" data-section="children" className={styles.section}>
              <div className={styles.sectionIcon}>
                <UserCircle size={32} weight="fill" />
              </div>
              <h2>7. Children's Privacy</h2>

              <p>
                Pregúntame is designed for general audiences and can be used in educational settings
                with students of all ages.
              </p>

              <h3>7.1 Users Under 13</h3>
              <p>
                We do not knowingly collect personal information from children under 13 without
                parental consent. If a parent or guardian becomes aware that their child has
                provided us with personal information without consent, please contact us
                immediately.
              </p>

              <h3>7.2 Educational Use</h3>
              <p>
                Teachers and educators using Pregúntame with students under 13 are responsible for
                obtaining appropriate parental consent and complying with COPPA (Children's Online
                Privacy Protection Act) and other applicable laws.
              </p>

              <h3>7.3 Anonymous Participation</h3>
              <p>
                Students can participate in quizzes anonymously without creating accounts or
                providing personal information beyond a display name.
              </p>
            </section>

            {/* Section 8: Data Retention */}
            <section id="data-retention" data-section="data-retention" className={styles.section}>
              <div className={styles.sectionIcon}>
                <Database size={32} weight="fill" />
              </div>
              <h2>8. Data Retention</h2>

              <p>We retain your personal information only as long as necessary:</p>

              <ul>
                <li>
                  <strong>Account data:</strong> Retained until you delete your account or request
                  deletion
                </li>
                <li>
                  <strong>Quiz content:</strong> Retained as long as your account is active
                </li>
                <li>
                  <strong>Game session data:</strong> Retained for 90 days after game completion
                  (unless exported by host)
                </li>
                <li>
                  <strong>Anonymous player data:</strong> Deleted immediately after game session
                  ends
                </li>
                <li>
                  <strong>Analytics data:</strong> Aggregated and anonymized, retained for 24 months
                </li>
              </ul>

              <p>
                After the retention period, we securely delete or anonymize your data in accordance
                with our data retention policy.
              </p>
            </section>

            {/* Section 9: International Data Transfers */}
            <section id="international" data-section="international" className={styles.section}>
              <div className={styles.sectionIcon}>
                <Globe size={32} weight="fill" />
              </div>
              <h2>9. International Data Transfers</h2>

              <p>
                Pregúntame is based in <strong>Barcelona, Spain</strong> (European Union). Your data
                is primarily stored on servers located in the EU.
              </p>

              <p>
                Some of our service providers (AWS, Vercel, Render) may process data in other
                countries. When data is transferred outside the EU, we ensure adequate protection
                through:
              </p>

              <ul>
                <li>EU Standard Contractual Clauses</li>
                <li>Adequacy decisions by the European Commission</li>
                <li>Other approved data transfer mechanisms</li>
              </ul>
            </section>

            {/* Section 10: Policy Changes */}
            <section id="changes" data-section="changes" className={styles.section}>
              <div className={styles.sectionIcon}>
                <ShieldCheck size={32} weight="fill" />
              </div>
              <h2>10. Changes to This Privacy Policy</h2>

              <p>
                We may update this Privacy Policy from time to time to reflect changes in our
                practices, technology, legal requirements, or other factors.
              </p>

              <p>
                <strong>We will notify you of material changes by:</strong>
              </p>
              <ul>
                <li>Posting the updated policy on this page with a new "Last Updated" date</li>
                <li>Sending an email notification to registered users</li>
                <li>Displaying a prominent notice on our platform</li>
              </ul>

              <p>
                Your continued use of Pregúntame after changes become effective constitutes
                acceptance of the updated Privacy Policy.
              </p>
            </section>

            {/* Section 11: Contact Us */}
            <section id="contact" data-section="contact" className={styles.section}>
              <div className={styles.sectionIcon}>
                <UserCircle size={32} weight="fill" />
              </div>
              <h2>11. Contact Us</h2>

              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or
                our data practices, please contact us:
              </p>

              <div className={styles.contactCard}>
                <h3>Pregúntame Data Protection</h3>
                <p>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:info.preguntame@gmail.com" className={styles.emailLink}>
                    info.preguntame@gmail.com
                  </a>
                </p>
                <p>
                  <strong>Address:</strong> Barcelona, Catalonia, Spain
                </p>
                <p>
                  <strong>Response Time:</strong> We aim to respond to all inquiries within 72 hours
                </p>
              </div>

              <p className={styles.finalNote}>
                You also have the right to lodge a complaint with your local data protection
                authority if you believe we have not adequately addressed your concerns.
              </p>
            </section>

            {/* Summary Box */}
            <div className={styles.summaryBox}>
              <h3>📋 Privacy Policy Summary</h3>
              <ul>
                <li>✅ We only collect data necessary to provide our quiz platform services</li>
                <li>✅ We do NOT sell your personal information</li>
                <li>✅ Anonymous quiz participation is available (no account needed)</li>
                <li>✅ You can access, correct, or delete your data at any time</li>
                <li>✅ We use industry-standard security measures</li>
                <li>✅ We comply with GDPR and applicable privacy laws</li>
                <li>✅ Cookies can be controlled through your browser settings</li>
              </ul>
            </div>
          </article>
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <p className={styles.poweredBy}>Designed & Powered by WebGallery</p>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Pregúntame. All rights reserved.
          </p>
        </footer>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button className={styles.scrollTopButton} onClick={scrollToTop} aria-label="Scroll to top">
          <ArrowUp size={24} weight="bold" />
        </button>
      )}
    </div>
  );
}
