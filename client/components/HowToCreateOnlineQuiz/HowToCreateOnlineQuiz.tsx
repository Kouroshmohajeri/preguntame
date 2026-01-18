"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "@phosphor-icons/react";
import {
  Lightning,
  CheckCircle,
  MagnifyingGlass,
  Lightbulb,
  PencilSimple,
  Clock,
  Gear,
  TestTube,
  ShareNetwork,
  RocketLaunch,
  Question,
  Users,
  ChartBar,
  DeviceMobile,
  Sparkle,
  Info,
} from "@phosphor-icons/react";
import styles from "./HowToCreateOnlineQuiz.module.css";

export default function HowToCreateOnlineQuiz() {
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
          <span className={styles.breadcrumbCurrent}>How to Create an Online Quiz</span>
        </nav>

        <div className={styles.heroIcon}>
          <Question size={64} weight="fill" />
        </div>

        <h1 className={styles.mainTitle}>How to Create an Online Quiz</h1>

        <div className={styles.introText}>
          <p>
            Creating an online quiz is easier than you think. Whether you're an educator preparing
            classroom assessments, a corporate trainer testing knowledge retention, or an event
            organizer engaging audiences, this guide will walk you through the complete process of
            building interactive online quizzes.
          </p>
          <p className={styles.toolIntro}>
            One way to create an online quiz is by using{" "}
            <strong>
              <a href="/" className={styles.brandLink}>
                Pregúntame
              </a>
            </strong>
            , a free real-time quiz platform that offers unlimited quizzes, unlimited players, and
            instant scoring with no signup required for participants.
          </p>
        </div>

        <div className={styles.pixelSeparator} aria-hidden="true">
          {[...Array(15)].map((_, i) => (
            <div key={i} className={styles.pixel} style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>
      </section>

      {/* Quick Overview */}
      <section className={styles.contentSection} aria-labelledby="overview">
        <div className={styles.overviewBox}>
          <Info size={32} weight="fill" />
          <div>
            <h2 id="overview">Quick Overview</h2>
            <p>
              <strong>Time needed:</strong> 10-30 minutes • <strong>Cost:</strong> Free with
              platforms like Preguntame • <strong>Difficulty:</strong> Beginner-friendly
            </p>
          </div>
        </div>
      </section>

      {/* Step-by-Step Guide */}
      <section className={styles.contentSection} aria-labelledby="steps">
        <h2 className={styles.sectionTitle} id="steps">
          Step-by-Step Guide to Creating an Online Quiz
        </h2>

        <div className={styles.stepsContainer}>
          <article className={styles.stepCard} id="step-1">
            <div className={styles.stepHeader}>
              <div className={styles.stepNumber}>1</div>
              <MagnifyingGlass size={48} weight="fill" className={styles.stepIcon} />
            </div>
            <h3>Choose Your Quiz Platform</h3>
            <p>
              The first step is selecting the right platform for creating your online quiz. Look for
              these essential features:
            </p>
            <ul>
              <li>
                <CheckCircle size={16} weight="fill" /> Real-time multiplayer support
              </li>
              <li>
                <CheckCircle size={16} weight="fill" /> Mobile responsiveness
              </li>
              <li>
                <CheckCircle size={16} weight="fill" /> Easy quiz builder interface
              </li>
              <li>
                <CheckCircle size={16} weight="fill" /> Analytics and reporting
              </li>
              <li>
                <CheckCircle size={16} weight="fill" /> No signup required for participants
              </li>
            </ul>
            <p className={styles.toolMention}>
              <strong>Recommended tool:</strong> Preguntame offers all these features for free,
              making it ideal for educators, trainers, and event organizers.{" "}
              <a href="/create" className={styles.inlineLink}>
                Try it here →
              </a>
            </p>
          </article>

          <article className={styles.stepCard} id="step-2">
            <div className={styles.stepHeader}>
              <div className={styles.stepNumber}>2</div>
              <Lightbulb size={48} weight="fill" className={styles.stepIcon} />
            </div>
            <h3>Plan Your Quiz Content</h3>
            <p>Before writing questions, plan your quiz strategy:</p>
            <ul>
              <li>
                <strong>Define your objective:</strong> What should participants learn or
                demonstrate?
              </li>
              <li>
                <strong>Know your audience:</strong> Adjust difficulty to match their knowledge
                level
              </li>
              <li>
                <strong>Choose quiz length:</strong> 5-10 questions for quick quizzes, 15-30 for
                comprehensive tests
              </li>
              <li>
                <strong>Select question types:</strong> Multiple choice is most common for online
                quizzes
              </li>
              <li>
                <strong>Set learning goals:</strong> Align questions with specific objectives
              </li>
            </ul>
          </article>

          <article className={styles.stepCard} id="step-3">
            <div className={styles.stepHeader}>
              <div className={styles.stepNumber}>3</div>
              <PencilSimple size={48} weight="fill" className={styles.stepIcon} />
            </div>
            <h3>Write Your Questions</h3>
            <p>Craft clear, engaging questions that test knowledge effectively:</p>
            <div className={styles.tipsBox}>
              <strong>Best Practices:</strong>
              <ul>
                <li>Use clear, concise language without ambiguity</li>
                <li>Write one correct answer and 3 plausible wrong answers</li>
                <li>Avoid "all of the above" or "none of the above" options</li>
                <li>Keep questions focused on a single concept</li>
                <li>Vary difficulty levels to maintain engagement</li>
                <li>Use specific, factual information rather than opinions</li>
              </ul>
            </div>
            <p className={styles.example}>
              <strong>Example good question:</strong>
              <br />
              "What is the capital of France?"
              <br />
              A) London • B) Berlin • C) Paris ✓ • D) Madrid
            </p>
          </article>

          <article className={styles.stepCard} id="step-4">
            <div className={styles.stepHeader}>
              <div className={styles.stepNumber}>4</div>
              <Clock size={48} weight="fill" className={styles.stepIcon} />
            </div>
            <h3>Set Time Limits</h3>
            <p>
              Adding time limits creates urgency and prevents cheating. Here's how to choose
              appropriate timing:
            </p>
            <ul>
              <li>
                <strong>Easy questions:</strong> 10-20 seconds
              </li>
              <li>
                <strong>Medium questions:</strong> 20-30 seconds
              </li>
              <li>
                <strong>Complex questions:</strong> 30-60 seconds
              </li>
              <li>
                <strong>Reading-heavy questions:</strong> 45-90 seconds
              </li>
            </ul>
            <p>
              Speed-based scoring rewards both accuracy and quick thinking, making quizzes more
              competitive and engaging.
            </p>
          </article>

          <article className={styles.stepCard} id="step-5">
            <div className={styles.stepHeader}>
              <div className={styles.stepNumber}>5</div>
              <Gear size={48} weight="fill" className={styles.stepIcon} />
            </div>
            <h3>Configure Quiz Settings</h3>
            <p>Customize your quiz experience with these settings:</p>
            <ul>
              <li>
                <strong>Scoring system:</strong> Points per question, speed bonuses, penalties for
                wrong answers
              </li>
              <li>
                <strong>Feedback options:</strong> Show correct answers immediately or at the end
              </li>
              <li>
                <strong>Leaderboard display:</strong> Real-time rankings to boost competition
              </li>
              <li>
                <strong>Question randomization:</strong> Prevent cheating in group settings
              </li>
              <li>
                <strong>Retry options:</strong> Allow or restrict multiple attempts
              </li>
            </ul>
          </article>

          <article className={styles.stepCard} id="step-6">
            <div className={styles.stepHeader}>
              <div className={styles.stepNumber}>6</div>
              <TestTube size={48} weight="fill" className={styles.stepIcon} />
            </div>
            <h3>Test Your Quiz</h3>
            <p>Before launching to participants, thoroughly test your quiz:</p>
            <ul>
              <li>
                <CheckCircle size={16} weight="fill" /> Preview all questions for typos and clarity
              </li>
              <li>
                <CheckCircle size={16} weight="fill" /> Verify correct answers are marked properly
              </li>
              <li>
                <CheckCircle size={16} weight="fill" /> Test on mobile devices for responsiveness
              </li>
              <li>
                <CheckCircle size={16} weight="fill" /> Check timer functionality
              </li>
              <li>
                <CheckCircle size={16} weight="fill" /> Confirm scoring calculates correctly
              </li>
              <li>
                <CheckCircle size={16} weight="fill" /> Review leaderboard display
              </li>
            </ul>
          </article>

          <article className={styles.stepCard} id="step-7">
            <div className={styles.stepHeader}>
              <div className={styles.stepNumber}>7</div>
              <ShareNetwork size={48} weight="fill" className={styles.stepIcon} />
            </div>
            <h3>Share and Launch</h3>
            <p>You're ready to launch! Here's how to share your quiz:</p>
            <ul>
              <li>
                <strong>Generate a game code:</strong> Participants enter this code to join
              </li>
              <li>
                <strong>Share the link:</strong> Send direct URL via email, messaging, or LMS
              </li>
              <li>
                <strong>Display QR code:</strong> Perfect for in-person events
              </li>
              <li>
                <strong>Embed on website:</strong> Integrate directly into your site
              </li>
            </ul>
            <p>
              With platforms like Preguntame, participants need no account—they simply enter the
              code and start playing instantly.
            </p>
          </article>
        </div>
      </section>

      {/* Why Use Preguntame */}
      <section className={styles.contentSection} aria-labelledby="why-preguntame">
        <h2 className={styles.sectionTitle} id="why-preguntame">
          Why Create Your Quiz with Preguntame?
        </h2>

        <div className={styles.featuresGrid}>
          <article className={styles.featureCard}>
            <Lightning size={40} weight="fill" />
            <h3>Real-Time Synchronization</h3>
            <p>
              WebSocket technology ensures all players see questions and results simultaneously with
              zero lag.
            </p>
          </article>

          <article className={styles.featureCard}>
            <Users size={40} weight="fill" />
            <h3>Unlimited Participants</h3>
            <p>
              No player limits. Host quizzes for 5 students or 5000 conference attendees—everyone
              can join.
            </p>
          </article>

          <article className={styles.featureCard}>
            <Sparkle size={40} weight="fill" />
            <h3>Completely Free</h3>
            <p>
              All features available at no cost. Create unlimited quizzes with full functionality
              during our launch.
            </p>
          </article>

          <article className={styles.featureCard}>
            <ChartBar size={40} weight="fill" />
            <h3>Detailed Analytics</h3>
            <p>
              Track performance with comprehensive reports. See which questions were hardest and how
              players performed.
            </p>
          </article>

          <article className={styles.featureCard}>
            <DeviceMobile size={40} weight="fill" />
            <h3>Mobile Optimized</h3>
            <p>
              Perfect experience on any device. Players use their phones, tablets, or laptops to
              participate.
            </p>
          </article>

          <article className={styles.featureCard}>
            <RocketLaunch size={40} weight="fill" />
            <h3>Quick Setup</h3>
            <p>
              Create and launch a quiz in under 10 minutes. Intuitive interface requires no
              technical knowledge.
            </p>
          </article>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.contentSection} aria-labelledby="faq">
        <h2 className={styles.sectionTitle} id="faq">
          Frequently Asked Questions
        </h2>

        <div className={styles.faqContainer}>
          <article className={styles.faqItem}>
            <h3>What is the best way to create an online quiz?</h3>
            <p>
              The best way to create an online quiz is using a dedicated quiz platform like
              Preguntame. Follow these steps: choose a platform, plan your content, write clear
              questions, set time limits, configure settings, test thoroughly, and share with
              participants. Using a specialized tool ensures professional features like real-time
              scoring, mobile compatibility, and analytics.
            </p>
          </article>

          <article className={styles.faqItem}>
            <h3>How long does it take to create an online quiz?</h3>
            <p>
              Creating a basic online quiz takes 10-30 minutes depending on the number of questions
              and complexity. With platforms like Preguntame, you can create a 10-question quiz in
              under 15 minutes using the intuitive quiz builder. More complex quizzes with custom
              settings may take 30-60 minutes.
            </p>
          </article>

          <article className={styles.faqItem}>
            <h3>Can I create an online quiz for free?</h3>
            <p>
              Yes, you can create online quizzes for free using platforms like Preguntame. Many quiz
              creators offer free plans with unlimited quizzes and participants, making it
              accessible for educators, trainers, and organizers. Preguntame currently provides all
              features at no cost, including real-time multiplayer, analytics, and unlimited
              players.
            </p>
          </article>

          <article className={styles.faqItem}>
            <h3>What makes a good online quiz?</h3>
            <p>
              A good online quiz has clear questions, appropriate difficulty, reasonable time
              limits, engaging content, immediate feedback, and mobile compatibility. Interactive
              features like leaderboards and real-time scoring enhance engagement. Questions should
              be unambiguous with one clearly correct answer and plausible distractors.
            </p>
          </article>

          <article className={styles.faqItem}>
            <h3>How many questions should an online quiz have?</h3>
            <p>
              For quick assessments or warm-ups, 5-10 questions work well. For comprehensive tests
              or longer sessions, 15-30 questions are appropriate. Consider your audience's
              attention span and the quiz's purpose. Shorter quizzes (5-10 questions) maintain high
              engagement, while longer quizzes provide more thorough assessment.
            </p>
          </article>

          <article className={styles.faqItem}>
            <h3>Do participants need to create accounts to take my quiz?</h3>
            <p>
              With platforms like Preguntame, participants don't need accounts. They simply enter a
              game code and start playing immediately. This removes friction and allows anyone to
              join quickly, making it perfect for classrooms, events, and large audiences where
              requiring signup would be impractical.
            </p>
          </article>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection} aria-labelledby="cta">
        <div className={styles.ctaBox}>
          <RocketLaunch size={64} weight="fill" className={styles.ctaIcon} />
          <h2 id="cta">Ready to Create Your First Online Quiz?</h2>
          <p>
            Start building engaging quizzes in minutes with Preguntame. Free, unlimited, and easy to
            use.
          </p>
          <button onClick={() => router.push("/create")} className={styles.primaryButton}>
            <Lightning size={20} weight="fill" />
            Create Your Quiz Now
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
