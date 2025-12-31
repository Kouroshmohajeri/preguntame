"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "@phosphor-icons/react";
import {
  Lightning,
  Clock,
  Trophy,
  ChartBar,
  CheckCircle,
  GameController,
  ChalkboardTeacher,
  UsersThree,
  Question,
  RocketLaunch,
  Sparkle,
  Globe,
  DeviceMobile,
  Users,
  Target,
} from "@phosphor-icons/react";
import styles from "@/app/what-is-preguntame/page.module.css";

export default function WhatIsPreguntame() {
  const router = useRouter();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const steps = [
    {
      badge: "Step 1",
      title: "Create Your Quiz",
      description:
        "Use our intuitive builder to create questions in seconds. Add multiple choice, true/false, or open ended questions with custom time limits and points.",
    },
    {
      badge: "Step 2",
      title: "Generate Game Code",
      description:
        'Get a unique game code (like "ABC123") that players need to join. Share it via link, QR code, or display on screen.',
    },
    {
      badge: "Step 3",
      title: "Players Join Instantly",
      description:
        "Participants enter the code and choose their display name. No accounts, downloads, or installations needed. Works on any device.",
    },
    {
      badge: "Step 4",
      title: "Live Gameplay",
      description:
        "Watch as players answer in real time with live leaderboards, response tracking, and instant results after each question.",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);

      if (sectionRef.current) {
        const section = sectionRef.current;
        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top;
        const sectionHeight = rect.height;
        const windowHeight = window.innerHeight;

        if (sectionTop < windowHeight && sectionTop + sectionHeight > 0) {
          const scrollProgress = Math.max(
            0,
            Math.min(1, (windowHeight - sectionTop) / (windowHeight + sectionHeight / 2))
          );
          const step = Math.floor(scrollProgress * 4);
          setActiveStep(Math.min(3, step));
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={styles.mainContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <a href="/" className={styles.breadcrumbLink}>
            Home
          </a>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>What is Preguntame</span>
        </nav>

        <h1 className={styles.mainTitle}>
          What is Preguntame? The Ultimate Free Real Time Quiz Platform
        </h1>

        <div className={styles.introText}>
          <p>
            <strong>Preguntame</strong> is a completely{" "}
            <strong>free real time quiz platform</strong> designed for interactive learning,
            engaging events, and competitive gameplay. As a leading{" "}
            <strong>live multiplayer quiz platform</strong>, it enables educators, event organizers,
            and team leaders to create, host, and play{" "}
            <strong>live quizzes with instant results</strong> and interactive scoring, all without
            any downloads or installations required.
          </p>
        </div>

        <div className={styles.pixelSeparator} aria-hidden="true">
          {[...Array(15)].map((_, i) => (
            <div key={i} className={styles.pixel} style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className={styles.contentSection} aria-labelledby="quick-actions">
        <h2 className="sr-only" id="quick-actions">
          Quick Actions
        </h2>
        <div className={styles.actionGrid}>
          <div
            className={styles.actionCard}
            onClick={() => router.push("/create")}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === "Enter" && router.push("/create")}
          >
            <RocketLaunch size={48} weight="fill" aria-hidden="true" />
            <h3>Create Free Quiz</h3>
            <p>Start building your live quiz now</p>
          </div>

          <div
            className={styles.actionCard}
            onClick={() => router.push("/join")}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === "Enter" && router.push("/join")}
          >
            <GameController size={48} weight="fill" aria-hidden="true" />
            <h3>Join Live Game</h3>
            <p>Enter a game code to play</p>
          </div>

          <div
            className={styles.actionCard}
            onClick={() => router.push("/dashboard")}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === "Enter" && router.push("/dashboard")}
          >
            <Sparkle size={48} weight="fill" aria-hidden="true" />
            <h3>Explore Features</h3>
            <p>Discover all capabilities</p>
          </div>
        </div>
      </section>

      {/* What is Preguntame */}
      <section className={styles.contentSection} aria-labelledby="what-is">
        <div className={styles.definitionBox}>
          <div className={styles.definitionIcon} aria-hidden="true">
            <Question size={64} weight="fill" />
          </div>
          <div className={styles.definitionContent}>
            <h2 id="what-is">What is Preguntame?</h2>
            <p>
              Preguntame (Spanish for "ask me") is an innovative <strong>free quiz platform</strong>{" "}
              that revolutionizes how quizzes are created, shared, and experienced. Unlike
              traditional quiz tools, it offers <strong>real time multiplayer functionality</strong>
              , allowing participants to compete simultaneously with live scoring, instant feedback,
              and dynamic leaderboards.
            </p>
            <p>
              Perfect for classrooms, corporate training, social events, and team building
              activities. Combining the excitement of game shows with practical educational tools.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorksSection} ref={sectionRef} aria-labelledby="how-it-works">
        <h2 className={styles.sectionTitle} id="how-it-works">
          How It Works
        </h2>

        <div className={styles.stackingContainer}>
          {steps.map((step, index) => (
            <article
              key={index}
              className={`${styles.stackCard} ${index <= activeStep ? styles.activeCard : ""}`}
              style={{ "--index": index } as React.CSSProperties}
            >
              <div className={styles.stackCardInner}>
                <div className={styles.stepBadge}>{step.badge}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Key Features */}
      <section className={styles.contentSection} aria-labelledby="key-features">
        <h2 className={styles.sectionTitle} id="key-features">
          Key Features
        </h2>

        <div className={styles.featuresGrid}>
          <article className={styles.featureCard}>
            <Lightning size={32} weight="fill" aria-hidden="true" />
            <h3>Real Time Multiplayer</h3>
            <p>Powered by WebSocket technology for instant synchronization with zero lag.</p>
          </article>

          <article className={styles.featureCard}>
            <Clock size={32} weight="fill" aria-hidden="true" />
            <h3>Speed Scoring</h3>
            <p>Award points based on accuracy and speed. Faster answers earn more points.</p>
          </article>

          <article className={styles.featureCard}>
            <Trophy size={32} weight="fill" aria-hidden="true" />
            <h3>Live Leaderboards</h3>
            <p>Dynamic rankings that update in real time to keep participants engaged.</p>
          </article>

          <article className={styles.featureCard}>
            <ChartBar size={32} weight="fill" aria-hidden="true" />
            <h3>Analytics</h3>
            <p>Detailed post game reports with performance metrics and participation data.</p>
          </article>

          <article className={styles.featureCard}>
            <CheckCircle size={32} weight="fill" aria-hidden="true" />
            <h3>Completely Free</h3>
            <p>Unlimited quizzes, unlimited players, unlimited games. Forever free.</p>
          </article>

          <article className={styles.featureCard}>
            <Globe size={32} weight="fill" aria-hidden="true" />
            <h3>No Downloads</h3>
            <p>Everything runs in modern web browsers. No app installations required.</p>
          </article>
        </div>
      </section>

      {/* Use Cases */}
      <section className={styles.contentSection} aria-labelledby="use-cases">
        <h2 className={styles.sectionTitle} id="use-cases">
          Perfect For
        </h2>

        <div className={styles.useCasesGrid}>
          <article className={styles.useCaseCard}>
            <ChalkboardTeacher size={48} weight="fill" aria-hidden="true" />
            <h3>Educators & Teachers</h3>
            <p>
              Transform assessments into engaging games for formative evaluation, review sessions,
              and classroom engagement.
            </p>
            <ul>
              <li>Formative assessment tool</li>
              <li>Student engagement booster</li>
              <li>Instant feedback mechanism</li>
            </ul>
          </article>

          <article className={styles.useCaseCard}>
            <Users size={48} weight="fill" aria-hidden="true" />
            <h3>Event Organizers</h3>
            <p>
              Engage audiences during conferences, workshops, and training sessions with interactive
              experiences.
            </p>
            <ul>
              <li>Audience interaction tool</li>
              <li>Knowledge retention aid</li>
              <li>Networking facilitator</li>
            </ul>
          </article>

          <article className={styles.useCaseCard}>
            <UsersThree size={48} weight="fill" aria-hidden="true" />
            <h3>Teams & Communities</h3>
            <p>
              Foster team building, conduct training assessments, and run virtual social events.
            </p>
            <ul>
              <li>Team building activities</li>
              <li>Training measurement</li>
              <li>Remote engagement tool</li>
            </ul>
          </article>
        </div>
      </section>

      {/* Technical Specs */}
      <section className={styles.contentSection} aria-labelledby="tech-specs">
        <h2 className={styles.sectionTitle} id="tech-specs">
          Technical Specifications
        </h2>

        <div className={styles.specsGrid}>
          <article className={styles.specCard}>
            <DeviceMobile size={24} weight="fill" aria-hidden="true" />
            <div>
              <h3>Device Compatibility</h3>
              <p>Works on all modern browsers across desktop, tablet, and mobile devices.</p>
            </div>
          </article>

          <article className={styles.specCard}>
            <Users size={24} weight="fill" aria-hidden="true" />
            <div>
              <h3>Player Capacity</h3>
              <p>Supports unlimited concurrent players per game. Perfect for any audience size.</p>
            </div>
          </article>

          <article className={styles.specCard}>
            <Target size={24} weight="fill" aria-hidden="true" />
            <div>
              <h3>Question Types</h3>
              <p>
                Multiple choice, true/false, open text, image based questions, and timed challenges.
              </p>
            </div>
          </article>

          <article className={styles.specCard}>
            <CheckCircle size={24} weight="fill" aria-hidden="true" />
            <div>
              <h3>Security & Privacy</h3>
              <p>Secure WebSocket connections, no personal data required, GDPR compliant.</p>
            </div>
          </article>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.contentSection} aria-labelledby="faq">
        <h2 className={styles.sectionTitle} id="faq">
          Frequently Asked Questions
        </h2>

        <div className={styles.faqContainer} itemScope itemType="https://schema.org/FAQPage">
          <article
            className={styles.faqItem}
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <h3 itemProp="name">Is Preguntame really free?</h3>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <p itemProp="text">
                Yes! Completely free with no hidden costs. Create unlimited quizzes, host unlimited
                games, and have unlimited players without any subscription or payment required.
              </p>
            </div>
          </article>

          <article
            className={styles.faqItem}
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <h3 itemProp="name">Do players need accounts?</h3>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <p itemProp="text">
                No, players only need a game code to join. They can enter any display name and start
                playing immediately without registration.
              </p>
            </div>
          </article>

          <article
            className={styles.faqItem}
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <h3 itemProp="name">How many players can join?</h3>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <p itemProp="text">
                Unlimited concurrent players. Whether you have 5 students or 500 attendees, everyone
                can participate simultaneously.
              </p>
            </div>
          </article>

          <article
            className={styles.faqItem}
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <h3 itemProp="name">Can I use it for commercial purposes?</h3>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <p itemProp="text">
                Absolutely! Free for both personal and commercial use. Perfect for corporate
                training, paid workshops, and events.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection} aria-labelledby="cta">
        <div className={styles.ctaBox}>
          <h2 id="cta">Ready to Get Started?</h2>
          <p>
            Create your first quiz in minutes and experience the power of real time interactive
            learning.
          </p>
          <div className={styles.ctaButtons}>
            <button onClick={() => router.push("/create")} className={styles.primaryButton}>
              Create Free Quiz
            </button>
            <button onClick={() => router.push("/join")} className={styles.secondaryButton}>
              Join a Game
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.poweredBy}>Designed & Powered by WebGallery</p>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} Preguntame. All rights reserved.
        </p>
      </footer>

      {/* Scroll to Top */}
      {showScrollTop && (
        <button className={styles.scrollTopButton} onClick={scrollToTop} aria-label="Scroll to top">
          <ArrowUp size={24} weight="bold" />
        </button>
      )}
    </div>
  );
}
