"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowUp } from "@phosphor-icons/react";
import GameCodeModal from "@/components/JoinRoom/GameCodeModal";
import LoginModal from "@/components/LoginModal/LoginModal";
import {
  PlusCircle,
  GameController,
  User,
  UserCircle,
  ChalkboardTeacher,
  UsersThree,
  Presentation,
  Lightning,
  Clock,
  Trophy,
  ChartBar,
  CheckCircle,
  Student,
  Users,
  GameController as GameIcon,
} from "@phosphor-icons/react";
import styles from "./page.module.css";

export default function Home() {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { data: session } = useSession();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const router = useRouter();

  const handleCreate = () => {
    router.push("/create");
  };

  const handleDashboard = () => {
    router.push("/dashboard");
  };
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  return (
    <div className={styles.mainContainer}>
      <section className={styles.contentSection}>
        {/* Logo */}
        <div className={styles.logoContainer}>
          <Image
            src="/images/logo.svg"
            alt="Pregúntame - Free Real-Time Quiz Platform"
            width={180}
            height={180}
            className={styles.logoImage}
            priority
          />
        </div>

        {/* H1 Title */}
        <h1 className={styles.mainTitle}>Free Real-Time Quiz Platform</h1>

        {/* Subtitle */}
        <p className={styles.subtitle}>
          Create, host, and play live quizzes with instant results and interactive gameplay.
        </p>

        {/* Pixel Separator */}
        <div className={styles.pixelSeparator}>
          {[...Array(15)].map((_, i) => (
            <div key={i} className={styles.pixel} style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>

        {/* Primary CTAs */}
        <div className={styles.actionGrid}>
          {/* Create Card */}
          <div
            className={styles.actionCard}
            onClick={handleCreate}
            role="button"
            tabIndex={0}
            aria-label="Create a Free Quiz"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          >
            <div className={styles.iconContainer}>
              <PlusCircle size={48} weight="fill" />
            </div>
            <h2 className={styles.cardTitle}>Create a Quiz</h2>
          </div>

          {/* Join Card */}
          <div
            className={styles.actionCard}
            onClick={() => setShowJoinModal(true)}
            role="button"
            tabIndex={0}
            aria-label="Join a Game"
            onKeyDown={(e) => e.key === "Enter" && setShowJoinModal(true)}
          >
            <div className={styles.iconContainer}>
              <GameController size={48} weight="fill" />
            </div>
            <h2 className={styles.cardTitle}>Join a Game</h2>
          </div>

          {/* Dashboard/Login Card */}
          <div
            className={styles.actionCard}
            onClick={session ? handleDashboard : () => setShowLoginModal(true)}
            role="button"
            tabIndex={0}
            aria-label={session ? "View Dashboard" : "Register or Login"}
            onKeyDown={(e) =>
              e.key === "Enter" && (session ? handleDashboard() : setShowLoginModal(true))
            }
          >
            <div className={styles.iconContainer}>
              {session ? <UserCircle size={48} weight="fill" /> : <User size={48} weight="fill" />}
            </div>
            <h2 className={styles.cardTitle}>{session ? "Dashboard" : "Register / Login"}</h2>
          </div>
        </div>

        {/* Value Paragraph */}
        <div className={styles.valueParagraph}>
          <p>
            Pregúntame is a <strong>free real-time quiz platform</strong> designed for classrooms,
            events, and teams. Create live quizzes, share a simple game code, and watch results
            update instantly as players answer. With live scoring, leaderboards, and real-time
            feedback, Pregúntame turns quizzes into engaging interactive experiences without
            downloads or setup.
          </p>
        </div>

        {/* Core Feature Section */}
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Create and Play Real-Time Quizzes for Free</h2>

          <ul className={styles.bulletList}>
            <li>Create quizzes in seconds with our intuitive builder</li>
            <li>Players join instantly with a simple game code</li>
            <li>Live countdown and real-time scoring system</li>

            <li>Works perfectly on mobile and desktop browsers</li>
            <li>No downloads or installations required</li>
          </ul>
        </div>

        {/* Use Case Sections - Three Columns */}
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Perfect for Every Occasion</h2>

          <div className={styles.useCaseGrid}>
            {/* Classroom */}
            <div className={styles.useCaseBox}>
              <div className={styles.useCaseIcon}>
                <ChalkboardTeacher size={48} weight="fill" />
              </div>
              <h3 className={styles.featureBoxTitle}>Free Real-Time Quizzes for Classrooms</h3>
              <p className={styles.featureBoxContent}>
                Teachers can create interactive quizzes, track student responses in real time, and
                display live leaderboards to increase participation and focus. Perfect for formative
                assessments and review sessions.
              </p>
            </div>

            {/* Events */}
            <div className={styles.useCaseBox}>
              <div className={styles.useCaseIcon}>
                <Presentation size={48} weight="fill" />
              </div>
              <h3 className={styles.featureBoxTitle}>Live Quizzes for Events and Workshops</h3>
              <p className={styles.featureBoxContent}>
                Engage audiences during events, workshops, or presentations using live quizzes with
                instant results and interactive scoring. Break the ice and keep participants
                actively involved.
              </p>
            </div>

            {/* Teams */}
            <div className={styles.useCaseBox}>
              <div className={styles.useCaseIcon}>
                <UsersThree size={48} weight="fill" />
              </div>
              <h3 className={styles.featureBoxTitle}>Team and Community Games</h3>
              <p className={styles.featureBoxContent}>
                Run fun quizzes for teams, communities, or online meetups with shared game codes and
                real-time interaction. Foster team building and create memorable experiences with
                competitive gameplay.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>How the Free Real-Time Quiz Platform Works</h2>

          <div className={styles.howItWorks}>
            <div className={styles.step}>
              <h3 className={styles.stepTitle}>Create a quiz in your browser</h3>
              <p className={styles.stepDescription}>
                Use our intuitive quiz builder to create questions in seconds. No software
                installation needed.
              </p>
            </div>

            <div className={styles.step}>
              <h3 className={styles.stepTitle}>Share the game code</h3>
              <p className={styles.stepDescription}>
                Get a unique game code and share it with participants. They can join instantly from
                any device.
              </p>
            </div>

            <div className={styles.step}>
              <h3 className={styles.stepTitle}>Players join instantly</h3>
              <p className={styles.stepDescription}>
                Participants enter the game code and choose their avatar. No accounts needed for
                players.
              </p>
            </div>

            <div className={styles.step}>
              <h3 className={styles.stepTitle}>Results appear live</h3>
              <p className={styles.stepDescription}>
                See leaderboards update in real-time. Review detailed results and analytics after
                the game.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Section */}
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Why Choose Pregúntame</h2>

          <div className={styles.threeColumnGrid}>
            <div className={styles.featureBox}>
              <div className={styles.featureBoxIcon}>
                <CheckCircle size={32} weight="fill" />
              </div>
              <h3 className={styles.featureBoxTitle}>Completely Free</h3>
              <p className={styles.featureBoxContent}>
                Create, host, and play unlimited quizzes with our free plan. No hidden fees or
                subscription required.
              </p>
            </div>

            <div className={styles.featureBox}>
              <div className={styles.featureBoxIcon}>
                <Lightning size={32} weight="fill" />
              </div>
              <h3 className={styles.featureBoxTitle}>Real-Time Gameplay</h3>
              <p className={styles.featureBoxContent}>
                Powered by WebSocket technology for instant synchronization and live updates during
                gameplay.
              </p>
            </div>

            <div className={styles.featureBox}>
              <div className={styles.featureBoxIcon}>
                <GameIcon size={32} weight="fill" />
              </div>
              <h3 className={styles.featureBoxTitle}>No Downloads</h3>
              <p className={styles.featureBoxContent}>
                Everything runs in your browser. Players join with just a game code - no app
                installations required.
              </p>
            </div>

            <div className={styles.featureBox}>
              <div className={styles.featureBoxIcon}>
                <Trophy size={32} weight="fill" />
              </div>
              <h3 className={styles.featureBoxTitle}>Live Leaderboards</h3>
              <p className={styles.featureBoxContent}>Watch rankings at the End of the game.</p>
            </div>

            <div className={styles.featureBox}>
              <div className={styles.featureBoxIcon}>
                <ChartBar size={32} weight="fill" />
              </div>
              <h3 className={styles.featureBoxTitle}>Detailed Analytics</h3>
              <p className={styles.featureBoxContent}>
                Track player performance, response times, and game statistics with comprehensive
                post-game reports.
              </p>
            </div>

            <div className={styles.featureBox}>
              <div className={styles.featureBoxIcon}>
                <Clock size={32} weight="fill" />
              </div>
              <h3 className={styles.featureBoxTitle}>Speed & Simplicity</h3>
              <p className={styles.featureBoxContent}>
                Designed for quick setup and intuitive use. Get your quiz running in no time.
              </p>
            </div>
          </div>
        </div>

        {/* Internal Linking */}
        <div className={styles.internalLinks}>
          <a
            href="/create"
            className={styles.internalLink}
            onClick={(e) => {
              e.preventDefault();
              handleCreate();
            }}
          >
            Create a free quiz
          </a>
          <a
            href="#"
            className={styles.internalLink}
            onClick={(e) => {
              e.preventDefault();
              setShowJoinModal(true);
            }}
          >
            Join a quiz with a code
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.poweredBy}>Designed & Powered by WebGallery</p>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} Pregúntame. All rights reserved.
        </p>
      </footer>

      {/* Modals */}
      <GameCodeModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} type="join" />
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => {
          setShowLoginModal(false);
          router.refresh();
        }}
      />
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          className={styles.scrollTopButton}
          onClick={scrollToTop}
          aria-label="Scroll to top"
          title="Scroll to top"
        >
          <ArrowUp size={24} weight="bold" />
        </button>
      )}
    </div>
  );
}
