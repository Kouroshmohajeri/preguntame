import { io, Socket } from "socket.io-client";

class SocketManager {
  private static instance: SocketManager;
  public socket: Socket | null = null;

  private constructor() {}

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public initialize(): Socket {
    if (!this.socket) {
      this.socket = io(process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4000", {
        transports: ["websocket"],
        autoConnect: false,
      });
    }
    return this.socket;
  }

  public getSocket(): Socket {
    if (!this.socket) {
      return this.initialize();
    }
    return this.socket;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketManager = SocketManager.getInstance();
export const getSocket = () => socketManager.getSocket();
