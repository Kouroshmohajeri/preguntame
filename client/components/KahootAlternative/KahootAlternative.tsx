"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "@phosphor-icons/react";
import {
  Lightning,
  CheckCircle,
  XCircle,
  Trophy,
  Users,
  Infinity,
  Coins,
  GameController,
  ChartBar,
  Target,
  RocketLaunch,
  Sparkle,
  ShieldCheck,
  Clock,
} from "@phosphor-icons/react";
import styles from "./KahootAlternative.module.css";

export default function KahootAlternative() {
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
          <span className={styles.breadcrumbCurrent}>Kahoot Alternative</span>
        </nav>

        <div className={styles.heroIcon}>
          <Sparkle size={64} weight="fill" />
        </div>

        <h1 className={styles.mainTitle}>Free Kahoot Alternative</h1>

        <div className={styles.introText}>
          <p>
            Looking for a <strong>Kahoot alternative</strong>? Pregúntame is a{" "}
            <strong>free real-time quiz platform</strong> with unlimited quizzes and unlimited
            players. We offer the same live multiplayer quiz experience as Kahoot, but currently at
            no cost. Create interactive quizzes, engage your audience, and see real-time results -
            all available free during our launch period.
          </p>
        </div>

        <div className={styles.pixelSeparator} aria-hidden="true">
          {[...Array(15)].map((_, i) => (
            <div key={i} className={styles.pixel} style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>
      </section>

      {/* Quick Comparison Highlight */}
      <section className={styles.quickCompareSection}>
        <div className={styles.compareCard}>
          <div className={styles.compareCardHeader}>
            <Coins size={32} weight="fill" />
            <h3>Kahoot</h3>
          </div>
          <div className={styles.compareCardContent}>
            <p className={styles.comparePrice}>$0 - $120/month</p>
            <p className={styles.compareNote}>Free tier has limitations</p>
            <ul className={styles.compareList}>
              <li>
                <XCircle size={16} weight="fill" />
                Player limits on free plan
              </li>
              <li>
                <XCircle size={16} weight="fill" />
                Limited quiz creation
              </li>
              <li>
                <XCircle size={16} weight="fill" />
                Paid plans for full features
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.compareVs}>VS</div>

        <div className={`${styles.compareCard} ${styles.compareCardHighlight}`}>
          <div className={styles.compareCardHeader}>
            <Lightning size={32} weight="fill" />
            <h3>Pregúntame</h3>
          </div>
          <div className={styles.compareCardContent}>
            <p className={styles.comparePrice}>Free Now</p>
            <p className={styles.compareNote}>All features included</p>
            <ul className={styles.compareList}>
              <li>
                <CheckCircle size={16} weight="fill" />
                Unlimited players
              </li>
              <li>
                <CheckCircle size={16} weight="fill" />
                Unlimited quizzes
              </li>
              <li>
                <CheckCircle size={16} weight="fill" />
                All features free
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Why Choose Pregúntame */}
      <section className={styles.contentSection} aria-labelledby="why-choose">
        <h2 className={styles.sectionTitle} id="why-choose">
          Why Choose Pregúntame as Your Kahoot Alternative?
        </h2>

        <div className={styles.reasonsGrid}>
          <article className={styles.reasonCard}>
            <Infinity size={40} weight="fill" />
            <h3>Currently Unlimited</h3>
            <p>
              Unlike Kahoot's free tier, Pregúntame currently offers unlimited quizzes, unlimited
              questions, and unlimited players. No artificial restrictions or upgrade prompts during
              our launch.
            </p>
          </article>

          <article className={styles.reasonCard}>
            <Coins size={40} weight="fill" />
            <h3>Free to Start</h3>
            <p>
              Currently offering all features at no cost. Create unlimited quizzes with unlimited
              players during our launch period. No credit card required to get started.
            </p>
          </article>

          <article className={styles.reasonCard}>
            <Lightning size={40} weight="fill" />
            <h3>Real-Time Technology</h3>
            <p>
              Built with modern WebSocket technology for genuine real-time synchronization. Same
              instant gameplay experience as Kahoot, with zero lag.
            </p>
          </article>

          <article className={styles.reasonCard}>
            <ShieldCheck size={40} weight="fill" />
            <h3>No Account for Players</h3>
            <p>
              Players join with a simple game code - no sign-up required. Easy access just like
              Kahoot, making participation frictionless.
            </p>
          </article>

          <article className={styles.reasonCard}>
            <ChartBar size={40} weight="fill" />
            <h3>Full Analytics Included</h3>
            <p>
              Get detailed performance reports, player statistics, and response analytics currently
              at no cost. Features that Kahoot charges for.
            </p>
          </article>

          <article className={styles.reasonCard}>
            <Target size={40} weight="fill" />
            <h3>User-Focused Design</h3>
            <p>
              Built as an accessible alternative to commercial platforms. Community-focused with
              continuous improvements based on user feedback.
            </p>
          </article>
        </div>
      </section>

      {/* Detailed Comparison Table */}
      <section className={styles.contentSection} aria-labelledby="comparison">
        <h2 className={styles.sectionTitle} id="comparison">
          Pregúntame vs Kahoot: Feature Comparison
        </h2>

        <div className={styles.comparisonTable}>
          <div className={styles.comparisonHeader}>
            <div className={styles.comparisonCol}>Feature</div>
            <div className={styles.comparisonCol}>Kahoot Free</div>
            <div className={styles.comparisonCol}>Kahoot Paid</div>
            <div className={styles.comparisonCol}>Pregúntame</div>
          </div>

          <div className={styles.comparisonRow}>
            <div className={styles.comparisonCol}>
              <strong>Price</strong>
            </div>
            <div className={styles.comparisonCol}>$0/month</div>
            <div className={styles.comparisonCol}>$3.99 - $120/month</div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
              Free Now
            </div>
          </div>

          <div className={styles.comparisonRow}>
            <div className={styles.comparisonCol}>
              <strong>Player Limit</strong>
            </div>
            <div className={styles.comparisonCol}>10-50 players</div>
            <div className={styles.comparisonCol}>Up to 2000</div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
              Unlimited
            </div>
          </div>

          <div className={styles.comparisonRow}>
            <div className={styles.comparisonCol}>
              <strong>Quiz Creation</strong>
            </div>
            <div className={styles.comparisonCol}>Limited</div>
            <div className={styles.comparisonCol}>Unlimited</div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
              Unlimited
            </div>
          </div>

          <div className={styles.comparisonRow}>
            <div className={styles.comparisonCol}>
              <strong>Real-Time Play</strong>
            </div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
            </div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
            </div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
            </div>
          </div>

          <div className={styles.comparisonRow}>
            <div className={styles.comparisonCol}>
              <strong>Live Leaderboards</strong>
            </div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
            </div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
            </div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
            </div>
          </div>

          <div className={styles.comparisonRow}>
            <div className={styles.comparisonCol}>
              <strong>Detailed Analytics</strong>
            </div>
            <div className={styles.comparisonCol}>
              <XCircle size={20} weight="fill" className={styles.xIcon} />
            </div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
            </div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
              Included
            </div>
          </div>

          <div className={styles.comparisonRow}>
            <div className={styles.comparisonCol}>
              <strong>PDF Export</strong>
            </div>
            <div className={styles.comparisonCol}>
              <XCircle size={20} weight="fill" className={styles.xIcon} />
            </div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
            </div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
              Included
            </div>
          </div>

          <div className={styles.comparisonRow}>
            <div className={styles.comparisonCol}>
              <strong>Question Bank</strong>
            </div>
            <div className={styles.comparisonCol}>Limited</div>
            <div className={styles.comparisonCol}>Full access</div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
              Full access
            </div>
          </div>

          <div className={styles.comparisonRow}>
            <div className={styles.comparisonCol}>
              <strong>Mobile Responsive</strong>
            </div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
            </div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
            </div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
            </div>
          </div>

          <div className={styles.comparisonRow}>
            <div className={styles.comparisonCol}>
              <strong>No Download Required</strong>
            </div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
            </div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
            </div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
            </div>
          </div>

          <div className={styles.comparisonRow}>
            <div className={styles.comparisonCol}>
              <strong>Speed-Based Scoring</strong>
            </div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
            </div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
            </div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
            </div>
          </div>

          <div className={styles.comparisonRow}>
            <div className={styles.comparisonCol}>
              <strong>Custom Branding</strong>
            </div>
            <div className={styles.comparisonCol}>
              <XCircle size={20} weight="fill" className={styles.xIcon} />
            </div>
            <div className={styles.comparisonCol}>Premium only</div>
            <div className={styles.comparisonCol}>
              <CheckCircle size={20} weight="fill" className={styles.checkIcon} />
              Available
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className={styles.contentSection} aria-labelledby="use-cases">
        <h2 className={styles.sectionTitle} id="use-cases">
          Perfect Kahoot Alternative For
        </h2>

        <div className={styles.useCasesGrid}>
          <article className={styles.useCaseCard}>
            <Trophy size={40} weight="fill" />
            <h3>Educators & Teachers</h3>
            <p>
              Create unlimited formative assessments, review games, and interactive lessons without
              worrying about player limits or subscription costs. Perfect for schools and
              universities.
            </p>
          </article>

          <article className={styles.useCaseCard}>
            <Users size={40} weight="fill" />
            <h3>Event Organizers</h3>
            <p>
              Engage conference attendees, workshop participants, and large audiences with live
              quizzes. No player caps means everyone can participate.
            </p>
          </article>

          <article className={styles.useCaseCard}>
            <GameController size={40} weight="fill" />
            <h3>Corporate Trainers</h3>
            <p>
              Conduct training assessments, team building activities, and knowledge checks without
              enterprise pricing. Get full analytics included.
            </p>
          </article>

          <article className={styles.useCaseCard}>
            <Clock size={40} weight="fill" />
            <h3>Occasional Users</h3>
            <p>
              Need a quiz platform for a one-time event or occasional use? No need to pay for
              monthly subscriptions. Use Pregúntame whenever you need it.
            </p>
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
            <h3 itemProp="name">What is the best Kahoot alternative?</h3>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <p itemProp="text">
                Pregúntame is one of the best Kahoot alternatives, offering a free real-time quiz
                platform with unlimited quizzes and unlimited players. Unlike Kahoot which requires
                paid plans for many features, Pregúntame currently provides all features at no cost,
                including real-time multiplayer, live leaderboards, analytics, and speed-based
                scoring.
              </p>
            </div>
          </article>

          <article
            className={styles.faqItem}
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <h3 itemProp="name">Is Pregúntame free like Kahoot?</h3>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <p itemProp="text">
                Yes, Pregúntame is currently free with all features included. Unlike Kahoot which
                has a free tier with limitations and requires paid subscriptions for full features,
                Pregúntame currently provides unlimited quizzes, unlimited players, and complete
                feature access at no cost. While we may introduce premium plans in the future, we're
                committed to maintaining a robust free tier that serves educators and users
                effectively.
              </p>
            </div>
          </article>

          <article
            className={styles.faqItem}
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <h3 itemProp="name">How is Pregúntame different from Kahoot?</h3>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <p itemProp="text">
                Pregúntame differs from Kahoot in several key ways: it's currently free with all
                features, supports unlimited players without restrictions, offers true real-time
                WebSocket synchronization, has no question limits, requires no account for players
                to join, and provides full analytics at no cost. It's built as a modern, accessible
                alternative focused on delivering value to educators and teams.
              </p>
            </div>
          </article>

          <article
            className={styles.faqItem}
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <h3 itemProp="name">Can I use Pregúntame for the same purposes as Kahoot?</h3>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <p itemProp="text">
                Yes, Pregúntame works perfectly for all the same use cases as Kahoot: classroom
                assessments, corporate training, event engagement, team building, conferences,
                workshops, and any scenario where you need live, interactive quizzes. It provides
                the same real-time multiplayer experience with competitive scoring and leaderboards.
              </p>
            </div>
          </article>

          <article
            className={styles.faqItem}
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <h3 itemProp="name">Does Pregúntame have player limits like Kahoot free plan?</h3>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <p itemProp="text">
                No, Pregúntame currently has no player limits. While Kahoot's free plan restricts
                the number of participants, Pregúntame supports unlimited concurrent players in any
                quiz game, whether you have 5 students or 5000 conference attendees. There are
                currently no restrictions on player capacity.
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
              Do I need to create an account to play on Pregúntame like Kahoot?
            </h3>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <p itemProp="text">
                No, players don't need accounts on Pregúntame. Just like Kahoot, players join games
                using a simple game code. However, hosts also have a streamlined experience - you
                can create quizzes and host games with minimal setup, making it even more accessible
                than traditional quiz platforms.
              </p>
            </div>
          </article>

          <article
            className={styles.faqItem}
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <h3 itemProp="name">What features does Pregúntame offer that Kahoot charges for?</h3>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <p itemProp="text">
                Pregúntame currently offers many features at no cost that Kahoot includes only in
                paid plans: unlimited quizzes, advanced analytics, detailed reports, PDF exports,
                and full feature access. Everything that enhances learning and engagement is
                currently available to all users without payment.
              </p>
            </div>
          </article>

          <article
            className={styles.faqItem}
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <h3 itemProp="name">Is Pregúntame as reliable as Kahoot for live events?</h3>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <p itemProp="text">
                Yes, Pregúntame uses modern WebSocket technology for true real-time synchronization,
                making it highly reliable for live events of any size. The platform handles
                concurrent players smoothly, maintains synchronized timers across all devices, and
                provides instant score updates. Many users find it performs excellently even with
                large audiences.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection} aria-labelledby="cta">
        <div className={styles.ctaBox}>
          <h2 id="cta">Try Pregúntame Free Today</h2>
          <p>
            Start creating engaging quizzes with Pregúntame. All features currently available at no
            cost. No credit card required.
          </p>
          <div className={styles.ctaButtons}>
            <button onClick={() => router.push("/create")} className={styles.primaryButton}>
              <RocketLaunch size={20} weight="fill" />
              Create Free Quiz Now
            </button>
            <button onClick={() => router.push("/join-room")} className={styles.secondaryButton}>
              <GameController size={20} weight="fill" />
              Join a Game
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
