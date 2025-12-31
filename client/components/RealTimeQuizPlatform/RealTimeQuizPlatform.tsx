"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "@phosphor-icons/react";
import {
  Lightning,
  Clock,
  Trophy,
  ChartBar,
  Users,
  Globe,
  Broadcast,
  Pulse,
  ArrowsClockwise,
  CheckCircle,
  RocketLaunch,
  GameController,
  Target,
  GraphicsCard,
} from "@phosphor-icons/react";
import styles from "./RealTimeQuizPlatform.module.css";

export default function RealTimeQuizPlatform() {
  const router = useRouter();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
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
          <span className={styles.breadcrumbCurrent}>Real-Time Quiz Platform</span>
        </nav>

        <div className={styles.heroIcon}>
          <Lightning size={64} weight="fill" />
        </div>

        <h1 className={styles.mainTitle}>Real-Time Quiz Platform</h1>

        <div className={styles.introText}>
          <p>
            <strong>Pregúntame is a real-time quiz platform</strong> that enables live, synchronized
            multiplayer quiz games with instant results and real-time scoring. Unlike traditional
            quiz platforms that collect responses for later review, our{" "}
            <strong>real-time platform</strong> uses WebSocket technology to deliver truly live,
            interactive experiences where every participant sees questions simultaneously, answers
            are processed instantly, and leaderboards update in real-time.
          </p>
        </div>

        <div className={styles.pixelSeparator} aria-hidden="true">
          {[...Array(15)].map((_, i) => (
            <div key={i} className={styles.pixel} style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>
      </section>

      {/* What is Real-Time Section */}
      <section className={styles.contentSection} aria-labelledby="what-is-realtime">
        <h2 className={styles.sectionTitle} id="what-is-realtime">
          What is a Real-Time Quiz Platform?
        </h2>

        <div className={styles.definitionBox}>
          <div className={styles.definitionIcon}>
            <Pulse size={48} weight="fill" />
          </div>
          <div className={styles.definitionContent}>
            <p>
              A <strong>real-time quiz platform</strong> is an interactive quiz system where
              multiple participants answer questions simultaneously, and results are processed and
              displayed instantly without delay. Real-time platforms maintain persistent connections
              between all devices, ensuring perfect synchronization across players, hosts, and
              display screens.
            </p>
            <p>
              <strong>Pregúntame</strong> exemplifies a true real-time quiz platform by using
              WebSocket technology for bidirectional communication, enabling live countdown timers,
              instant answer submission, real-time score calculations, and dynamic leaderboard
              updates that all participants see at the exact same moment.
            </p>
          </div>
        </div>
      </section>

      {/* Key Real-Time Features */}
      <section className={styles.contentSection} aria-labelledby="realtime-features">
        <h2 className={styles.sectionTitle} id="realtime-features">
          Real-Time Platform Features
        </h2>

        <div className={styles.featuresGrid}>
          <article className={styles.featureCard}>
            <Broadcast size={40} weight="fill" />
            <h3>Live Synchronization</h3>
            <p>
              All players receive questions at the exact same moment through WebSocket connections,
              ensuring fair, synchronized gameplay.
            </p>
          </article>

          <article className={styles.featureCard}>
            <Lightning size={40} weight="fill" />
            <h3>Instant Processing</h3>
            <p>
              Answers are processed in real-time as they're submitted, with scores calculated and
              displayed within milliseconds.
            </p>
          </article>

          <article className={styles.featureCard}>
            <Trophy size={40} weight="fill" />
            <h3>Live Leaderboards</h3>
            <p>
              Rankings update in real-time after each question, keeping players engaged and
              competitive throughout the game.
            </p>
          </article>

          <article className={styles.featureCard}>
            <Clock size={40} weight="fill" />
            <h3>Synchronized Timers</h3>
            <p>
              Real-time countdown timers tick simultaneously on all devices, creating urgency and
              fair time limits.
            </p>
          </article>

          <article className={styles.featureCard}>
            <ArrowsClockwise size={40} weight="fill" />
            <h3>Bidirectional Communication</h3>
            <p>
              Two-way data flow allows instant updates from server to clients and immediate response
              collection from players.
            </p>
          </article>

          <article className={styles.featureCard}>
            <ChartBar size={40} weight="fill" />
            <h3>Real-Time Analytics</h3>
            <p>
              Track player performance, response times, and engagement metrics as they happen during
              live gameplay.
            </p>
          </article>
        </div>
      </section>

      {/* How Real-Time Works */}
      <section className={styles.contentSection} aria-labelledby="how-it-works">
        <h2 className={styles.sectionTitle} id="how-it-works">
          How Real-Time Technology Works
        </h2>

        <div className={styles.techExplanation}>
          <div className={styles.techCard}>
            <div className={styles.techNumber}>1</div>
            <div className={styles.techContent}>
              <h3>WebSocket Connections</h3>
              <p>
                When players join, the platform establishes persistent WebSocket connections
                (bidirectional channels) between each device and the server, enabling instant
                communication.
              </p>
            </div>
          </div>

          <div className={styles.techCard}>
            <div className={styles.techNumber}>2</div>
            <div className={styles.techContent}>
              <h3>Event Broadcasting</h3>
              <p>
                When the host starts a question, the server broadcasts it simultaneously to all
                connected players through their WebSocket channels, ensuring synchronized delivery.
              </p>
            </div>
          </div>

          <div className={styles.techCard}>
            <div className={styles.techNumber}>3</div>
            <div className={styles.techContent}>
              <h3>Instant Data Processing</h3>
              <p>
                As players submit answers, the real-time platform processes responses immediately,
                calculates scores based on accuracy and speed, and updates the game state instantly.
              </p>
            </div>
          </div>

          <div className={styles.techCard}>
            <div className={styles.techNumber}>4</div>
            <div className={styles.techContent}>
              <h3>Live State Updates</h3>
              <p>
                Updated scores and rankings are broadcast back to all connected devices in
                real-time, ensuring everyone sees the same leaderboard simultaneously.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Real-Time Matters */}
      <section className={styles.contentSection} aria-labelledby="why-realtime">
        <h2 className={styles.sectionTitle} id="why-realtime">
          Why Real-Time Quiz Platforms Matter
        </h2>

        <div className={styles.benefitsGrid}>
          <article className={styles.benefitCard}>
            <Target size={32} weight="fill" />
            <h3>Enhanced Engagement</h3>
            <p>
              Real-time feedback and live competition create excitement and maintain participant
              attention throughout the entire quiz experience.
            </p>
          </article>

          <article className={styles.benefitCard}>
            <Users size={32} weight="fill" />
            <h3>Social Interaction</h3>
            <p>
              Seeing others compete live creates a shared experience that fosters connection,
              friendly rivalry, and memorable moments.
            </p>
          </article>

          <article className={styles.benefitCard}>
            <RocketLaunch size={32} weight="fill" />
            <h3>Immediate Learning</h3>
            <p>
              Instant feedback allows participants to understand concepts immediately, reinforcing
              correct answers and correcting mistakes in real-time.
            </p>
          </article>

          <article className={styles.benefitCard}>
            <CheckCircle size={32} weight="fill" />
            <h3>Fair Competition</h3>
            <p>
              Synchronized questions and timers ensure every participant has equal opportunity,
              making competition fair and results meaningful.
            </p>
          </article>
        </div>
      </section>

      {/* Comparison */}
      <section className={styles.contentSection} aria-labelledby="comparison">
        <h2 className={styles.sectionTitle} id="comparison">
          Real-Time vs Traditional Quiz Platforms
        </h2>

        <div className={styles.comparisonTable}>
          <div className={styles.comparisonHeader}>
            <div className={styles.comparisonCol}>Feature</div>
            <div className={styles.comparisonCol}>Real-Time Platform (Pregúntame)</div>
            <div className={styles.comparisonCol}>Traditional Platform</div>
          </div>

          <div className={styles.comparisonRow}>
            <div className={styles.comparisonCol}>
              <strong>Question Delivery</strong>
            </div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
              Synchronized to all players simultaneously
            </div>
            <div className={styles.comparisonCol}>Players see questions at different times</div>
          </div>

          <div className={styles.comparisonRow}>
            <div className={styles.comparisonCol}>
              <strong>Answer Processing</strong>
            </div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
              Instant, as answers are submitted
            </div>
            <div className={styles.comparisonCol}>Batch processed after quiz ends</div>
          </div>

          <div className={styles.comparisonRow}>
            <div className={styles.comparisonCol}>
              <strong>Scoring</strong>
            </div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
              Real-time calculation with speed bonuses
            </div>
            <div className={styles.comparisonCol}>Calculated after completion</div>
          </div>

          <div className={styles.comparisonRow}>
            <div className={styles.comparisonCol}>
              <strong>Leaderboards</strong>
            </div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
              Update live after each question
            </div>
            <div className={styles.comparisonCol}>Shown only at the end</div>
          </div>

          <div className={styles.comparisonRow}>
            <div className={styles.comparisonCol}>
              <strong>Player Interaction</strong>
            </div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
              Live, competitive, synchronized
            </div>
            <div className={styles.comparisonCol}>Asynchronous, isolated</div>
          </div>

          <div className={styles.comparisonRow}>
            <div className={styles.comparisonCol}>
              <strong>Technology</strong>
            </div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
              WebSocket (bidirectional)
            </div>
            <div className={styles.comparisonCol}>HTTP requests (one-way)</div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.contentSection} aria-labelledby="faq">
        <h2 className={styles.sectionTitle} id="faq">
          Real-Time Quiz Platform FAQ
        </h2>

        <div className={styles.faqContainer} itemScope itemType="https://schema.org/FAQPage">
          <article
            className={styles.faqItem}
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <h3 itemProp="name">What is a real-time quiz platform?</h3>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <p itemProp="text">
                A real-time quiz platform is a live, interactive quiz system where multiple
                participants answer questions simultaneously, and results update instantly. Unlike
                traditional quiz platforms where responses are collected and reviewed later,
                real-time platforms use technologies like WebSockets to synchronize gameplay across
                all devices, display live leaderboards, and provide immediate feedback as players
                answer.
              </p>
            </div>
          </article>

          <article
            className={styles.faqItem}
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <h3 itemProp="name">How does Pregúntame's real-time quiz platform work?</h3>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <p itemProp="text">
                Pregúntame uses WebSocket technology to create truly real-time quiz experiences.
                When a host starts a game, all connected players see questions simultaneously. As
                players submit answers, the system instantly calculates scores based on accuracy and
                speed, updates leaderboards in real-time, and displays results immediately after
                each question. Everything happens live with zero delay.
              </p>
            </div>
          </article>

          <article
            className={styles.faqItem}
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <h3 itemProp="name">What makes Pregúntame different from other quiz platforms?</h3>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <p itemProp="text">
                Pregúntame is built specifically for real-time interaction. Unlike platforms that
                simulate real-time features or batch process results, we use genuine WebSocket
                connections for instant synchronization. Our platform is completely free, requires
                no downloads, supports unlimited players, and provides speed-based scoring that
                rewards both accuracy and quick thinking.
              </p>
            </div>
          </article>

          <article
            className={styles.faqItem}
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <h3 itemProp="name">Is Pregúntame really a real-time platform?</h3>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <p itemProp="text">
                Yes, Pregúntame is a genuine real-time quiz platform. We use WebSocket technology
                for bidirectional communication between servers and clients, ensuring all players
                see questions at the exact same moment, scores update instantly as answers are
                submitted, and leaderboards refresh in real-time without page reloads. This creates
                a truly synchronized, live experience for all participants.
              </p>
            </div>
          </article>

          <article
            className={styles.faqItem}
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <h3 itemProp="name">Who should use a real-time quiz platform?</h3>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <p itemProp="text">
                Real-time quiz platforms like Pregúntame are ideal for educators conducting
                formative assessments, event organizers engaging audiences, corporate trainers
                measuring knowledge retention, team leaders building collaboration, and anyone who
                wants to create interactive, competitive quiz experiences where live engagement and
                instant feedback matter.
              </p>
            </div>
          </article>

          <article
            className={styles.faqItem}
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <h3 itemProp="name">
              How many people can use Pregúntame's real-time platform simultaneously?
            </h3>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <p itemProp="text">
                Pregúntame supports unlimited concurrent players in a single real-time quiz game.
                Whether you have 10 students in a classroom or 1000 attendees at a conference, our
                real-time infrastructure scales to handle simultaneous connections while maintaining
                instant synchronization and zero lag.
              </p>
            </div>
          </article>

          <article
            className={styles.faqItem}
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <h3 itemProp="name">What technology powers real-time quiz platforms?</h3>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <p itemProp="text">
                Modern real-time quiz platforms like Pregúntame use WebSocket technology, which
                maintains persistent connections between servers and clients. This allows
                bidirectional, low-latency communication essential for synchronizing quiz questions,
                collecting answers instantly, updating scores in real-time, and broadcasting
                leaderboard changes to all participants simultaneously.
              </p>
            </div>
          </article>

          <article
            className={styles.faqItem}
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <h3 itemProp="name">Do I need special software to use a real-time quiz platform?</h3>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <p itemProp="text">
                No, Pregúntame runs entirely in web browsers. Players and hosts access the real-time
                quiz platform through any modern browser on desktop, tablet, or mobile devices. No
                downloads, installations, or special software required. Just enter a game code and
                start playing in real-time.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection} aria-labelledby="cta">
        <div className={styles.ctaBox}>
          <h2 id="cta">Experience Real-Time Quizzes Today</h2>
          <p>
            Create your first real-time quiz and see instant synchronization, live scoring, and
            real-time leaderboards in action.
          </p>
          <div className={styles.ctaButtons}>
            <button onClick={() => router.push("/create")} className={styles.primaryButton}>
              <RocketLaunch size={20} weight="fill" />
              Create Free Quiz
            </button>
            <button onClick={() => router.push("/join-room")} className={styles.secondaryButton}>
              <GameController size={20} weight="fill" />
              Join Live Game
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.poweredBy}>Designed & Powered by WebGallery</p>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} Pregúntame. All rights reserved.
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
