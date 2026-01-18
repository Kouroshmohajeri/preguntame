"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "@phosphor-icons/react";
import {
  Lightning,
  CheckCircle,
  Users,
  GameController,
  RocketLaunch,
  Sparkle,
  Clock,
  DeviceMobile,
  ChartBar,
  ShieldCheck,
  Play,
  PlusCircle,
  GraduationCap,
  Briefcase,
  Microphone,
  UsersThree,
} from "@phosphor-icons/react";
import styles from "./FreeLiveQuizGenerator.module.css";

export default function FreeLiveQuizGenerator() {
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
          <span className={styles.breadcrumbCurrent}>Free Live Quiz Generator</span>
        </nav>

        <div className={styles.heroIcon}>
          <Lightning size={64} weight="fill" />
        </div>

        <h1 className={styles.mainTitle}>Free Live Quiz Generator</h1>

        <div className={styles.introText}>
          <p>
            Pregúntame is a <strong>free live quiz generator</strong> that lets you create{" "}
            <strong>real-time multiplayer quizzes</strong> with instant scoring. No signup required
            for players – just create, share, and play.
          </p>
        </div>

        <button onClick={() => router.push("/create")} className={styles.heroCta}>
          <RocketLaunch size={24} weight="fill" />
          Create a Quiz Now
        </button>

        <div className={styles.pixelSeparator} aria-hidden="true">
          {[...Array(15)].map((_, i) => (
            <div key={i} className={styles.pixel} style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.contentSection} aria-labelledby="how-it-works">
        <h2 className={styles.sectionTitle} id="how-it-works">
          How It Works
        </h2>

        <div className={styles.stepsContainer}>
          <article className={styles.stepCard}>
            <div className={styles.stepNumber}>1</div>
            <PlusCircle size={48} weight="fill" className={styles.stepIcon} />
            <h3>Create Your Quiz</h3>
            <p>Add your questions and answers using our intuitive quiz builder</p>
          </article>

          <div className={styles.stepArrow}>→</div>

          <article className={styles.stepCard}>
            <div className={styles.stepNumber}>2</div>
            <GameController size={48} weight="fill" className={styles.stepIcon} />
            <h3>Share the Game Code</h3>
            <p>Get your unique game code and share it with participants</p>
          </article>

          <div className={styles.stepArrow}>→</div>

          <article className={styles.stepCard}>
            <div className={styles.stepNumber}>3</div>
            <Play size={48} weight="fill" className={styles.stepIcon} />
            <h3>Start Playing</h3>
            <p>Launch the quiz and watch real-time results with live leaderboards</p>
          </article>
        </div>
      </section>

      {/* Features */}
      <section className={styles.contentSection} aria-labelledby="features">
        <h2 className={styles.sectionTitle} id="features">
          Why Choose Our Free Live Quiz Generator?
        </h2>

        <div className={styles.featuresGrid}>
          <article className={styles.featureCard}>
            <Lightning size={40} weight="fill" />
            <h3>Real-Time Multiplayer</h3>
            <p>
              Powered by WebSocket technology for instant synchronization. All players see questions
              and results at the same time.
            </p>
          </article>

          <article className={styles.featureCard}>
            <Users size={40} weight="fill" />
            <h3>Unlimited Players</h3>
            <p>
              No limits on participants. Whether you have 5 students or 5000 conference attendees,
              everyone can join.
            </p>
          </article>

          <article className={styles.featureCard}>
            <ShieldCheck size={40} weight="fill" />
            <h3>No Signup for Players</h3>
            <p>
              Participants join instantly with a game code. No accounts or downloads required – just
              click and play.
            </p>
          </article>

          <article className={styles.featureCard}>
            <Clock size={40} weight="fill" />
            <h3>Instant Scoring</h3>
            <p>
              Speed-based scoring system rewards fast, accurate answers. Real-time leaderboards keep
              everyone engaged.
            </p>
          </article>

          <article className={styles.featureCard}>
            <DeviceMobile size={40} weight="fill" />
            <h3>Mobile Responsive</h3>
            <p>
              Works perfectly on any device – phones, tablets, laptops. Players use their own
              devices to join.
            </p>
          </article>

          <article className={styles.featureCard}>
            <ChartBar size={40} weight="fill" />
            <h3>Detailed Analytics</h3>
            <p>
              Track performance with detailed reports. See which questions were hardest and how
              players performed.
            </p>
          </article>

          <article className={styles.featureCard}>
            <Sparkle size={40} weight="fill" />
            <h3>Completely Free</h3>
            <p>
              All features available at no cost during our launch. No credit card required. Start
              creating unlimited quizzes today.
            </p>
          </article>

          <article className={styles.featureCard}>
            <GameController size={40} weight="fill" />
            <h3>Easy to Use</h3>
            <p>
              Intuitive interface makes quiz creation simple. Add questions, set timers, and launch
              in minutes.
            </p>
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
            <GraduationCap size={40} weight="fill" />
            <h3>Educators</h3>
            <p>
              Create engaging classroom assessments, review games, and formative quizzes that keep
              students excited about learning.
            </p>
          </article>

          <article className={styles.useCaseCard}>
            <Briefcase size={40} weight="fill" />
            <h3>Corporate Training</h3>
            <p>
              Make training sessions interactive with live quizzes. Test knowledge retention and
              keep employees engaged.
            </p>
          </article>

          <article className={styles.useCaseCard}>
            <Microphone size={40} weight="fill" />
            <h3>Event Organizers</h3>
            <p>
              Engage conference attendees, workshop participants, and audiences of any size with
              live interactive quizzes.
            </p>
          </article>

          <article className={styles.useCaseCard}>
            <UsersThree size={40} weight="fill" />
            <h3>Team Building</h3>
            <p>
              Run fun trivia games for team bonding. Great for remote teams, office parties, and
              social events.
            </p>
          </article>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection} aria-labelledby="cta">
        <div className={styles.ctaBox}>
          <Lightning size={64} weight="fill" className={styles.ctaIcon} />
          <h2 id="cta">Create Your First Live Quiz Now</h2>
          <p>
            Start creating engaging real-time quizzes in minutes. Completely free – no credit card
            required.
          </p>
          <button onClick={() => router.push("/create")} className={styles.primaryButton}>
            <RocketLaunch size={20} weight="fill" />
            Create Free Quiz
          </button>
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
