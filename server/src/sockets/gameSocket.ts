import { Server, Socket } from "socket.io";
import { redis } from "../config/redis.js";
import { Room, Player } from "../types/gameTypes.js";
import Game, { IGame } from "../models/Game.js";
import { applyScoreToPlayer } from "../services/scoringService.js";
import { saveGameResult, saveTheGameResult } from "../Repo/gameResultRepo.js";

async function getRoom(gameCode: string): Promise<Room> {
  const data = await redis.get(`room:${gameCode}`);
  if (data) return JSON.parse(data);

  return {
    players: {},
    viewers: [],
    hostId: "",
    createdAt: new Date().toISOString(),
    gameStarted: false,
    currentQuestion: 0, // <-- added
  };
}

async function saveRoom(gameCode: string, room: Room) {
  await redis.set(`room:${gameCode}`, JSON.stringify(room));
}

async function deleteRoom(gameCode: string) {
  await redis.del(`room:${gameCode}`);
}

export function registerGameSocket(io: Server, socket: Socket) {
  // Note: This function is called from setupSocket which already handles the connection event
  // So we register handlers directly on the socket, not on io.on("connection")
  socket.on("startGame", async ({ gameCode }) => {
    const room = await getRoom(gameCode);
    room.gameStarted = true;
    await saveRoom(gameCode, room);

    io.to(gameCode).emit("gameStarted", { started: true });
  });
  // 🧭 When visiting a game lobby
  socket.on("visitRoom", async ({ gameCode, playerUUID }) => {
    socket.join(gameCode);

    let room = await getRoom(gameCode);
    if (!room.createdAt) {
      room = {
        players: {},
        viewers: [],
        hostId: "",
        createdAt: new Date().toISOString(),
        gameStarted: false,
        currentQuestion: 0,
      };
    }

    if (!room.viewers.includes(playerUUID)) room.viewers.push(playerUUID);

    await saveRoom(gameCode, room);

    io.to(gameCode).emit("playersUpdate", {
      players: Object.values(room.players),
      hostId: room.hostId,
    });
    io.to(gameCode).emit("viewerCountUpdate", { count: room.viewers.length });
  });
  // Host starts a question
  socket.on("hostStartQuestion", async ({ gameCode, questionIndex }) => {
    const room = await getRoom(gameCode);
    if (!room) return;

    room.currentQuestion = questionIndex;
    await saveRoom(gameCode, room);
    // Broadcast start with initial timeLeft so guests start exact same moment
    const initialTime = 20;
    io.to(gameCode).emit("startQuestion", {
      questionIndex,
      timeLeft: initialTime,
    });
    // Broadcast the initial timer value as well
    io.to(gameCode).emit("updateTimer", { timeLeft: initialTime });
  });

  socket.on("finalizeLeaderboard", async ({ gameCode }) => {
    gameCode = Array.isArray(gameCode) ? gameCode[0] : gameCode;
    console.log("🏁 finalizeLeaderboard received for", gameCode);

    const room = await getRoom(gameCode);
    if (!room) {
      console.error("❌ Room not found for finalizeLeaderboard");
      return;
    }

    const players = Object.values(room.players).filter((p) => !p.isHost);

    // Sort leaderboard by score desc
    const leaderboard = players
      .map((p) => ({
        uuid: p.uuid,
        name: p.name,
        score: p.score || 0,
        answers: p.answers || [],
      }))
      .sort((a, b) => b.score - a.score);

    // Save to MongoDB
    const hostId = room.hostId;
    await saveTheGameResult(gameCode, leaderboard, hostId);

    console.log("💾 Leaderboard saved to MongoDB!");

    // Inform clients
    io.to(gameCode).emit("gameEnded", { leaderboard });

    // OPTIONAL: delete room
    // await deleteRoom(gameCode);
  });

  // Timer tick
  socket.on("timerTick", async ({ gameCode, timeLeft }) => {
    const room = await getRoom(gameCode);
    if (!room) return;

    // Optional: you can persist timeLeft in Redis if needed
    io.to(gameCode).emit("updateTimer", { timeLeft });
  });

  // Show correct answer for current question
  socket.on("showCorrectAnswer", async ({ gameCode }) => {
    const room = await getRoom(gameCode);
    if (!room) return;

    io.to(gameCode).emit("showCorrectAnswer");
  });
  // Scoring\
  socket.on(
    "playerAnswer",
    async ({ gameCode, playerUUID, questionIndex, answerId, timeLeft }) => {
      console.log(
        `📥 Received playerAnswer: gameCode=${gameCode}, playerUUID=${playerUUID}, questionIndex=${questionIndex}, answerId=${answerId}, timeLeft=${timeLeft}`
      );

      const room = await getRoom(gameCode);
      if (!room) {
        console.error("❌ Room not found for gameCode:", gameCode);
        return;
      }

      console.log(`🔍 Looking for player with UUID: ${playerUUID}`);
      console.log(`🔍 Available player UUIDs:`, Object.keys(room.players));

      // Try to find player by UUID first, then by socket.id as fallback
      let player = room.players[playerUUID];
      if (!player) {
        // Fallback: try to find by socket.id
        const playerEntry = Object.entries(room.players).find(
          ([uuid, p]) => p.id === socket.id
        );
        if (playerEntry) {
          player = playerEntry[1];
          console.log(
            `✅ Found player by socket.id fallback: ${playerEntry[0]}`
          );
        }
      }

      if (!player) {
        console.error(
          "❌ Player not found. UUID:",
          playerUUID,
          "Socket ID:",
          socket.id,
          "Available players:",
          Object.keys(room.players)
        );
        return;
      }

      console.log(`✅ Found player: ${player.name} (UUID: ${playerUUID})`);

      // Use lean() to get plain JavaScript objects with proper _id serialization
      const game = (await Game.findOne({
        gameCode: gameCode,
      }).lean()) as IGame | null;
      if (!game) {
        console.error("❌ Game not found:", gameCode);
        return;
      }

      if (!game.questions || questionIndex >= game.questions.length) {
        console.error(
          "❌ Invalid question index:",
          questionIndex,
          "Total questions:",
          game.questions?.length
        );
        return;
      }

      const question = game.questions[questionIndex];
      if (!question || !question.answers) {
        console.error(
          "❌ Question or answers not found for index:",
          questionIndex
        );
        return;
      }

      // Find the answer - handle both ObjectId and string formats
      // With .lean(), _id should be a string, but handle both cases
      let selectedAnswer = null;
      for (const answer of question.answers) {
        // Handle both ObjectId objects and string _id values
        const answerIdValue = answer._id;
        let answerIdStr: string;

        if (
          answerIdValue &&
          typeof answerIdValue === "object" &&
          "toString" in answerIdValue
        ) {
          // It's an ObjectId object
          answerIdStr = answerIdValue.toString();
        } else {
          // It's already a string (from .lean())
          answerIdStr = String(answerIdValue);
        }

        if (answerIdStr === answerId) {
          selectedAnswer = answer;
          break;
        }
      }

      if (!selectedAnswer) {
        const availableIds = question.answers.map((a: any) => {
          const id = a._id;
          return typeof id === "object" && "toString" in id
            ? id.toString()
            : String(id);
        });
        console.error(
          "❌ Answer not found. Submitted answerId:",
          answerId,
          "Available answerIds:",
          availableIds
        );
        return;
      }

      const isCorrect = selectedAnswer.correct === true;
      console.log(
        `📝 Player ${player.name} answered question ${questionIndex}: ${
          isCorrect ? "✅ CORRECT" : "❌ WRONG"
        } (answerId: ${answerId})`
      );

      const { points, isCorrect: result } = applyScoreToPlayer(
        player,
        isCorrect,
        timeLeft
      );

      // Store player's response
      if (!player.answers) player.answers = [];
      const existing = player.answers.find(
        (a) => a.questionIndex === questionIndex
      );
      if (existing) {
        existing.answerId = answerId;
        existing.isCorrect = result;
        existing.points = points;
        existing.timeLeft = timeLeft;
        console.log(
          `🔄 Updated existing answer for question ${questionIndex}: isCorrect=${result}, points=${points}`
        );
      } else {
        player.answers.push({
          questionIndex,
          answerId,
          isCorrect: result,
          points,
          timeLeft,
        });
        console.log(
          `💾 Saved new answer for question ${questionIndex}: isCorrect=${result}, points=${points}, totalAnswers=${player.answers.length}`
        );
      }

      console.log(
        `📊 Player ${player.name} current score: ${player.score}, total answers: ${player.answers.length}`
      );
      await saveRoom(gameCode, room);
      console.log(
        `✅ Room saved. Player answers:`,
        JSON.stringify(player.answers, null, 2)
      );

      // Notify everyone that player answered
      io.to(gameCode).emit("playerAnswered", {
        playerUUID,
        points,
        isCorrect: result,
        totalScore: player.score,
        playerAnswers: player.answers,
      });

      // Leaderboard update broadcast
      const leaderboard = Object.values(room.players)
        .map((p) => ({
          name: p.name,
          score: p.score,
          correct: p.answers?.filter((a) => a.isCorrect).length || 0,
          wrong: p.answers?.filter((a) => !a.isCorrect).length || 0,
        }))
        .sort((a, b) => b.score - a.score);

      io.to(gameCode).emit("leaderboardUpdate", leaderboard);
    }
  );

  // 🎮 Joining game
  // socket.on(
  //   "joinGame",
  //   async ({ gameCode, playerName, avatar, playerUUID, isHost, hostId }) => {
  //     socket.join(gameCode);

  //     let room = await getRoom(gameCode);
  //     const isLateJoin = room.gameStarted;

  //     let existingPlayer = room.players[playerUUID];

  //     if (existingPlayer) {
  //       // Update avatar and name if they choose to customize mid-game
  //       existingPlayer.name = playerName || existingPlayer.name;
  //       existingPlayer.avatar = avatar || existingPlayer.avatar;
  //       existingPlayer.id = socket.id;
  //       // Update userId if host is reconnecting
  //       if (isHost && hostId) {
  //         existingPlayer.userId = hostId;
  //       }
  //     } else {
  //       room.players[playerUUID] = {
  //         id: socket.id,
  //         name: playerName,
  //         avatar,
  //         isReady: false,
  //         score: 0,
  //         isHost: isHost && !room.hostId, // Only first player can be host
  //         uuid: playerUUID, // Keep playerUUID for socket identification
  //         userId: isHost && hostId ? hostId : undefined, // Store user MongoDB ObjectId for host
  //         currentQuestion: isLateJoin ? room.currentQuestion || 0 : 0, // Track which question player should start from
  //       };

  //       // Set room.hostId to the user's MongoDB ObjectId (not UUID) - only for host
  //       if (isHost && hostId) {
  //         if (!room.hostId) {
  //           room.hostId = hostId; // This should be the MongoDB ObjectId from session.user.id
  //           console.log(`✅ Host joined with MongoDB ObjectId: ${hostId}`);
  //         }
  //       }
  //     }

  //     if (!room.viewers.includes(playerUUID)) room.viewers.push(playerUUID);

  //     await saveRoom(gameCode, room);

  //     io.to(gameCode).emit("playersUpdate", {
  //       players: Object.values(room.players),
  //       hostId: room.hostId,
  //     });
  //     io.to(gameCode).emit("viewerCountUpdate", {
  //       count: room.viewers.length,
  //     });

  //     if (isLateJoin) {
  //       socket.emit("joinOngoingGame", {
  //         gameStarted: true,
  //         currentQuestion: room.players[playerUUID].currentQuestion,
  //       });
  //     }
  //   }
  // );
  // In the joinGame handler, add this check:
  //Clean up function
  async function cleanupDuplicatePlayers(room: Room): Promise<Room> {
    const uniquePlayers: Record<string, Player> = {};

    // Keep only the most recent player for each UUID
    Object.values(room.players).forEach((player) => {
      if (player.uuid) {
        // If we already have this UUID, keep the one with the most recent socket.id
        // (or you could choose based on other criteria like isReady status)
        if (
          !uniquePlayers[player.uuid] ||
          player.id > uniquePlayers[player.uuid].id
        ) {
          uniquePlayers[player.uuid] = player;
        }
      }
    });

    room.players = uniquePlayers;
    return room;
  }

  // Join game
  socket.on(
    "joinGame",
    async ({ gameCode, playerName, avatar, playerUUID, isHost, hostId }) => {
      socket.join(gameCode);

      let room = await getRoom(gameCode);
      const isLateJoin = room.gameStarted;

      // Check if player with this UUID already exists
      let existingPlayer = room.players[playerUUID];

      if (existingPlayer) {
        // Update existing player instead of creating new one
        existingPlayer.name = playerName || existingPlayer.name;
        existingPlayer.avatar = avatar || existingPlayer.avatar;
        existingPlayer.id = socket.id;
        existingPlayer.isReady = false; // Reset ready status on rejoin
        if (isHost && hostId) {
          existingPlayer.userId = hostId;
        }
        console.log(
          `🔄 Updated existing player: ${playerName} (UUID: ${playerUUID})`
        );
      } else {
        // Create new player
        const playerIsHost = Boolean(isHost && !room.hostId);
        const playerUserId = isHost && hostId ? hostId : "";

        room.players[playerUUID] = {
          id: socket.id,
          name: playerName,
          avatar,
          isReady: false,
          score: 0,
          isHost: playerIsHost,
          uuid: playerUUID,
          userId: playerUserId,
          currentQuestion: isLateJoin ? room.currentQuestion || 0 : 0,
        };

        if (isHost && hostId && !room.hostId) {
          room.hostId = hostId;
        }
        console.log(
          `✅ Created new player: ${playerName} (UUID: ${playerUUID})`
        );
      }

      if (!room.viewers.includes(playerUUID)) room.viewers.push(playerUUID);

      // Clean up duplicates and save
      room = await cleanupDuplicatePlayers(room); // <- Pass the room parameter here
      await saveRoom(gameCode, room);

      // Emit unique players only
      const nonHostPlayers = Object.values(room.players).filter(
        (p) => !p.isHost
      );

      io.to(gameCode).emit("playersUpdate", {
        players: Object.values(room.players),
        hostId: room.hostId,
        playerCount: nonHostPlayers.length,
      });

      io.to(gameCode).emit("viewerCountUpdate", {
        count: room.viewers.length,
      });

      if (isLateJoin) {
        socket.emit("joinOngoingGame", {
          gameStarted: true,
          currentQuestion: room.players[playerUUID].currentQuestion,
        });
      }
    }
  );
  // socket.on("startGame", async ({ gameCode }) => {
  //   const room = await getRoom(gameCode);
  //   if (!room) return;

  //   room.gameStarted = true;
  //   room.currentQuestion = 0; // Reset current question for host
  //   await saveRoom(gameCode, room);

  //   io.to(gameCode).emit("gameStarted", { started: true });
  // });

  socket.on("getRoomPlayers", async ({ gameCode }) => {
    const roomData = await redis.get(`room:${gameCode}`);
    if (!roomData) return;
    const room = JSON.parse(roomData);

    // Send current players to this specific socket
    socket.emit("playersUpdate", { players: Object.values(room.players) });
  });
  // Ending
  const finalizeGame = async (
    gameCode: string,
    hostId: string,
    players: any[]
  ) => {
    const finalGameCode = Array.isArray(gameCode) ? gameCode[0] : gameCode;

    // Try to resolve hostId -> MongoDB ObjectId if hostId is a player UUID.
    // room.hostId is currently a UUID in your logs. But the GameResult expects a Mongo ObjectId.
    let hostMongoId = hostId;

    try {
      const room = await getRoom(finalGameCode);
      if (room && room.players) {
        // If room.hostId is a UUID (key in room.players), and that player's `userId` exists,
        // use that value instead (this is the Mongo _id you stored earlier as userId).
        const possiblePlayer = room.players[hostId];
        if (possiblePlayer && possiblePlayer.userId) {
          hostMongoId = possiblePlayer.userId;
          console.log("🛠 Resolved host UUID -> MongoID:", hostMongoId);
        } else {
          // Another pattern in your code: sometimes you were storing room.hostId = playerUUID
          // but you may also have stored the host Mongo id directly earlier. This check catches that.
          if (typeof hostMongoId === "string" && hostMongoId.length !== 24) {
            console.warn(
              "⚠ hostId is not a 24-char hex string and couldn't be resolved from room.players. hostId:",
              hostId
            );
          }
        }
      }
    } catch (err) {
      console.warn("⚠ Error while resolving room hostId -> userId:", err);
    }

    // Validate hostMongoId is a 24-char hex string before casting
    const isValidHex24 =
      typeof hostMongoId === "string" && /^[0-9a-fA-F]{24}$/.test(hostMongoId);

    if (!isValidHex24) {
      // Defensive: don't crash the whole server. Log and skip saving or try alternate strategy.
      console.error(
        "❌ finalizeGame: couldn't resolve host to Mongo ObjectId. hostId:",
        hostId,
        "resolved:",
        hostMongoId
      );
      // Option A: abort saving so you don't insert invalid doc
      return;
      // Option B (less safe): still save but leave hostId undefined or string (change schema) — not recommended.
    }

    // finally, save using the resolved mongo id
    await saveGameResult({
      gameCode: finalGameCode,
      hostId: hostMongoId,
      players,
    });
  };

  // End Game & finalize leaderboard
  socket.on("endGame", async ({ gameCode }) => {
    const room = await getRoom(gameCode);
    if (!room) return;

    // Build final leaderboard AND full player result objects
    const players = Object.values(room.players)
      .filter((p) => !p.isHost)
      .map((p) => {
        const correct = p.answers?.filter((a) => a.isCorrect).length || 0;
        const wrong = p.answers?.filter((a) => !a.isCorrect).length || 0;

        const responseTimes =
          p.answers?.map((a) => 20 - (a.timeLeft || 0)) || [];
        const avgResponseTime = responseTimes.length
          ? Math.round(
              responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
            )
          : undefined;

        return {
          playerId: p.id,
          name: p.name,
          avatar: p.avatar,
          uuid: p.uuid,
          score: p.score,
          correct,
          wrong,
          responseTime: avgResponseTime,
          answers: p.answers || [],
        };
      })
      .sort((a, b) => b.score - a.score);

    // Save to Redis (temporary)
    await redis.set(`leaderboard:${gameCode}`, JSON.stringify(players));

    // Save permanently to MongoDB

    await finalizeGame(gameCode, room.hostId, players);

    // Emit end signal
    io.to(gameCode).emit("gameEnded", { leaderboard: players });

    // Cleanup Redis room after delay
    setTimeout(() => deleteRoom(gameCode), 60000);
  });

  //Finalizing
  socket.on("finalizeLeaderboard", async ({ gameCode }) => {
    gameCode = Array.isArray(gameCode) ? gameCode[0] : gameCode;
    const room = await getRoom(gameCode);
    if (!room) return;

    const players = Object.values(room.players).filter((p) => !p.isHost);

    const leaderboard = players
      .map((p) => ({
        uuid: p.uuid,
        name: p.name,
        score: p.score || 0,
        answers: p.answers || [],
      }))
      .sort((a, b) => b.score - a.score);

    await saveTheGameResult(gameCode, leaderboard, room.hostId);

    io.to(gameCode).emit("gameEnded", { leaderboard });
  });

  // 🧹 Disconnect
  socket.on("disconnecting", async () => {
    for (const gameCode of socket.rooms) {
      if (gameCode === socket.id) continue;
      const room = await getRoom(gameCode);

      // Remove player by matching uuid to socket.id
      const playerEntry = Object.entries(room.players).find(
        ([uuid, p]) => p.id === socket.id
      );
      if (playerEntry) delete room.players[playerEntry[0]];

      room.viewers = room.viewers.filter((uuid) => room.players[uuid]); // keep viewers with active players

      if (Object.keys(room.players).length === 0 && room.viewers.length === 0) {
        await deleteRoom(gameCode);
        console.log(`🗑 Deleted empty room: ${gameCode}`);
      } else {
        await saveRoom(gameCode, room);
        io.to(gameCode).emit("playersUpdate", {
          players: Object.values(room.players),
          hostId: room.hostId,
        });
        io.to(gameCode).emit("viewerCountUpdate", {
          count: room.viewers.length,
        });
      }
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(`🔴 ${socket.id} disconnected: ${reason}`);
  });
}
