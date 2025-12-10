// components/PixelMenu/PixelMenu.tsx
"use client";

import React, { useState } from "react";
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
} from "@phosphor-icons/react";
import GameCodeModal from "../JoinRoom/GameCodeModal";
import PixelLogo from "../PixelLogo/PixelLogo";

interface PixelMenuProps {
  currentPage?: "home" | "leaderboard" | "game" | "dashboard" | "join" | "create" | "auth";
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

const PixelMenu: React.FC<PixelMenuProps> = ({ currentPage = "home" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

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
    setIsAnimating(false);
    setTimeout(() => {
      setIsOpen(false);
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
    }, 150);
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
      label: "View Leaderboard",
      icon: Trophy,
      isModal: true,
      modalType: "leaderboard",
      showAlways: true,
    },
    {
      id: 5,
      label: session ? "Dashboard" : "Register / Login",
      icon: session ? UserCircle : SignIn,
      path: session ? "/dashboard" : "/auth",
      showAlways: true,
    },
  ];

  // Add logout item if session exists
  if (session) {
    menuItems.push({
      id: 6,
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
      (currentPage === "dashboard" && item.path === "/dashboard")
    );
  };

  return (
    <>
      <div className={styles.pixelMenuContainer}>
        {/* Hamburger Button */}
        <div className={styles.hamburger}>
          <input
            className={styles.checkbox}
            type="checkbox"
            checked={isOpen}
            onChange={handleMenuToggle}
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
                  <UserCircle size={40} weight="fill" className={styles.userIcon} />
                  <div className={styles.userText}>
                    <div className={styles.welcomeText}>WELCOME</div>
                    <div className={styles.userName}>
                      {session?.user?.name || session?.user?.email || "Guest"}
                    </div>
                    {session && <div className={styles.userEmail}>{session.user?.email}</div>}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className={styles.menuItems}>
                {menuItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`${styles.menuItem} ${isItemActive(item) ? styles.active : ""} ${item.isLogout ? styles.logout : ""}`}
                    style={{
                      animationDelay: `${0.3 + index * 0.05}s`,
                    }}
                    onClick={() => handleMenuItemClick(item)}
                  >
                    <div className={styles.menuItemInner}>
                      <item.icon size={24} weight="fill" className={styles.menuItemIcon} />
                      <span className={styles.menuItemText}>{item.label}</span>
                    </div>
                    <div className={styles.menuItemPixel} />
                  </div>
                ))}
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
