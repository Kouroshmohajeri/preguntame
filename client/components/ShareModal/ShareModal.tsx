// components/ShareModal/ShareModal.tsx
"use client";
import React, { useState, useEffect } from "react";
import { X, User, Copy, Check } from "@phosphor-icons/react";
import QRCode from "qrcode";
import styles from "./ShareModal.module.css";
import { searchUsers } from "@/app/api/users/actions";
import { sendNotification } from "@/app/api/notifications/actions";
import { useToast } from "@/context/ToastContext/ToastContext";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameCode: string;
  gameTitle: string;
  email: string;
  userId: string;
}

interface User {
  lastname: string;
  _id: string;
  name: string;
  email: string;
  avatar: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  gameCode,
  gameTitle,
  email,
  userId,
}: ShareModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const { showToast } = useToast();

  const gameUrl = `${process.env.NEXT_PUBLIC_SHARE_URL}/${gameCode}`;

  // Generate QR code
  useEffect(() => {
    if (isOpen && gameUrl) {
      const generateQRCode = async () => {
        try {
          const url = await QRCode.toDataURL(gameUrl, {
            width: 200,
            margin: 2,
            color: {
              dark: "#2D3748",
              light: "#FFFFFF",
            },
          });
          setQrCodeDataUrl(url);
        } catch (err) {
          console.error("Error generating QR code:", err);
        }
      };

      generateQRCode();
    }
  }, [isOpen, gameUrl]);

  const searchUsersHandler = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchUsers(query, email);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      searchUsersHandler(searchTerm);
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const handleUserSelect = (user: User) => {
    if (!selectedUsers.find((u) => u._id === user._id)) {
      setSelectedUsers((prev) => [...prev, user]);
    }
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((user) => user._id !== userId));
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(gameUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = async () => {
    try {
      if (selectedUsers.length === 0) return;

      // Send notifications to each selected user
      for (const user of selectedUsers) {
        await sendNotification({
          userId: user._id,
          senderId: userId,
          type: "game",
          title: "Game Invitation",
          message: `${email} shared the game "${gameTitle}" with you.`,
          data: {
            gameCode,
            gameTitle,
          },
        });
      }

      showToast(`Game shared with ${selectedUsers.length} player(s)!`, "success");

      onClose();
    } catch (err) {
      console.error("Error sharing game:", err);
      showToast("Failed to share game.", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={20} weight="bold" />
        </button>

        <div className={styles.modalHeader}>
          <h2 className={styles.title}>SHARE GAME</h2>
          <p className={styles.subtitle}>Share "{gameTitle}" with others</p>
        </div>

        <div className={styles.modalContent}>
          {/* Left Column - QR Code */}
          <div className={styles.leftColumn}>
            <div className={styles.qrSection}>
              <div className={styles.qrContainer}>
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code"
                    style={{
                      width: "200px",
                      height: "200px",
                      imageRendering: "pixelated",
                    }}
                  />
                ) : (
                  <div className={styles.qrPlaceholder}>
                    <div
                      style={{
                        width: "200px",
                        height: "200px",
                        background: "#F7FAFC",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#4A5568",
                        fontFamily: "'Nunito', sans-serif",
                        fontWeight: 600,
                        border: "2px dashed #CBD5E0",
                      }}
                    >
                      Generating QR Code...
                    </div>
                  </div>
                )}
                <p
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 700,
                    color: "#2D3748",
                    fontSize: "0.9rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    margin: "1rem 0 0 0",
                    textAlign: "center",
                  }}
                >
                  Scan to Play
                </p>
              </div>
              <div className={styles.urlSection}>
                <p className={styles.urlLabel}>Game URL:</p>
                <div className={styles.urlContainer}>
                  <code className={styles.url}>{gameUrl}</code>
                  <button onClick={handleCopyLink} className={styles.copyButton} title="Copy link">
                    {copied ? <Check size={16} weight="bold" /> : <Copy size={16} weight="bold" />}
                  </button>
                </div>
                {copied && <span className={styles.copiedText}>Copied!</span>}
              </div>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className={styles.divider}></div>

          {/* Right Column - User Search */}
          <div className={styles.rightColumn}>
            <div className={styles.searchSection}>
              <h3 className={styles.sectionTitle}>INVITE PLAYERS</h3>

              {/* Search Input */}
              <div className={styles.searchContainer}>
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className={styles.searchResults}>
                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      className={styles.userResult}
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className={styles.userAvatar}>
                        <img
                          src={user.avatar}
                          alt={user.name}
                          style={{ width: "100%", height: "100%", borderRadius: "50%" }}
                        />
                      </div>
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>
                          {user.name} {user.lastname}
                        </span>
                        <span className={styles.userEmail}>{user.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {loading && <div className={styles.loading}>Searching...</div>}

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div className={styles.selectedSection}>
                  <h4 className={styles.selectedTitle}>
                    Selected Players ({selectedUsers.length})
                  </h4>
                  <div className={styles.selectedUsers}>
                    {selectedUsers.map((user) => (
                      <div key={user._id} className={styles.selectedUser}>
                        <div className={styles.selectedUserInfo}>
                          <div className={styles.userAvatarSmall}>
                            <User size={14} weight="fill" />
                          </div>
                          <span className={styles.selectedUserName}>{user.name}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveUser(user._id)}
                          className={styles.removeButton}
                        >
                          <X size={12} weight="bold" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            CANCEL
          </button>
          <button
            className={styles.shareButton}
            onClick={handleShare}
            disabled={selectedUsers.length === 0}
          >
            SHARE WITH {selectedUsers.length} PLAYER{selectedUsers.length !== 1 ? "S" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
