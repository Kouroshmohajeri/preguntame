import { Server } from "socket.io";
import { registerRoomHandlers } from "./roomHandlers.js";
import { registerGameSocket } from "./gameSocket.js";
import { registerNotificationSocket } from "./notificationSocket.js";

export function setupSocket(server: any) {
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    // Handles general room joins, ready toggles, etc.
    registerRoomHandlers(io, socket);
    // Handles host/guest sync, Redis persistence, etc.
    registerGameSocket(io, socket);
    // Handle notifications
    registerNotificationSocket(io, socket);
  });

  return io;
}
