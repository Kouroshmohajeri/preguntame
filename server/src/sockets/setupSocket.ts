import { Server } from "socket.io";
import { registerRoomHandlers } from "./roomHandlers.js";
import { registerGameSocket } from "./gameSocket.js";
import { registerNotificationSocket } from "./notificationSocket.js";

export function setupSocket(server: any) {
  const io = new Server(server, {
    cors: { origin: "*" },
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e6, // 1MB
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    registerRoomHandlers(io, socket);
    registerGameSocket(io, socket);
    registerNotificationSocket(io, socket);
  });

  return io;
}
