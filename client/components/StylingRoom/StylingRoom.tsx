"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./StylingRoom.module.css";
import { useSocket } from "@/context/SocketContext/SocketContext";
import { v4 as uuidv4 } from "uuid";

interface Player {
  id: string;
  name: string;
  avatar: string;
  isReady: boolean;
  score?: number;
  isHost: boolean;
  uuid: string;
}

const avatarStyles = [
  "adventurer",
  "adventurer-neutral",
  "avataaars",
  "big-ears",
  "big-ears-neutral",
  "bottts",
  "pixel-art",
  "shapes",
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
  const [selectedStyle, setSelectedStyle] = useState("avataaars");
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [joined, setJoined] = useState(false);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState("");
  const [viewerCount, setViewerCount] = useState(0);

  // 🧩 Persistent identity per browser
  let playerUUID: string;
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("playerUUID");
    if (stored) playerUUID = stored;
    else {
      playerUUID = uuidv4();
      localStorage.setItem("playerUUID", playerUUID);
    }
  } else playerUUID = uuidv4();

  const avatarUrl = `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${
    playerName || "player"
  }&backgroundColor=${selectedColor.replace("#", "")}`;

  // 🔌 Handle socket lifecycle
useEffect(() => {
  if (!socket || !gameCode) return;

  console.log("🔌 Setting up socket listeners for room:", gameCode);
  
  socket.emit("visitRoom", { gameCode });

  const handlePlayersUpdate = ({
    players,
    hostId,
  }: {
    players: Player[];
    hostId: string;
  }) => {

    setPlayers(players);

    // Find current player by UUID instead of socket.id (more reliable)
    const me = players.find((p) => p.uuid === playerUUID);
    if (me) {
      setIsReady(me.isReady);
      setIsHost(me.isHost);
      setCurrentPlayerId(me.id);
      console.log("👤 Current player found:", me);
    }
  };

  const handleViewerCount = ({ count }: { count: number }) => {

    setViewerCount(count);
  };

  const handleGameStarted = () => {

    router.push(`/play/guest/${gameCode}`);
  };

  // Auto-join if we have saved player info
  const autoJoinIfPossible = () => {
    const saved = localStorage.getItem("playerInfo");
    if (!saved) {
      console.log("❌ No saved player info, waiting for manual join");
      return;
    }

    const playerData = JSON.parse(saved);
    if (playerData?.name && !joined) {

      
      const avatar = `https://api.dicebear.com/7.x/${playerData.style || selectedStyle}/svg?seed=${
        playerData.name
      }&backgroundColor=${(playerData.color || selectedColor).replace("#", "")}`;

      socket.emit("joinGame", {
        gameCode,
        playerName: playerData.name,
        avatar,
        playerUUID,
      });
      setJoined(true);
      setPlayerName(playerData.name);
      setSelectedStyle(playerData.style || "avataaars");
      setSelectedColor(playerData.color || colors[0]);
    }
  };

  // Set up event listeners
  socket.on("playersUpdate", handlePlayersUpdate);
  socket.on("viewerCountUpdate", handleViewerCount);
  socket.on("gameStarted", handleGameStarted);
  socket.on("connect", autoJoinIfPossible);

  // Auto-join if already connected
  if (socket.connected) {
    autoJoinIfPossible();
  }

  // Cleanup
  return () => {
    socket.off("playersUpdate", handlePlayersUpdate);
    socket.off("viewerCountUpdate", handleViewerCount);
    socket.off("gameStarted", handleGameStarted);
    socket.off("connect", autoJoinIfPossible);
  };
}, [socket, gameCode, playerUUID]); 

  // 🧠 Removed duplicate auto-join useEffect (this was the main cause of overwriting players)
const handleJoinGame = () => {
  if (!playerName.trim() || !socket) {
    setError("Please enter a player name");
    return;
  }

  const avatar = `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${playerName}&backgroundColor=${selectedColor.replace(
    "#",
    ""
  )}`;

  const playerInfo = {
    name: playerName,
    avatar,
    style: selectedStyle,
    color: selectedColor,
  };

  localStorage.setItem("playerInfo", JSON.stringify(playerInfo));
  
  socket.emit("joinGame", { 
    gameCode, 
    playerName: playerName.trim(), 
    avatar, 
    playerUUID 
  });
  
  setJoined(true);
  setError("");
};

  const handleReady = () => {
    if (!socket || !joined) return;
    const newReady = !isReady;
    setIsReady(newReady);
    socket.emit("toggleReady", { gameCode, isReady: newReady });
  };

  const canStartGame = players.filter((p) => p.isReady).length >= 1 && isHost;

  const handleLeaveGame = () => {
    if (socket && joined) socket.emit("leaveGame", { gameCode });
    localStorage.removeItem("playerInfo");
    setJoined(false);
    router.push("/");
  };

  const handleStartGame = () => {
    if (canStartGame && socket) {
      socket.emit("startGame", { gameCode });
      router.push(`/play/guest/${gameCode}/game`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.gameInfo}>
          <div className={styles.gameTitle}>
            STYLING ROOM {isHost && "👑"}
          </div>
          <div className={styles.roomCode}>#{gameCode}</div>
          {isHost && <div className={styles.hostBadge}>HOST</div>}
        </div>
        <div className={styles.headerControls}>
          <div
            className={styles.instructionsButton}
            onClick={() => setShowInstructions(true)}
          >
            ❓
          </div>
          {joined && (
            <button className={styles.leaveButton} onClick={handleLeaveGame}>
              LEAVE
            </button>
          )}
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.content}>
        {/* Customization panel */}
        <div className={styles.customizationPanel}>
          <div className={styles.panelTitle}>CREATE YOUR AVATAR</div>
          <div className={styles.avatarPreview}>
            <img
              src={avatarUrl}
              alt="Your avatar"
              className={styles.avatarImage}
            />
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
              disabled={joined}
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
                  disabled={joined}
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
                  disabled={joined}
                />
              ))}
            </div>
          </div>

          {!joined ? (
            <button
              className={styles.readyButton}
              onClick={handleJoinGame}
              disabled={!playerName.trim() || !socket}
            >
              JOIN GAME
            </button>
          ) : (
            <button
              className={`${styles.readyButton} ${
                isReady ? styles.readyActive : ""
              }`}
              onClick={handleReady}
              disabled={!socket}
            >
              {isReady ? "✓ READY!" : "CLICK TO READY"}
            </button>
          )}
        </div>

        {/* Player list */}
        <div className={styles.playersPanel}>
          <div className={styles.panelTitle}>PLAYERS ({viewerCount}/8)</div>
          <div className={styles.playersList}>
            {players.map((player) => (
              <div
                key={player.uuid || player.id}
                className={`${styles.playerCard} ${
                  player.isReady ? styles.playerReady : ""
                } ${player.isHost ? styles.playerHost : ""}`}
              >
                <div className={styles.playerAvatar}>
                  <img src={player.avatar} alt={player.name} />
                  {player.isHost && (
                    <div className={styles.hostCrown}>👑</div>
                  )}
                </div>
                <div className={styles.playerInfo}>
                  <div className={styles.playerName}>
                    {player.name}{" "}
                    {player.id === currentPlayerId && "(You)"}
                  </div>
                  <div className={styles.playerStatus}>
                    {player.isReady ? "READY" : "WAITING..."}
                  </div>
                </div>
                {player.isReady && (
                  <div className={styles.readyIndicator}>✓</div>
                )}
              </div>
            ))}
          </div>

          <div className={styles.startSection}>
            <div className={styles.readyCount}>
              {players.filter((p) => p.isReady).length} / {players.length} READY
            </div>
            {isHost && (
              <button
                className={styles.startButton}
                onClick={handleStartGame}
                disabled={!canStartGame}
              >
                START GAME
              </button>
            )}
            {!isHost && (
              <div className={styles.waitingHost}>
                Waiting for host to start...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
