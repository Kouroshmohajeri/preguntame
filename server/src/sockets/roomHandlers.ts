import {
  addPlayer,
  addViewer,
  getRoom,
  removePlayer,
  toggleReady,
} from "../services/roomService.js";
import { Server, Socket } from "socket.io";

export function registerRoomHandlers(io: Server, socket: Socket) {
  console.log("🟢 Connected:", socket.id);

  socket.on("visitRoom", async ({ gameCode }) => {
    socket.join(gameCode);
    const room = await addViewer(gameCode, socket.id);
    io.to(gameCode).emit("viewerCountUpdate", { count: room.viewers.length });
  });

  socket.on("joinGame", async ({ gameCode, playerName, avatar, playerUUID }) => {
    const player = {
      id: socket.id,
      name: playerName,
      avatar,
      isReady: false,
      score: 0,
      isHost: false,
      uuid: playerUUID,
    };

    const room = await addPlayer(gameCode, player);
    io.to(gameCode).emit("playersUpdate", {
      players: Object.values(room.players),
      hostId: room.hostId,
    });
  });

  socket.on("toggleReady", async ({ gameCode, isReady }) => {
    const room = await toggleReady(gameCode, socket.id, isReady);
    if (room)
      io.to(gameCode).emit("playersUpdate", {
        players: Object.values(room.players),
        hostId: room.hostId,
      });
  });

  // Note: disconnect handlers are handled in registerGameSocket to avoid duplicate listeners
}
