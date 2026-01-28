"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./StylingRoom.module.css";
import { useSocket } from "@/context/SocketContext/SocketContext";
import { v4 as uuidv4 } from "uuid";
import { X } from "@phosphor-icons/react";
import { getHostIdShort } from "@/app/api/game/actions";
import { useSession } from "next-auth/react";

interface Player {
  id: string;
  name: string;
  avatar: string;
  isReady: boolean;
  score?: number;
  isHost: boolean;
  uuid: string;
  userId?: string;
}

const avatarStyles = [
  "adventurer",
  "thumbs",
  "big-ears",
  "croodles",
  "micah",
  "personas",
  "miniavs",
  "lorelei",
];

const colors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
];

export default function StylingRoom() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code as string;
  const socket = useSocket();

  const [playerName, setPlayerName] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("pixel-art");
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [joined, setJoined] = useState(false);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const { data: session } = useSession();

  const hasJoinedRef = useRef(false);

  const generateAvatarUrl = (name: string, style: string, color: string) => {
    const safeName = name?.trim() || "guest";
    const safeStyle = style || "pixel-art";
    const safeColor = (color || "4ecdc4").replace("#", "");
    return `https://api.dicebear.com/7.x/${safeStyle}/svg?seed=${safeName}&backgroundColor=${safeColor}`;
  };

  const joinSound = typeof window !== "undefined" ? new Audio("/sounds/joinroom.mp3") : null;

  let playerUUID: string;
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("playerUUID");
    if (stored) playerUUID = stored;
    else {
      playerUUID = uuidv4();
      localStorage.setItem("playerUUID", playerUUID);
    }
  } else playerUUID = uuidv4();

  const [checkingHostStatus, setCheckingHostStatus] = useState(true);

  const avatarUrl = generateAvatarUrl(playerName, selectedStyle, selectedColor);

  const getDefaultHostAvatar = () => {
    return `https://api.dicebear.com/7.x/pixel-art/svg?seed=host&backgroundColor=4ecdc4`;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedDraft = localStorage.getItem(`draft_${gameCode}`);
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setPlayerName(draft.name || "");
      setSelectedStyle(draft.style || "pixel-art");
      setSelectedColor(draft.color || colors[0]);
    }
  }, [gameCode]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const draft = {
      name: playerName,
      style: selectedStyle,
      color: selectedColor,
    };

    localStorage.setItem(`draft_${gameCode}`, JSON.stringify(draft));
  }, [playerName, selectedStyle, selectedColor, gameCode]);

  useEffect(() => {
    if (!socket || !gameCode) return;

    socket.emit("visitRoom", { gameCode, playerUUID });

    const handlePlayersUpdate = ({ players, hostId }: { players: Player[]; hostId: string }) => {
      const uniquePlayers = players.filter(
        (player, index, self) => index === self.findIndex((p) => p.uuid === player.uuid)
      );

      const validPlayers = uniquePlayers.filter((p) => p.uuid);

      const playersWithAvatars = validPlayers.map((p) => ({
        ...p,
        avatar: p.isHost && !p.avatar ? getDefaultHostAvatar() : p.avatar,
      }));

      setPlayers(playersWithAvatars);

      const me = playersWithAvatars.find((p) => p.uuid === playerUUID);
      if (me) {
        setIsHost(me.isHost);
        setCurrentPlayerId(me.id);

        if (!hasJoinedRef.current) {
          hasJoinedRef.current = true;
          setJoined(true);
        }
      } else {
        if (hasJoinedRef.current) {
          hasJoinedRef.current = false;
          setJoined(false);
        }
      }

      setCheckingHostStatus(false);
    };

    const handleViewerCount = ({ count }: { count: number }) => {
      setViewerCount(count);
    };

    const handleGameStarted = ({ started }: { started: boolean }) => {
      // Logic handled in Page.tsx (GuestPlayroom switch)
    };

    const autoJoinIfPossible = async () => {
      if (hasJoinedRef.current) {
        setCheckingHostStatus(false);
        return;
      }

      const saved = localStorage.getItem("playerInfo");
      if (!saved) {
        setCheckingHostStatus(false);
        return;
      }

      const playerData = JSON.parse(saved);
      if (!playerData?.name) {
        setCheckingHostStatus(false);
        return;
      }

      let isHost = false;
      let hostIdToSend = null;

      if (session?.user?.id) {
        try {
          const { hostIdShort } = await getHostIdShort(gameCode);
          const userShort = session.user.id.slice(-5);
          if (hostIdShort === userShort) {
            isHost = true;
            hostIdToSend = session.user.id;
          }
        } catch (err) {
          // Failed to check host
        }
      }

      const avatarToSend =
        playerData.avatar ||
        generateAvatarUrl(
          playerData.name,
          playerData.style || "pixel-art",
          playerData.color || colors[0]
        );

      // ✅ CRITICAL FIX: Wait for joinConfirmed before redirecting host
      if (isHost && hostIdToSend) {
        const handleJoinConfirmed = () => {
          socket.off("joinConfirmed", handleJoinConfirmed);
          console.log("✅ Host join confirmed, redirecting...");
          router.push(`/play/host/${gameCode}`);
        };

        socket.once("joinConfirmed", handleJoinConfirmed);
      }

      // Emit joinGame
      socket.emit("joinGame", {
        gameCode,
        playerName: playerData.name,
        avatar: avatarToSend,
        playerUUID,
        isHost,
        hostId: hostIdToSend,
      });

      hasJoinedRef.current = true;
      setJoined(true);
      setPlayerName(playerData.name);
      setSelectedStyle(playerData.style || "pixel-art");
      setSelectedColor(playerData.color || colors[0]);

      setCheckingHostStatus(false);
    };

    socket.on("playersUpdate", handlePlayersUpdate);
    socket.on("viewerCountUpdate", handleViewerCount);
    socket.on("gameStarted", handleGameStarted);
    socket.on("connect", autoJoinIfPossible);

    if (socket.connected) {
      autoJoinIfPossible();
    } else {
      setCheckingHostStatus(false);
    }

    return () => {
      socket.off("playersUpdate", handlePlayersUpdate);
      socket.off("viewerCountUpdate", handleViewerCount);
      socket.off("gameStarted", handleGameStarted);
      socket.off("connect", autoJoinIfPossible);
    };
  }, [socket, gameCode, playerUUID, session, router]);

  const handleJoinGame = () => {
    if (!playerName.trim() || !socket) {
      setError("Please enter a player name");
      return;
    }

    if (hasJoinedRef.current || joined) {
      return;
    }

    const avatarToSend = generateAvatarUrl(playerName, selectedStyle, selectedColor);
    console.log("🎨 User avatar data:", { playerName, selectedStyle, selectedColor, avatarToSend });
    console.log("avatar to send:", avatarToSend);
    const playerInfo = {
      name: playerName,
      avatar: avatarToSend,
      style: selectedStyle,
      color: selectedColor,
    };

    localStorage.setItem("playerInfo", JSON.stringify(playerInfo));

    socket.emit("joinGame", {
      gameCode,
      playerName: playerName.trim(),
      avatar: avatarToSend,
      playerUUID,
    });

    hasJoinedRef.current = true;
    setJoined(true);
    joinSound?.play().catch(() => {});
    setError("");
  };

  const handleUpdateAvatar = () => {
    if (!socket || !joined) return;

    const newAvatar = generateAvatarUrl(playerName, selectedStyle, selectedColor);

    const playerInfo = {
      name: playerName,
      avatar: newAvatar,
      style: selectedStyle,
      color: selectedColor,
    };

    localStorage.setItem("playerInfo", JSON.stringify(playerInfo));

    socket.emit("updateAvatar", {
      gameCode,
      avatar: newAvatar,
      playerName: playerName.trim(),
      playerUUID,
    });
  };

  const handleLeaveGame = () => {
    if (socket && joined) {
      socket.emit("leaveGame", { gameCode, playerUUID });
    }

    localStorage.removeItem("playerInfo");
    localStorage.removeItem(`draft_${gameCode}`);

    hasJoinedRef.current = false;
    setJoined(false);

    router.push("/");
  };

  const canStartGame = players.length >= 2 && isHost;

  const handleStartGame = () => {
    if (canStartGame && socket) {
      socket.emit("startGame", { gameCode });
    }
  };

  if (checkingHostStatus) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Checking room access...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {showInstructions && (
        <div className={styles.modalOverlay} onClick={() => setShowInstructions(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>How to Customize</h2>
              <button className={styles.closeButton} onClick={() => setShowInstructions(false)}>
                <X size={20} weight="bold" />
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.instructionStep}>
                <div className={styles.stepNumber}>1</div>
                <div>
                  <strong>Enter Your Name</strong>
                  <p>Type your player name - your avatar changes with every letter!</p>
                </div>
              </div>
              <div className={styles.instructionStep}>
                <div className={styles.stepNumber}>2</div>
                <div>
                  <strong>Choose Avatar Style</strong>
                  <p>Select from different avatar styles to match your personality.</p>
                </div>
              </div>
              <div className={styles.instructionStep}>
                <div className={styles.stepNumber}>3</div>
                <div>
                  <strong>Pick Background Color</strong>
                  <p>Choose your favorite background color for your avatar.</p>
                </div>
              </div>
              <div className={styles.instructionStep}>
                <div className={styles.stepNumber}>4</div>
                <div>
                  <strong>Join & Customize Anytime</strong>
                  <p>
                    Click "Join Game" when ready. You can change your avatar anytime before the game
                    starts!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.header}>
        <div className={styles.gameInfo}>
          <div className={styles.gameTitle}>STYLING ROOM {isHost && "👑"}</div>
          <div className={styles.roomCode}>#{gameCode}</div>
          {isHost && <div className={styles.hostBadge}>HOST</div>}
        </div>
        <div className={styles.headerControls}>
          <button className={styles.helpButton} onClick={() => setShowInstructions(true)}>
            ?
          </button>
          {joined && (
            <button className={styles.leaveButton} onClick={handleLeaveGame}>
              LEAVE ROOM
            </button>
          )}
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.content}>
        <div className={styles.customizationPanel}>
          <div className={styles.panelTitle}>CREATE YOUR AVATAR</div>
          <div className={styles.avatarPreview}>
            <img src={avatarUrl} alt="Your avatar" className={styles.avatarImage} />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>PLAYER NAME</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="ENTER YOUR NAME"
              className={styles.nameInput}
              maxLength={12}
            />
          </div>

          <div className={styles.selectionGroup}>
            <label className={styles.inputLabel}>AVATAR STYLE</label>
            <div className={styles.styleGrid}>
              {avatarStyles.map((style) => (
                <button
                  key={style}
                  className={`${styles.styleButton} ${
                    selectedStyle === style ? styles.styleSelected : ""
                  }`}
                  onClick={() => setSelectedStyle(style)}
                >
                  <img
                    src={`https://api.dicebear.com/7.x/${style}/svg?seed=preview&backgroundColor=ff6b6b`}
                    alt={style}
                    className={styles.stylePreview}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className={styles.selectionGroup}>
            <label className={styles.inputLabel}>BACKGROUND COLOR</label>
            <div className={styles.colorGrid}>
              {colors.map((color) => (
                <button
                  key={color}
                  className={`${styles.colorButton} ${
                    selectedColor === color ? styles.colorSelected : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          {!joined ? (
            <button
              className={styles.joinButton}
              onClick={handleJoinGame}
              disabled={!playerName.trim() || !socket}
            >
              JOIN GAME
            </button>
          ) : (
            <button className={styles.updateButton} onClick={handleUpdateAvatar} disabled={!socket}>
              UPDATE AVATAR
            </button>
          )}
        </div>

        <div className={styles.playersPanel}>
          <div className={styles.panelTitle}>PLAYERS ({viewerCount})</div>
          <div className={styles.playersList}>
            {players.map((player) => (
              <div
                key={`${player.uuid}-${player.id}`}
                className={`${styles.playerCard} ${player.isHost ? styles.playerHost : ""}`}
              >
                <div className={styles.playerAvatar}>
                  {player.avatar ? <img src={player.avatar} alt={player.name} /> : null}
                </div>
                <div className={styles.playerInfo}>
                  <div className={styles.playerName}>
                    {player.name} {player.id === currentPlayerId && "(You)"}
                    {player.isHost && " 👑"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.startSection}>
            {isHost ? (
              <button
                className={styles.startButton}
                onClick={handleStartGame}
                disabled={!canStartGame}
              >
                START GAME
              </button>
            ) : (
              <div className={styles.waitingHost}>Waiting for host to start...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
