"use client";
import Dashboard from "@/components/Dashboard/Dashboard";
import LoginModal from "@/components/LoginModal/LoginModal";
import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";

const Page = () => {
  const { data: session, status } = useSession();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  useEffect(() => {
    // Show login modal if no session
    if (status === "unauthenticated") {
      setShowLoginModal(true);
    }

    // Check if user just logged in
    if (session) {
      const justLoggedIn = sessionStorage.getItem("justLoggedIn");
      if (justLoggedIn === "true") {
        setShowSuccessBanner(true);
        sessionStorage.removeItem("justLoggedIn");

        // Auto hide banner after 5 seconds
        setTimeout(() => {
          setShowSuccessBanner(false);
        }, 5000);
      }
    }
  }, [session, status]);

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    sessionStorage.setItem("justLoggedIn", "true");
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  const handleCloseBanner = () => {
    setShowSuccessBanner(false);
  };

  return (
    <div>
      {/* Success Banner */}
      {showSuccessBanner && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 1001,
            animation: "slideInRight 0.5s ease-out",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              background: "#000",
              border: "3px solid #38A169",
              padding: "1rem 1.5rem",
              boxShadow: "4px 4px 0 #38A169",
              borderRadius: "8px",
              color: "white",
              maxWidth: "400px",
              position: "relative",
            }}
          >
            <div style={{ fontSize: "2rem", animation: "bounce 1s infinite" }}>🎮</div>
            <div style={{ display: "flex", flexDirection: "column", flex: "1" }}>
              <strong
                style={{
                  fontSize: "1rem",
                  fontWeight: 800,
                  marginBottom: "0.25rem",
                  color: "#38A169",
                }}
              >
                SUCCESSFULLY LOGGED IN!
              </strong>
              <span style={{ fontSize: "0.8rem", color: "#ccc", fontWeight: 600 }}>
                Welcome to the arcade, {session?.user?.name}!
              </span>
            </div>
            <button
              onClick={handleCloseBanner}
              style={{
                position: "absolute",
                top: "8px",
                right: "12px",
                background: "none",
                border: "none",
                color: "#38A169",
                fontSize: "1.2rem",
                fontWeight: 900,
                cursor: "pointer",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Close banner"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={handleCloseLoginModal}
          onLoginSuccess={handleLoginSuccess}
          isOpen={true}
        />
      )}

      {/* Dashboard Content - Always show, but LoginModal will overlay it */}
      <Dashboard />
    </div>
  );
};

export default Page;
