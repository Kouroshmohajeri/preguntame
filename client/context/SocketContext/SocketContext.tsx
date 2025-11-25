"use client";
import { getSocket } from "@/utils/socket";
import { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
  const s = getSocket();
  if (!socket) {
    setSocket(s);
    if (!s.connected) s.connect();
  }
}, []);


  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};