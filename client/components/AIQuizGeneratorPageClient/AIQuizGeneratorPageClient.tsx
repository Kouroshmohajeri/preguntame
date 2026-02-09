"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkle,
  Robot,
  FileText,
  Link as LinkIcon,
  YoutubeLogo,
  Lightning,
  UsersThree,
  ChalkboardTeacher,
  Presentation,
  ChartBar,
  Question,
  ArrowRight,
  CheckCircle,
} from "@phosphor-icons/react";
import styles from "./AIQuizGeneratorPageClient.module.css";

export default function AIQuizGeneratorPageClient() {
  const router = useRouter();

  const handleRequestBeta = () => {
    router.push("/dashboard#ai-access");
  };

  const handleSeeHowItWorks = () => {
    const el = document.getElementById("how-it-works");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCreateQuizNow = () => {
    router.push("/create");
  };

  const handleCreateWithAI = () => {
    router.push("/create/wizard");
  };

  return (
    <div className={styles.mainContainer}>
      {/* HERO SECTION */}
      <section className={styles.heroSection}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>AI Quiz Generator</span>
        </div>

        {/* Icon */}
        <div className={styles.heroIcon}>
          <Robot size={64} weight="fill" />
        </div>

        {/* Badge */}
        <div className={styles.betaBadge}>
          <Lightning size={16} weight="fill" />
          AI QUIZ GENERATOR · BETA
        </div>

        {/* H1 */}
        <h1 className={styles.mainTitle}>
          AI Quiz Generator for Classrooms, Training &amp; Events
        </h1>

        {/* Subtext */}
        <p className={styles.heroSubtext}>
          Pregúntame Wizard uses AI to turn your ideas, documents, websites, or videos into
          ready-to-play interactive quizzes in seconds.
        </p>

        {/* CTA buttons */}
        <div className={styles.heroCtas}>
          <button className={styles.primaryCta} onClick={handleRequestBeta}>
            <Sparkle size={20} weight="fill" />
            <span>Request Beta Access</span>
            <ArrowRight size={20} weight="bold" />
          </button>
          <button className={styles.secondaryCta} onClick={handleSeeHowItWorks}>
            See How It Works
          </button>
        </div>

        {/* Small note */}
        <p className={styles.heroNote}>
          Built into Pregúntame, the free real-time quiz platform for live multiplayer games.
        </p>
      </section>

      {/* Pixel separator */}
      <div className={styles.pixelSeparator}>
        {[...Array(12)].map((_, i) => (
          <div key={i} className={styles.pixel} style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>

      {/* WHAT IS PREGÚNTAME WIZARD */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>What is Pregúntame Wizard?</h2>
        <div className={styles.twoColumn}>
          <div className={styles.textBlock}>
            <p>
              Pregúntame Wizard is an <strong>AI-powered quiz generator</strong> that creates
              questions and answers from your existing content — without starting from a blank page.
            </p>
            <p>
              It lives inside the <strong>Pregúntame real-time quiz platform</strong>, so the AI
              content you generate is instantly playable as a live multiplayer quiz with game codes,
              leaderboards, and real-time scoring.
            </p>
          </div>
          <div className={styles.textBlock}>
            <p>
              The tool is designed for <strong>teachers, trainers, students, HR teams,</strong> and{" "}
              <strong>event hosts</strong> who need reliable quizzes quickly, without spending hours
              writing questions by hand.
            </p>
            <p>
              During the <strong>beta phase</strong>, approved users receive free{" "}
              <strong>AI credits</strong> so they can test the full experience and help shape how
              the Wizard evolves.
            </p>
          </div>
        </div>
      </section>

      {/* Pixel separator */}
      <div className={styles.pixelSeparator}>
        {[...Array(10)].map((_, i) => (
          <div key={i} className={styles.pixel} style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>

      {/* WHAT CAN THE AI GENERATE FROM */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Generate Quizzes from Almost Anything</h2>
        <p className={styles.sectionIntro}>
          Use Pregúntame Wizard to build quizzes from the content you already have — AI does the
          heavy lifting and you stay in control of the final questions.
        </p>

        <div className={styles.sourcesGrid}>
          {/* Prompt */}
          <div className={styles.sourceCard}>
            <div className={styles.sourceIcon}>
              <Sparkle size={32} weight="fill" />
            </div>
            <h3 className={styles.sourceTitle}>From a Prompt</h3>
            <p className={styles.sourceText}>
              Type something like <em>“Create a quiz about the solar system for 5th grade”</em> and
              get a full set of questions in seconds.
            </p>
          </div>

          {/* Documents */}
          <div className={styles.sourceCard}>
            <div className={styles.sourceIcon}>
              <FileText size={32} weight="fill" />
            </div>
            <h3 className={styles.sourceTitle}>From Documents</h3>
            <p className={styles.sourceText}>
              Upload notes, PDFs, lesson plans, or training manuals. The AI extracts key concepts
              and turns them into quiz questions.
            </p>
          </div>

          {/* Website link */}
          <div className={styles.sourceCard}>
            <div className={styles.sourceIcon}>
              <LinkIcon size={32} weight="fill" />
            </div>
            <h3 className={styles.sourceTitle}>From a Website Link</h3>
            <p className={styles.sourceText}>
              Paste a URL and generate questions directly from the page content — ideal for
              articles, documentation, or blog posts.
            </p>
          </div>

          {/* YouTube video */}
          <div className={styles.sourceCard}>
            <div className={styles.sourceIcon}>
              <YoutubeLogo size={32} weight="fill" />
            </div>
            <h3 className={styles.sourceTitle}>From a YouTube Video</h3>
            <p className={styles.sourceText}>
              Turn educational videos into quizzes. The AI uses the transcript and key ideas to
              build questions that test real understanding.
            </p>
          </div>
        </div>
      </section>

      {/* Pixel separator */}
      <div className={styles.pixelSeparator}>
        {[...Array(10)].map((_, i) => (
          <div key={i} className={styles.pixel} style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className={styles.section}>
        <h2 className={styles.sectionTitle}>How the AI Quiz Generator Works</h2>
        <ol className={styles.stepsList}>
          <li>
            <strong>Enter a prompt, file, or link.</strong> Start with text, a document, a website,
            or a YouTube video.
          </li>
          <li>
            <strong>AI analyzes the content.</strong> The Wizard identifies key topics, facts, and
            concepts.
          </li>
          <li>
            <strong>Quiz is generated instantly.</strong> You get a set of questions and answer
            options tailored to your input.
          </li>
          <li>
            <strong>Edit if needed.</strong> Review, edit, and reorder questions to match your style
            and difficulty.
          </li>
          <li>
            <strong>Host live in real time.</strong> Launch your quiz in Pregúntame with game codes,
            leaderboards, and live scoring.
          </li>
        </ol>
      </section>

      {/* Pixel separator */}
      <div className={styles.pixelSeparator}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className={styles.pixel} style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>

      {/* WHY IT’S DIFFERENT */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Why Pregúntame’s AI Quiz Generator is Different</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <UsersThree size={28} weight="fill" />
            </div>
            <h3>Built for Live Multiplayer Quizzes</h3>
            <p>
              Wizard is not just a question generator. It feeds directly into a platform built for
              live, real-time quiz games with players joining via code.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Question size={28} weight="fill" />
            </div>
            <h3>Questions Optimized for Engagement</h3>
            <p>
              AI focuses on clarity, variety, and difficulty balance so your quizzes feel fair,
              engaging, and challenging without being confusing.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <ChartBar size={28} weight="fill" />
            </div>
            <h3>Works with Scores &amp; Leaderboards</h3>
            <p>
              Every AI-generated question integrates with Pregúntame’s scoring, timing, and
              leaderboard system — no manual setup or formatting.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <CheckCircle size={28} weight="fill" />
            </div>
            <h3>No Manual Formatting Needed</h3>
            <p>
              You do not need to copy-paste into slides or adjust layouts. The quiz is ready to host
              as soon as you click publish.
            </p>
          </div>
        </div>

        <p className={styles.sectionIntro}>
          Everything is designed for <strong>classrooms, training rooms, and live events</strong> —
          not just static tests.
        </p>
      </section>

      {/* Pixel separator */}
      <div className={styles.pixelSeparator}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className={styles.pixel} style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>

      {/* USE CASES */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Perfect For</h2>
        <div className={styles.useCasesGrid}>
          <div className={styles.useCaseCard}>
            <div className={styles.useCaseIcon}>
              <ChalkboardTeacher size={32} weight="fill" />
            </div>
            <h3>Teachers</h3>
            <p>
              Create quick checks, exit tickets, and review quizzes from your lesson notes or
              textbooks in minutes.
            </p>
          </div>

          <div className={styles.useCaseCard}>
            <div className={styles.useCaseIcon}>
              <Presentation size={32} weight="fill" />
            </div>
            <h3>Trainers</h3>
            <p>
              Turn manuals, slide decks, and SOPs into interactive quizzes for workshops and
              onboarding.
            </p>
          </div>

          <div className={styles.useCaseCard}>
            <div className={styles.useCaseIcon}>
              <UsersThree size={32} weight="fill" />
            </div>
            <h3>Event Organizers</h3>
            <p>
              Build engaging quiz sessions from talks, sponsor content, or websites to energize
              audiences.
            </p>
          </div>

          <div className={styles.useCaseCard}>
            <div className={styles.useCaseIcon}>
              <Question size={32} weight="fill" />
            </div>
            <h3>Students &amp; Study Groups</h3>
            <p>
              Generate practice questions from notes, chapters, or videos to prepare for exams
              together.
            </p>
          </div>

          <div className={styles.useCaseCard}>
            <div className={styles.useCaseIcon}>
              <ChartBar size={32} weight="fill" />
            </div>
            <h3>HR &amp; Onboarding</h3>
            <p>
              Create knowledge checks from policies and handbooks to make sure new hires understand
              what matters.
            </p>
          </div>
        </div>
      </section>

      {/* Pixel separator */}
      <div className={styles.pixelSeparator}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className={styles.pixel} style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>

      {/* BETA SECTION */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Early Access Beta</h2>
        <div className={styles.betaGrid}>
          <div className={styles.betaCard}>
            <p>
              Pregúntame Wizard is currently in <strong>beta</strong>. We are gradually opening AI
              access to teachers, trainers, and teams who want to experiment and share feedback.
            </p>
            <p>
              When you request access and are approved, you receive <strong>free AI credits</strong>{" "}
              that you can use to generate quizzes from your own content.
            </p>
            <p>
              Your usage and suggestions help us improve question quality, controls, and classroom
              features before a wider release.
            </p>
          </div>
          <div className={styles.betaSide}>
            <ul className={styles.betaList}>
              <li>
                <CheckCircle size={18} weight="fill" /> Free AI credits during beta
              </li>
              <li>
                <CheckCircle size={18} weight="fill" /> Priority access to new features
              </li>
              <li>
                <CheckCircle size={18} weight="fill" /> Direct channel to share feedback
              </li>
            </ul>
            <button className={styles.primaryCta} onClick={handleRequestBeta}>
              <span>Request Beta Access</span>
              <ArrowRight size={20} weight="bold" />
            </button>
          </div>
        </div>
      </section>

      {/* Pixel separator */}
      <div className={styles.pixelSeparator}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className={styles.pixel} style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>

      {/* FAQ SECTION */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>AI Quiz Generator FAQ</h2>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h3>What is an AI quiz generator?</h3>
            <p>
              An AI quiz generator is a tool that automatically creates questions and answers from
              content such as text, documents, websites, or videos. Instead of writing every
              question manually, you provide the material and the AI suggests quiz questions for
              you.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>Can I generate a quiz from a PDF?</h3>
            <p>
              Yes. With Pregúntame Wizard you can upload PDFs or other documents and let the AI turn
              them into structured quiz questions. You can review and edit everything before hosting
              a game.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>Can AI create quizzes from videos?</h3>
            <p>
              Yes. Wizard can use YouTube video transcripts or key segments to generate quiz
              questions that focus on the most important ideas in the video.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>Is Pregúntame Wizard free?</h3>
            <p>
              During the beta, approved users receive free AI credits so they can test the full
              experience. In the future, additional plans may be introduced, but the core Pregúntame
              platform remains free to use for hosting quizzes.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>Do I need technical skills?</h3>
            <p>
              No. If you can paste a link, upload a file, or write a sentence, you can use the AI
              quiz generator. The interface is built for teachers and non-technical users.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>Can I edit the AI-generated quiz?</h3>
            <p>
              Yes. You remain in control of the final content. You can edit questions, adjust
              difficulty, change answers, and remove anything that does not fit your goals.
            </p>
          </div>
        </div>
      </section>

      {/* Pixel separator */}
      <div className={styles.pixelSeparator}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className={styles.pixel} style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>

      {/* INTERNAL LINKS */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Learn More About Pregúntame</h2>
        <div className={styles.linksGrid}>
          <Link href="/create" className={styles.internalLinkCard}>
            <h3>Create a Quiz</h3>
            <p>Build your own quiz manually with our real-time quiz builder.</p>
          </Link>
          <Link href="/real-time-quiz-platform" className={styles.internalLinkCard}>
            <h3>Real-Time Quiz Platform</h3>
            <p>See how Pregúntame works as a live multiplayer quiz tool.</p>
          </Link>
          <Link href="/what-is-preguntame" className={styles.internalLinkCard}>
            <h3>What is Pregúntame?</h3>
            <p>Read the story and mission behind the platform.</p>
          </Link>
          <Link href="/live-quiz-for-classrooms" className={styles.internalLinkCard}>
            <h3>Live Quiz for Classrooms</h3>
            <p>Explore how teachers use Pregúntame in the classroom.</p>
          </Link>
        </div>
      </section>

      {/* Pixel separator */}
      <div className={styles.pixelSeparator}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className={styles.pixel} style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>

      {/* BOTTOM CTA SECTION */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Ready to Create a Quiz with AI?</h2>
        <p className={styles.sectionIntro}>
          Start with AI, adjust the questions to your needs, and host your quiz live with your
          students, team, or audience.
        </p>
        <div className={styles.bottomCtas}>
          <button className={styles.primaryCta} onClick={handleRequestBeta}>
            <span>Request Beta Access</span>
            <ArrowRight size={20} weight="bold" />
          </button>
          <button className={styles.secondaryCta} onClick={handleCreateWithAI}>
            Create with AI Now
          </button>
          <button className={styles.ghostCta} onClick={handleCreateQuizNow}>
            Create Quiz Manually
          </button>
        </div>
      </section>
    </div>
  );
}
