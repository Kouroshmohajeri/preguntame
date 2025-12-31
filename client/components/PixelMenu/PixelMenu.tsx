"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./PixelMenu.module.css";

// Phosphor Icons
import {
  GameController,
  PlusCircle,
  UserCircle,
  House,
  Trophy,
  SignIn,
  SignOut,
  Info,
  EnvelopeSimple,
  Article,
} from "@phosphor-icons/react";
import GameCodeModal from "../JoinRoom/GameCodeModal";
import PixelLogo from "../PixelLogo/PixelLogo";
import Image from "next/image";

interface PixelMenuProps {
  currentPage?:
    | "home"
    | "leaderboard"
    | "game"
    | "dashboard"
    | "join"
    | "create"
    | "auth"
    | "about"
    | "contact"
    | "blog";
  alwaysHamburger?: boolean;
}

interface MenuItem {
  id: number;
  label: string;
  icon: React.ComponentType<any>;
  path?: string;
  action?: () => void;
  showAlways: boolean;
  isLogout?: boolean;
  isModal?: boolean;
  modalType?: "join" | "leaderboard";
}

const PixelMenu: React.FC<PixelMenuProps> = ({ currentPage = "home", alwaysHamburger = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  // Lock body scroll when menu is open (only for mobile/hamburger)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleMenuToggle = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsOpen(false), 300);
    }
  };

  const handleMenuItemClick = (item: MenuItem) => {
    // Close hamburger menu if open
    if (isOpen) {
      setIsAnimating(false);
      setTimeout(() => {
        setIsOpen(false);
        executeAction(item);
      }, 150);
    } else {
      executeAction(item);
    }
  };

  const executeAction = (item: MenuItem) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      router.push(item.path);
    } else if (item.isModal && item.modalType) {
      if (item.modalType === "join") {
        setShowJoinModal(true);
      } else if (item.modalType === "leaderboard") {
        setShowLeaderboardModal(true);
      }
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setIsOpen(false);
    router.push("/");
  };

  const menuItems: MenuItem[] = [
    {
      id: 1,
      label: "Home",
      icon: House,
      path: "/",
      showAlways: true,
    },
    {
      id: 2,
      label: "Join Game",
      icon: GameController,
      isModal: true,
      modalType: "join",
      showAlways: true,
    },
    {
      id: 3,
      label: "Create Game",
      icon: PlusCircle,
      path: "/create",
      showAlways: true,
    },
    {
      id: 4,
      label: "Leaderboard",
      icon: Trophy,
      isModal: true,
      modalType: "leaderboard",
      showAlways: true,
    },
    {
      id: 6,
      label: "About Us",
      icon: Info,
      path: "/what-is-preguntame",
      showAlways: true,
    },
    {
      id: 7,
      label: "Contact",
      icon: EnvelopeSimple,
      path: "/contact-us",
      showAlways: true,
    },
    {
      id: 8,
      label: "Blog",
      icon: Article,
      path: "/blog",
      showAlways: true,
    },
    {
      id: 5,
      label: session ? "Dashboard" : "Login",
      icon: session ? UserCircle : SignIn,
      path: session ? "/dashboard" : "/auth",
      showAlways: true,
    },
  ];

  // Add logout item if session exists
  if (session) {
    menuItems.push({
      id: 99,
      label: "Log Out",
      icon: SignOut,
      action: handleLogout,
      showAlways: true,
      isLogout: true,
    });
  }

  // Helper function to check if item is active
  const isItemActive = (item: MenuItem): boolean => {
    if (!item.path) return false;
    const pagePath = item.path.replace("/", "");
    return (
      currentPage === pagePath ||
      (currentPage === "home" && item.path === "/") ||
      (currentPage === "dashboard" && item.path === "/dashboard") ||
      (currentPage === "about" && item.path === "/what-is-preguntame") ||
      (currentPage === "contact" && item.path === "/contact-us") ||
      (currentPage === "blog" && item.path === "/blog")
    );
  };

  return (
    <>
      {/* Desktop Header Menu (when alwaysHamburger is false) */}
      {!alwaysHamburger && (
        <header className={styles.desktopHeader}>
          <div className={styles.desktopHeaderContent}>
            {/* Logo - Links to Home */}
            <a
              href="/"
              className={styles.desktopLogoLink}
              onClick={(e) => {
                e.preventDefault();
                router.push("/");
              }}
            >
              <Image
                src="/images/logo.svg"
                alt="Preguntame"
                width={50}
                height={50}
                className={styles.desktopLogoImage}
              />
            </a>

            {/* Navigation Items */}
            <nav className={styles.desktopNav}>
              {menuItems
                .filter(
                  (item) =>
                    item.id !== 1 && // Remove Home
                    item.id !== 4 && // Remove Leaderboard
                    item.id !== 5 && // Remove Dashboard/Login
                    item.id !== 99 // Remove Logout
                )
                .map((item) => (
                  <button
                    key={item.id}
                    className={`${styles.desktopMenuItem} ${isItemActive(item) ? styles.desktopActive : ""}`}
                    onClick={() => handleMenuItemClick(item)}
                  >
                    <item.icon size={18} weight="fill" className={styles.desktopMenuIcon} />
                    <span>{item.label}</span>
                  </button>
                ))}

              {/* User Section - Right Side */}
              <div className={styles.desktopUserSection}>
                {session ? (
                  <>
                    <button
                      className={`${styles.desktopUserItem} ${currentPage === "dashboard" ? styles.desktopActive : ""}`}
                      onClick={() => router.push("/dashboard")}
                      title={session.user?.name || session.user?.email || "Dashboard"}
                    >
                      <UserCircle size={18} weight="fill" className={styles.desktopMenuIcon} />
                      <span className={styles.desktopUserName}>
                        {session.user?.name || session.user?.email || "User"}
                      </span>
                    </button>

                    <button className={styles.desktopLogoutItem} onClick={handleLogout}>
                      <SignOut size={18} weight="fill" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <button
                    className={`${styles.desktopUserItem} ${currentPage === "auth" ? styles.desktopActive : ""}`}
                    onClick={() => router.push("/auth")}
                  >
                    <SignIn size={18} weight="fill" className={styles.desktopMenuIcon} />
                    <span>Login / Register</span>
                  </button>
                )}
              </div>
            </nav>
          </div>
        </header>
      )}

      {/* Hamburger Menu (always on mobile/tablet, optional on desktop) */}
      <div
        className={`${styles.pixelMenuContainer} ${alwaysHamburger ? styles.alwaysHamburger : styles.hamburgerOnly}`}
      >
        {/* Hamburger Button */}
        <div className={styles.hamburger}>
          <input
            className={styles.checkbox}
            type="checkbox"
            checked={isOpen}
            onChange={handleMenuToggle}
            aria-label="Toggle menu"
          />
          <svg fill="none" viewBox="0 0 50 50" height="50" width="50">
            <path
              className={`${styles.lineTop} ${styles.line}`}
              strokeLinecap="round"
              strokeWidth="4"
              stroke="black"
              d="M6 11L44 11"
            />
            <path
              strokeLinecap="round"
              strokeWidth="4"
              stroke="black"
              d="M6 24H43"
              className={`${styles.lineMid} ${styles.line}`}
            />
            <path
              strokeLinecap="round"
              strokeWidth="4"
              stroke="black"
              d="M6 37H43"
              className={`${styles.lineBottom} ${styles.line}`}
            />
          </svg>
        </div>

        {/* Menu Overlay */}
        {isOpen && (
          <div
            className={`${styles.menuOverlay} ${isAnimating ? styles.animating : styles.closing}`}
            onClick={() => handleMenuToggle()}
          >
            {/* Menu Content */}
            <div
              className={`${styles.menuContent} ${isAnimating ? styles.contentAnimating : styles.contentClosing}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Pixel Grid Animation */}
              <div className={styles.pixelGrid}>
                {Array.from({ length: 100 }).map((_, index) => (
                  <div
                    key={index}
                    className={styles.pixel}
                    style={{
                      animationDelay: `${index * 0.01}s`,
                    }}
                  />
                ))}
              </div>

              {/* Menu Header */}
              <div className={styles.menuHeader}>
                <div className={styles.userInfo}>
                  <UserCircle size={48} weight="fill" className={styles.userIcon} />
                  <div className={styles.userText}>
                    <div className={styles.welcomeText}>WELCOME</div>
                    <div className={styles.userName}>
                      {session?.user?.name || session?.user?.email || "Guest"}
                    </div>
                    {session && <div className={styles.userEmail}>{session.user?.email}</div>}
                  </div>
                </div>
              </div>

              {/* Menu Items - Scrollable */}
              <div className={styles.menuItemsWrapper}>
                <div className={styles.menuItems}>
                  {menuItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={`${styles.menuItem} ${isItemActive(item) ? styles.active : ""} ${item.isLogout ? styles.logout : ""}`}
                      style={{
                        animationDelay: `${0.3 + index * 0.05}s`,
                      }}
                      onClick={() => handleMenuItemClick(item)}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => e.key === "Enter" && handleMenuItemClick(item)}
                    >
                      <div className={styles.menuItemInner}>
                        <item.icon size={24} weight="fill" className={styles.menuItemIcon} />
                        <span className={styles.menuItemText}>{item.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Menu Footer */}
              <div className={styles.menuFooter}>
                <div className={styles.menuFooterContent}>
                  <PixelLogo />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <GameCodeModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} type="join" />
      <GameCodeModal
        isOpen={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
        type="leaderboard"
      />
    </>
  );
};

export default PixelMenu;
