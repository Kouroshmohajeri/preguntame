"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import GuestPlayroom from "@/components/GuestPlayroom/GuestPlayroom";
import StylingRoom from "@/components/StylingRoom/StylingRoom";
import { useSocket } from "@/context/SocketContext/SocketContext";
import RetroLoading from "@/components/RetroLoading/RetroLoading";


export default function Page() {
  const socket = useSocket();
  const { code } = useParams();
  const gameCode = code as string;
  const [gameStarted, setGameStarted] = useState<boolean | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("CONECTING...");

  useEffect(() => {
  if (!socket) return;

  const fallbackTimer = setTimeout(() => {
    if (gameStarted === null) {
      console.warn("⚠️ No response from server, defaulting to StylingRoom");
      setGameStarted(false);
    }
  }, 4000);
  
  socket.emit("getRoomPlayers", { gameCode });

  socket.on("playersUpdate", () => {
    setLoadingMessage("SYNCING PLAYERS...");
  });

  socket.on("gameStarted", ({ started }) => {
    setGameStarted(started);
  });

  socket.on("joinOngoingGame", ({ gameStarted }) => {
    setGameStarted(gameStarted);
  });

  return () => {
    socket.off("gameStarted");
    socket.off("joinOngoingGame");
    socket.off("playersUpdate");
    clearTimeout(fallbackTimer);
  };
}, [socket, gameCode]);


  // Show retro loading while waiting for server response
  if (gameStarted === null) {
    return <RetroLoading message={loadingMessage} />;
  }

  return (
    <div>
      {gameStarted ? <GuestPlayroom /> : <StylingRoom />}
    </div>
  );
}