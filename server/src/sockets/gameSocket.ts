import { Server, Socket } from "socket.io";
import { redis } from "../config/redis.js";
import { Player } from "../types/gameTypes.js";
import { answerQueue } from "../services/answerQueueService.js";
import {
  getPlayer,
  getAllPlayers,
  savePlayerAndMetadata,
  cleanupRoom,
  savePlayer,
} from "../services/redisClient.js";
import { saveTheGameResult } from "../Repo/gameResultRepo.js";

export function registerGameSocket(io: Server, socket: Socket) {
  socket.on("requestGameStatus", async ({ gameCode }) => {
    const metadataStr = await redis.get(`room:${gameCode}:metadata`);

    if (!metadataStr) {
      socket.emit("gameStatus", { gameStarted: false });
      return;
    }

    const metadata = JSON.parse(metadataStr);
    socket.emit("gameStatus", {
      gameStarted: metadata.gameStarted || false,
    });
  });
  socket.on("hostInitializeRoom", async ({ gameCode, hostId }) => {
    try {
      // Clean up old data
      await cleanupRoom(gameCode);

      // Create fresh metadata
      const metadata = {
        hostId,
        createdAt: new Date().toISOString(),
        viewers: [],
        gameStarted: false,
        currentQuestion: 0,
      };

      await redis.set(`room:${gameCode}:metadata`, JSON.stringify(metadata), {
        EX: 3600,
      });

      socket.emit("roomInitialized", { gameCode });
      console.log(`✅ Room ${gameCode} initialized for host ${hostId}`);
    } catch (error) {
      console.error("❌ Failed to initialize room:", error);
      socket.emit("roomInitializeFailed", {
        error: "Failed to initialize room",
      });
    }
  });

  socket.on("startGame", async ({ gameCode }) => {
    const metadataStr = await redis.get(`room:${gameCode}:metadata`);
    if (metadataStr) {
      const metadata = JSON.parse(metadataStr);
      metadata.gameStarted = true;
      metadata.currentQuestion = 0;
      await redis.set(`room:${gameCode}:metadata`, JSON.stringify(metadata), {
        EX: 3600,
      });
    }

    io.to(gameCode).emit("gameStarted", { started: true });
  });

  socket.on("triggerCountdown", ({ gameCode }) => {
    io.to(gameCode).emit("showPreparation");
  });

  socket.on("hostStartQuestion", async ({ gameCode, questionIndex }) => {
    const metadataStr = await redis.get(`room:${gameCode}:metadata`);
    if (metadataStr) {
      const metadata = JSON.parse(metadataStr);
      metadata.currentQuestion = questionIndex;
      await redis.set(`room:${gameCode}:metadata`, JSON.stringify(metadata), {
        EX: 3600,
      });
    }

    io.to(gameCode).emit("startQuestion", {
      questionIndex,
      timeLeft: 20,
    });
  });

  socket.on("visitRoom", async ({ gameCode, playerUUID }) => {
    socket.join(gameCode);

    // Get or create metadata
    let metadataStr = await redis.get(`room:${gameCode}:metadata`);
    let metadata: any;

    if (!metadataStr) {
      metadata = {
        hostId: "",
        createdAt: new Date().toISOString(),
        viewers: [],
        gameStarted: false,
        currentQuestion: 0,
      };
      await redis.set(`room:${gameCode}:metadata`, JSON.stringify(metadata), {
        EX: 3600,
      });
    } else {
      metadata = JSON.parse(metadataStr);
    }

    if (!metadata.viewers.includes(playerUUID)) {
      metadata.viewers.push(playerUUID);
      await redis.set(`room:${gameCode}:metadata`, JSON.stringify(metadata), {
        EX: 3600,
      });
    }

    // Get all players
    const players = await getAllPlayers(gameCode);
    const nonHostPlayers = Object.values(players).filter((p) => !p.isHost);

    io.to(gameCode).emit("playersUpdate", {
      players: nonHostPlayers,
      hostId: metadata.hostId,
      playerCount: nonHostPlayers.length,
    });

    io.to(gameCode).emit("viewerCountUpdate", {
      count: metadata.viewers.length,
    });
  });

  socket.on(
    "joinGame",
    async ({ gameCode, playerName, avatar, playerUUID, isHost, hostId }) => {
      socket.join(gameCode);

      const safeAvatar =
        avatar && avatar.length > 0
          ? avatar
          : `https://api.dicebear.com/7.x/pixel-art/svg?seed=${playerName || "guest"}&backgroundColor=4ecdc4`;

      console.log(
        `📥 joinGame: ${playerName}, UUID: ${playerUUID}, isHost: ${isHost}, Avatar: ${avatar}...`,
      );

      try {
        const existingPlayer = await getPlayer(gameCode, playerUUID);
        if (existingPlayer && existingPlayer.id === socket.id) {
          return;
        }

        const metadataStr = await redis.get(`room:${gameCode}:metadata`);
        let metadata: any;

        if (!metadataStr) {
          metadata = {
            hostId: "",
            createdAt: new Date().toISOString(),
            viewers: [],
            gameStarted: false,
            currentQuestion: 0,
          };
        } else {
          metadata = JSON.parse(metadataStr);
        }

        let player = await getPlayer(gameCode, playerUUID);

        if (player) {
          player.name = playerName || player.name;
          player.avatar = avatar;
          player.id = socket.id;
          player.isReady = false;
          if (isHost && hostId) {
            player.userId = hostId;
            player.isHost = true;
          }
        } else {
          const playerIsHost = Boolean(isHost);

          player = {
            id: socket.id,
            name: playerName,
            avatar: safeAvatar,
            isReady: false,
            score: 0,
            isHost: playerIsHost,
            uuid: playerUUID,
            userId: isHost && hostId ? hostId : "",
            currentQuestion: metadata.gameStarted
              ? metadata.currentQuestion
              : 0,
            answers: [],
          };

          if (isHost && hostId && !metadata.hostId) {
            metadata.hostId = hostId;
          }
        }

        if (!metadata.viewers.includes(playerUUID)) {
          metadata.viewers.push(playerUUID);
        }

        // ✅ Use atomic save
        await savePlayerAndMetadata(gameCode, playerUUID, player, metadata);

        socket.emit("joinConfirmed", { playerUUID, gameCode });

        // Get all players for broadcast
        const allPlayers = await getAllPlayers(gameCode);
        const nonHostPlayers = Object.values(allPlayers).filter(
          (p) => !p.isHost,
        );

        io.to(gameCode).emit("playersUpdate", {
          players: nonHostPlayers,
          hostId: metadata.hostId,
          playerCount: nonHostPlayers.length,
        });

        io.to(gameCode).emit("viewerCountUpdate", {
          count: metadata.viewers.length,
        });
      } catch (error) {
        console.error(`❌ joinGame error:`, error);
        socket.emit("joinError", { error: "Failed to join game" });
      }
    },
  );

  socket.on(
    "updateAvatar",
    async ({ gameCode, avatar, playerUUID, playerName }) => {
      const player = await getPlayer(gameCode, playerUUID);
      if (!player) return;

      player.avatar = avatar;
      player.name = playerName || player.name;

      await savePlayer(gameCode, playerUUID, player);

      const allPlayers = await getAllPlayers(gameCode);
      const nonHostPlayers = Object.values(allPlayers).filter((p) => !p.isHost);

      const metadataStr = await redis.get(`room:${gameCode}:metadata`);
      const metadata = metadataStr ? JSON.parse(metadataStr) : { hostId: "" };

      io.to(gameCode).emit("playersUpdate", {
        players: nonHostPlayers,
        hostId: metadata.hostId,
        playerCount: nonHostPlayers.length,
      });
    },
  );

  socket.on("getRoomPlayers", async ({ gameCode }) => {
    const allPlayers = await getAllPlayers(gameCode);
    const nonHostPlayers = Object.values(allPlayers).filter((p) => !p.isHost);

    const metadataStr = await redis.get(`room:${gameCode}:metadata`);
    const metadata = metadataStr ? JSON.parse(metadataStr) : { hostId: "" };

    socket.emit("playersUpdate", {
      players: nonHostPlayers,
      hostId: metadata.hostId,
      playerCount: nonHostPlayers.length,
    });
  });

  socket.on("timerTick", ({ gameCode, timeLeft }) => {
    io.to(gameCode).emit("updateTimer", { timeLeft });
  });

  socket.on("showCorrectAnswer", ({ gameCode }) => {
    io.to(gameCode).emit("showCorrectAnswer");
  });

  socket.on(
    "playerAnswer",
    async ({ gameCode, playerUUID, questionIndex, answerId, timeLeft }) => {
      try {
        const jobId = `${gameCode}-${playerUUID}-${questionIndex}`;
        await answerQueue.add(
          "process-answer",
          { gameCode, playerUUID, questionIndex, answerId, timeLeft },
          {
            jobId,
            priority: 1,
            attempts: 2,
            backoff: { type: "exponential", delay: 200 },
            removeOnComplete: true,
            removeOnFail: 50,
          },
        );
      } catch (error) {
        console.error("❌ Failed to queue answer:", error);
      }
    },
  );

  socket.on("endGame", async ({ gameCode }) => {
    const allPlayers = await getAllPlayers(gameCode);

    // Smart Ghost Filter
    const activeSockets = await io.in(gameCode).fetchSockets();
    const activeSocketIds = new Set(activeSockets.map((s) => s.id));

    const leaderboard = Object.values(allPlayers)
      .filter((p) => !p.isHost) // Exclude host
      .filter((p) => {
        const hasAnswers = p.answers && p.answers.length > 0;
        const hasScore = (p.score || 0) > 0;
        const isConnected = activeSocketIds.has(p.id);
        return hasAnswers || hasScore || isConnected;
      })
      .map((p) => {
        const correct = p.answers?.filter((a) => a.isCorrect).length || 0;
        const wrong = p.answers?.filter((a) => !a.isCorrect).length || 0;
        const responseTimes =
          p.answers?.map((a) => 20 - (a.timeLeft || 0)) || [];
        const avgResponseTime = responseTimes.length
          ? Math.round(
              responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
            )
          : undefined;

        return {
          playerId: p.id,
          name: p.name,
          avatar: p.avatar,
          uuid: p.uuid,
          score: p.score || 0,
          correct,
          wrong,
          responseTime: avgResponseTime,
          answers: p.answers || [],
          isAssigned: false,
        };
      })
      .sort((a, b) => b.score - a.score);

    await redis.set(`leaderboard:${gameCode}`, JSON.stringify(leaderboard), {
      EX: 3600,
    });

    io.to(gameCode).emit("gameEnded", { leaderboard });

    console.log(`✅ Game ended with ${leaderboard.length} players`);
  });

  socket.on("leaveGame", async ({ gameCode, playerUUID }) => {
    await redis.hdel(`room:${gameCode}:players`, playerUUID);

    const metadataStr = await redis.get(`room:${gameCode}:metadata`);
    if (metadataStr) {
      const metadata = JSON.parse(metadataStr);
      metadata.viewers = metadata.viewers.filter(
        (uuid: string) => uuid !== playerUUID,
      );
      await redis.set(`room:${gameCode}:metadata`, JSON.stringify(metadata), {
        EX: 3600,
      });
    }

    socket.leave(gameCode);
  });

  socket.on("disconnect", () => {
    console.log(`🔴 ${socket.id} disconnected`);
  });
}
