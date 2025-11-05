import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";

import quizRoutes from "./routes/quizzes.js";
import gameRoutes from "./routes/gameRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";


const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 4000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI!)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Routes
app.use("/quizzes", quizRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);

// Socket.IO
// ✅ track players separately from host
const roomPlayers = new Map(); // gameCode -> Set of player socket IDs

io.on("connection", (socket) => {
  console.log("🟢 Connected:", socket.id);

  socket.on("joinGame", ({ gameCode, playerName }) => {
    socket.join(gameCode);

    if (!roomPlayers.has(gameCode)) roomPlayers.set(gameCode, new Set());
    if (playerName !== "HOST") {
      roomPlayers.get(gameCode).add(socket.id);
    }

    const count = roomPlayers.get(gameCode)?.size || 0;
    io.to(gameCode).emit("playerCountUpdate", { count });
  });

  socket.on("leaveGame", ({ gameCode }) => {
    socket.leave(gameCode);
    if (roomPlayers.has(gameCode)) {
      roomPlayers.get(gameCode).delete(socket.id);
      const count = roomPlayers.get(gameCode).size;
      io.to(gameCode).emit("playerCountUpdate", { count });
    }
  });

  socket.on("disconnecting", () => {
    for (const room of socket.rooms) {
      if (room !== socket.id && roomPlayers.has(room)) {
        roomPlayers.get(room).delete(socket.id);
        const count = roomPlayers.get(room).size;
        io.to(room).emit("playerCountUpdate", { count });
      }
    }
  });

  // ✅ Host starts question -> notify all guests
  socket.on("hostStartQuestion", ({ gameCode, questionIndex }) => {
    io.to(gameCode).emit("startQuestion", { questionIndex });
  });

  // ✅ Guests submit answer
  socket.on("submitAnswer", ({ gameCode, playerId, correct }) => {
    io.to(gameCode).emit("playerAnswered", { playerId, correct });
  });

  // Timer updating
  socket.on("timerTick", ({ gameCode, timeLeft }) => {
    io.to(gameCode).emit("updateTimer", { timeLeft });
  });

});



server.listen(PORT, () => console.log(`✅ Server running on :${PORT}`));
