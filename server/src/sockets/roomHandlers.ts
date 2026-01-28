import { Server, Socket } from "socket.io";
import { addPlayer, toggleReady } from "../services/roomService.js";

export function registerRoomHandlers(io: Server, socket: Socket) {
  console.log("🟢 Connected:", socket.id);

  socket.on(
    "joinGame",
    async ({ gameCode, playerName, avatar, playerUUID, isHost, hostId }) => {
      socket.join(gameCode);

      const safeAvatar =
        avatar && avatar.length > 0
          ? avatar
          : `https://api.dicebear.com/7.x/pixel-art/svg?seed=${playerName || "guest"}&backgroundColor=4ecdc4`;

      const player = {
        id: socket.id,
        name: playerName,
        avatar: safeAvatar,
        isReady: false,
        score: 0,
        isHost: Boolean(isHost),
        uuid: playerUUID,
        userId: isHost && hostId ? hostId : "",
        currentQuestion: 0,
        answers: [],
      };

      const room = await addPlayer(gameCode, player);

      socket.emit("joinConfirmed", { playerUUID, gameCode });

      const nonHostPlayers = Object.values(room.players).filter(
        (p) => !p.isHost,
      );

      io.to(gameCode).emit("playersUpdate", {
        players: nonHostPlayers,
        hostId: room.hostId,
        playerCount: nonHostPlayers.length,
      });

      io.to(gameCode).emit("viewerCountUpdate", {
        count: room.viewers.length,
      });
    },
  );

  socket.on("toggleReady", async ({ gameCode, playerUUID, isReady }) => {
    const room = await toggleReady(gameCode, playerUUID, isReady);
    if (room) {
      const nonHostPlayers = Object.values(room.players).filter(
        (p) => !p.isHost,
      );
      io.to(gameCode).emit("playersUpdate", {
        players: nonHostPlayers,
        hostId: room.hostId,
      });
    }
  });
}
