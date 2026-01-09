"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import GuestPlayroom from "@/components/GuestPlayroom/GuestPlayroom";
import StylingRoom from "@/components/StylingRoom/StylingRoom";
import { useSocket } from "@/context/SocketContext/SocketContext";
import RetroLoading from "@/components/RetroLoading/RetroLoading";

export default function Page() {
  const socket = useSocket();
  const { code } = useParams();
  const gameCode = code as string;
  const [gameStarted, setGameStarted] = useState(false); // ✅ Default to FALSE (StylingRoom)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!socket || !gameCode) return;

    const handleGameStarted = ({ started }: { started: boolean }) => {
      if (started) {
        setGameStarted(true);
      }
    };

    const handleJoinOngoingGame = ({ gameStarted: started }: { gameStarted: boolean }) => {
      setGameStarted(started);
    };

    socket.on("gameStarted", handleGameStarted);
    socket.on("joinOngoingGame", handleJoinOngoingGame);

    // After socket setup, stop loading
    setLoading(false);

    return () => {
      socket.off("gameStarted", handleGameStarted);
      socket.off("joinOngoingGame", handleJoinOngoingGame);
    };
  }, [socket, gameCode]);

  if (loading) {
    return <RetroLoading message="CONNECTING..." />;
  }

  return <div>{gameStarted ? <GuestPlayroom /> : <StylingRoom />}</div>;
}
