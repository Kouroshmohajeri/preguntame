"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "@phosphor-icons/react";
import {
  Lightning,
  CheckCircle,
  PlusCircle,
  PencilSimple,
  Clock,
  FloppyDisk,
  Play,
  GameController,
  Users,
  ChartBar,
  Gear,
  Info,
  RocketLaunch,
  ArrowRight,
  Copy,
  ShareNetwork,
} from "@phosphor-icons/react";
import styles from "./HowToCreatePreguntameQuiz.module.css";

export default function HowToCreatePreguntameQuiz() {
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
          <span className={styles.breadcrumbCurrent}>How to Create a Pregúntame Quiz</span>
        </nav>

        <div className={styles.heroIcon}>
          <Lightning size={64} weight="fill" />
        </div>

        <h1 className={styles.mainTitle}>How to Create a Pregúntame Quiz</h1>

        <div className={styles.introText}>
          <p>
            Creating a quiz on Pregúntame takes just 5 minutes. This tutorial walks you through
            every step, from adding your first question to launching a live game with your
            participants.
          </p>
        </div>

        <button onClick={() => router.push("/create")} className={styles.heroCta}>
          <RocketLaunch size={24} weight="fill" />
          Start Creating Now
        </button>

        <div className={styles.pixelSeparator} aria-hidden="true">
          {[...Array(15)].map((_, i) => (
            <div key={i} className={styles.pixel} style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>
      </section>

      {/* Quick Overview */}
      <section className={styles.contentSection}>
        <div className={styles.overviewBox}>
          <Info size={32} weight="fill" />
          <div>
            <h2>What You'll Learn</h2>
            <p>
              <strong>Time:</strong> 5 minutes • <strong>Difficulty:</strong> Beginner •{" "}
              <strong>Requirements:</strong> None (no account needed to get started)
            </p>
          </div>
        </div>
      </section>

      {/* Step-by-Step Guide */}
      <section className={styles.contentSection}>
        <h2 className={styles.sectionTitle}>Step-by-Step Tutorial</h2>

        <div className={styles.stepsContainer}>
          {/* Step 1 */}
          <article className={styles.stepCard}>
            <div className={styles.stepHeader}>
              <div className={styles.stepNumber}>1</div>
              <GameController size={48} weight="fill" className={styles.stepIcon} />
            </div>
            <h3>Access the Quiz Creator</h3>
            <p>Start by navigating to the quiz creation page:</p>
            <ul>
              <li>
                <CheckCircle size={16} weight="fill" />
                Go to <strong>preguntame.eu</strong> and click <strong>"Create Game"</strong> in the
                navigation menu
              </li>
              <li>
                <CheckCircle size={16} weight="fill" />
                Or visit <a href="https://preguntame.eu/create">/create</a> directly
              </li>
              <li>
                <CheckCircle size={16} weight="fill" />
                No login required to start creating immediately, and see how it works!
              </li>
            </ul>
            <div className={styles.tipBox}>
              <strong>💡 Tip:</strong> You need to login to save the game in your account and
              publish it.
            </div>
          </article>

          {/* Step 2 */}
          <article className={styles.stepCard}>
            <div className={styles.stepHeader}>
              <div className={styles.stepNumber}>2</div>
              <PencilSimple size={48} weight="fill" className={styles.stepIcon} />
            </div>
            <h3>Name Your Quiz</h3>
            <p>Give your quiz a clear, descriptive title:</p>
            <div className={styles.exampleBox}>
              <strong>Good examples:</strong>
              <ul>
                <li>"World History Quiz"</li>
                <li>"JavaScript Fundamentals Test"</li>
                <li>"Company Culture Trivia"</li>
                <li>"Biology Chapter 5 Review"</li>
              </ul>
            </div>
            <p>
              A clear title helps players know what to expect and makes it easier to find your quiz
              later.
            </p>
          </article>

          {/* Step 3 */}
          <article className={styles.stepCard}>
            <div className={styles.stepHeader}>
              <div className={styles.stepNumber}>3</div>
              <PlusCircle size={48} weight="fill" className={styles.stepIcon} />
            </div>
            <h3>Add Your First Question</h3>
            <p>You will see a field with "Type your question?":</p>
            <ul>
              <li>
                <strong>Question text:</strong> Write your actual question
              </li>
              <li>
                <strong>Answer options:</strong> Up to four possible answers (A, B, C, D)
              </li>
              <li>
                <strong>Correct answer:</strong> Mark which answer is correct
              </li>
            </ul>
            <div className={styles.exampleBox}>
              <strong>Example:</strong>
              <p style={{ marginTop: "10px" }}>
                <strong>Question:</strong> What is the capital of France?
                <br />
                <strong>A)</strong> London
                <br />
                <strong>B)</strong> Berlin
                <br />
                <strong>C)</strong> Paris ✓
                <br />
                <strong>D)</strong> Madrid
              </p>
            </div>
          </article>

          {/* Step 4 */}
          <article className={styles.stepCard}>
            <div className={styles.stepHeader}>
              <div className={styles.stepNumber}>4</div>
              <Clock size={48} weight="fill" className={styles.stepIcon} />
            </div>
            <h3>Set Time Limits</h3>
            <p>Choose how long players have to answer each question:</p>
            <ul>
              <li>
                <strong>10-15 seconds:</strong> Quick recall, fast-paced games
              </li>
              <li>
                <strong>20-30 seconds:</strong> Standard difficulty (recommended)
              </li>
              <li>
                <strong>45-60 seconds:</strong> Complex questions or reading-heavy content
              </li>
            </ul>
            <div className={styles.tipBox}>
              <strong>💡 Tip #1:</strong> Shorter times create more excitement and prevent players
              from looking up answers!
              <strong>💡 Tip #2:</strong> Pre-set times are suggestions, feel free to give any
              required time by choosing "custom" in the timer dropdown.
            </div>
          </article>

          {/* Step 5 */}
          <article className={styles.stepCard}>
            <div className={styles.stepHeader}>
              <div className={styles.stepNumber}>5</div>
              <PlusCircle size={48} weight="fill" className={styles.stepIcon} />
            </div>
            <h3>Add More Questions</h3>
            <p>Repeat step 3 to add more questions to your quiz:</p>
            <ul>
              <li>
                <CheckCircle size={16} weight="fill" />
                <strong>Minimum:</strong> We suggest 5 questions for a quick quiz!
              </li>
              <li>
                <CheckCircle size={16} weight="fill" />
                <strong>Recommended:</strong> 10-15 questions for engagement
              </li>
              <li>
                <CheckCircle size={16} weight="fill" />
                <strong>Maximum:</strong> No limit, but 30+ can be tiring
              </li>
            </ul>
          </article>

          {/* Step 6 */}
          <article className={styles.stepCard}>
            <div className={styles.stepHeader}>
              <div className={styles.stepNumber}>6</div>
              <Gear size={48} weight="fill" className={styles.stepIcon} />
            </div>
            <h3>Quiz Settings</h3>

            <ul>
              <li>
                <strong>Points per question:</strong> Default is 100 points
              </li>
              <li>
                <strong>Speed bonus:</strong> Award extra points for faster correct answers
              </li>
              <li>
                <strong>Show answers:</strong> Correct answer will be displayed on each side (Host &
                Players)
              </li>
              <li></li>
            </ul>
          </article>

          {/* Step 7 */}
          <article className={styles.stepCard}>
            <div className={styles.stepHeader}>
              <div className={styles.stepNumber}>7</div>
              <FloppyDisk size={48} weight="fill" className={styles.stepIcon} />
            </div>
            <h3>Publish Your Quiz</h3>
            <p>Once you're happy with your questions:</p>
            <ul>
              <li>
                <CheckCircle size={16} weight="fill" />
                Click the <strong>"Publish Game"</strong> button
              </li>
              <li>
                <CheckCircle size={16} weight="fill" />
                Your quiz is now ready to launch!
              </li>
              <li>
                <CheckCircle size={16} weight="fill" />
                It will be saved in your account and you can host it, share it and edit it whenever
                you want!
              </li>
            </ul>
          </article>

          {/* Step 8 */}
          <article className={styles.stepCard}>
            <div className={styles.stepHeader}>
              <div className={styles.stepNumber}>8</div>
              <Play size={48} weight="fill" className={styles.stepIcon} />
            </div>
            <h3>Launch Your Game</h3>
            <p>Start a live game session:</p>
            <ul>
              <li>
                <CheckCircle size={16} weight="fill" />
                You'll receive a unique <strong>6-digit game code</strong> and the QR code
              </li>
              <li>
                <CheckCircle size={16} weight="fill" />
                Click <strong>"Host Now"</strong>
              </li>
              <li>
                <CheckCircle size={16} weight="fill" />
                Share this code with your participants
              </li>
            </ul>
            <div className={styles.codeExample}>
              <strong>Example game code:</strong> <span className={styles.code}>ABC123</span>
            </div>
          </article>

          {/* Step 9 */}
          <article className={styles.stepCard}>
            <div className={styles.stepHeader}>
              <div className={styles.stepNumber}>9</div>
              <ShareNetwork size={48} weight="fill" className={styles.stepIcon} />
            </div>
            <h3>Share with Participants</h3>
            <p>Players can join your game in multiple ways:</p>
            <ul>
              <li>
                <strong>Game code:</strong> Players go to preguntame.eu/join-room and enter the code
              </li>
              <li>
                <strong>Direct link:</strong> Share the unique game URL , Example:
                preguntame.eu/play/guest/ABC123
              </li>
              <li>
                <strong>QR code:</strong> Display for in-person events, you can also find it in{" "}
                <a href="https://preguntame.eu/dashboard"></a>/dashboard {">"} Share
              </li>
            </ul>
            <div className={styles.tipBox}>
              <strong>💡 Remember:</strong> Players don't need accounts. They just enter their name
              and join! But if they login they can track their scores and performance over time.
            </div>
          </article>

          {/* Step 10 */}
          <article className={styles.stepCard}>
            <div className={styles.stepHeader}>
              <div className={styles.stepNumber}>10</div>
              <Users size={48} weight="fill" className={styles.stepIcon} />
            </div>
            <h3>Start Playing!</h3>
            <p>Once players have joined:</p>
            <ul>
              <li>
                <CheckCircle size={16} weight="fill" />
                See the number of all connected players in the lobby
              </li>
              <li>
                <CheckCircle size={16} weight="fill" />
                Click <strong>"Start"</strong> when ready
              </li>
              <li>
                <CheckCircle size={16} weight="fill" />
                Questions appear automatically with timers
              </li>
            </ul>
            <p>
              At the end, you'll see final rankings and can view detailed analytics about player
              performance!
            </p>
          </article>
        </div>
      </section>

      {/* Tips & Best Practices */}
      <section className={styles.contentSection}>
        <h2 className={styles.sectionTitle}>Tips & Best Practices</h2>

        <div className={styles.tipsGrid}>
          <article className={styles.tipCard}>
            <Lightning size={32} weight="fill" />
            <h3>Keep Questions Clear</h3>
            <p>
              Avoid ambiguous wording. Each question should have one clearly correct answer that
              can't be debated.
            </p>
          </article>

          <article className={styles.tipCard}>
            <ChartBar size={32} weight="fill" />
            <h3>Mix Difficulty Levels</h3>
            <p>
              Combine easy, medium, and hard questions to keep all players engaged regardless of
              skill level.
            </p>
          </article>

          <article className={styles.tipCard}>
            <GameController size={32} weight="fill" />
            <h3>Make Distractors Plausible</h3>
            <p>
              Wrong answers should seem believable. Avoid obviously incorrect options like "Purple
              elephant" for serious quizzes.
            </p>
          </article>
        </div>
      </section>

      {/* Common Issues */}
      <section className={styles.contentSection}>
        <h2 className={styles.sectionTitle}>Common Questions</h2>

        <div className={styles.faqContainer}>
          <article className={styles.faqItem}>
            <h3>Can I edit my quiz after saving it?</h3>
            <p>
              Yes! If you're logged in, go to your dashboard, find your quiz, and click "Edit." You
              can modify questions, answers, timing, and settings anytime.
            </p>
          </article>

          <article className={styles.faqItem}>
            <h3>Can I share my quiz with a friend?</h3>
            <p>
              Yes! you can clone your game with your friends if they have an account! Just go to
              your <a href="https://preguntame.eu/dashboard">dashboard</a>, find your quiz, and
              click "Share" and search for the friend you want to share.
            </p>
          </article>

          <article className={styles.faqItem}>
            <h3>Can I download the game's pdf?</h3>
            <p>
              Yes! you can download a pdf of the game withthe correct answer marked and with the
              time limit for each question. Just go to your{" "}
              <a href="https://preguntame.eu/dashboard">dashboard</a>, find your quiz, and click
              "Export".
            </p>
          </article>

          <article className={styles.faqItem}>
            <h3>How do players join without accounts?</h3>
            <p>
              Players simply go to preguntame.eu/join-room or the{" "}
              <a href="https://preguntame.eu/join-room">"Join"</a> or click the "Join a Game" box at
              preguntame.eu or by scanning the qr code, enter the game code, type their name, and
              they're in. No signup or login required.
            </p>
          </article>

          <article className={styles.faqItem}>
            <h3>Can I reuse the same quiz multiple times?</h3>
            <p>
              Absolutely! Each time you host a quiz, you get a new game code. You can run the same
              quiz with different groups as many times as you want.
            </p>
          </article>

          <article className={styles.faqItem}>
            <h3>Is there a limit on number of players?</h3>
            <p>
              No. Pregúntame supports unlimited players in a single game, whether you have 5
              students or 500 conference attendees.
            </p>
          </article>

          <article className={styles.faqItem}>
            <h3>Can I see who got each question right?</h3>
            <p>
              Yes! After the game ends, you can view detailed analytics showing which players
              answered each question correctly, their response times, and overall performance.
            </p>
          </article>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBox}>
          <RocketLaunch size={64} weight="fill" className={styles.ctaIcon} />
          <h2>Ready to Create Your First Quiz?</h2>
          <p>
            Start building your interactive quiz now. It takes less than 5 minutes from start to
            launch!
          </p>
          <button onClick={() => router.push("/create")} className={styles.primaryButton}>
            <Lightning size={20} weight="fill" />
            Create Quiz Now
          </button>
          <p className={styles.ctaSubtext}>
            Need help? <a href="/support">Contact Support</a> or{" "}
            <a href="/what-is-preguntame">Learn More About Pregúntame</a>
          </p>
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
