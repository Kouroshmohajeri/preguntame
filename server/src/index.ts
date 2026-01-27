// import "dotenv/config";
// import express from "express";
// import http from "http";
// import cors from "cors";
// import mongoose from "mongoose";
// import { connectRedis } from "./config/redis.js";
// import { setupSocket } from "./sockets/setupSocket.js";

// import quizRoutes from "./routes/quizzes.js";
// import gameRoutes from "./routes/gameRoutes.js";
// import userRoutes from "./routes/userRoutes.js";
// import categoryRoutes from "./routes/categoryRoutes.js";
// import leaderboardRoutes from "./routes/leaderboardRoutes.js";
// import gameResultRoutes from "./routes/gameResultRoutes.js";
// import notificationRoutes from "./routes/notificationRoutes.js";
// import aiRoutes from "./routes/aiRoutes.js";
// // import subscribeRoutes from "./routes/subscriptionRoutes.js";
// // import stripeWebhook from "./routes/stripeWebhook.js";
// import adminRoutes from "./routes/adminRoutes.js";
// import emailRoutes from "./routes/emailRoutes.js";
// import betaAccessRoutes from "./routes/betaAccessRoutes.js";

// const app = express();
// app.use(cors());
// // app.use("/api/webhooks", stripeWebhook);
// app.use(express.json());

// const server = http.createServer(app);
// setupSocket(server);

// const PORT = Number(process.env.PORT) || 4000;

// // Connect MongoDB & Redis
// await mongoose.connect(process.env.MONGO_URI!);
// console.log("✅ MongoDB connected");
// await connectRedis();

// app.use("/quizzes", quizRoutes);
// app.use("/api/games", gameRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/categories", categoryRoutes);
// app.use("/api/leaderboard", leaderboardRoutes);
// app.use("/api/gameResults", gameResultRoutes);
// app.use("/api/gameResults", gameResultRoutes);
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/ai", aiRoutes);
// // app.use("/api/subscribe", subscribeRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/email", emailRoutes);
// app.use("/api/beta-access", betaAccessRoutes);

// server.listen(PORT, "0.0.0.0", () =>
//   console.log(`✅ Server running on :${PORT}`),
// );
import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { connectRedis } from "./config/redis.js";
import { setupSocket } from "./sockets/setupSocket.js";
import { startAnswerWorker } from "./services/answerWorker.js";
import { answerQueue } from "./services/answerQueueService.js";

import quizRoutes from "./routes/quizzes.js";
import gameRoutes from "./routes/gameRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import gameResultRoutes from "./routes/gameResultRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import betaAccessRoutes from "./routes/betaAccessRoutes.js";
import redisRoutes from "./routes/redisRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const PORT = Number(process.env.PORT) || 4000;

// Connect MongoDB first
await mongoose.connect(process.env.MONGO_URI!);
console.log("✅ MongoDB connected");

// Connect Redis
await connectRedis();

// Setup Redis adapter for Socket.IO (enables horizontal scaling)
const pubClient = createClient({
  url: "redis://localhost:6379",
});
const subClient = pubClient.duplicate();

await pubClient.connect();
await subClient.connect();
console.log("✅ Redis adapter clients connected");

// Setup Socket.IO with Redis adapter
const io = setupSocket(server);
io.adapter(createAdapter(pubClient, subClient));
console.log(
  "✅ Socket.IO configured with Redis adapter for horizontal scaling",
);

// Start the answer processing worker
const worker = startAnswerWorker(io);
console.log("✅ Answer worker started");

// Health check endpoint with queue metrics
app.get("/api/health", async (req, res) => {
  try {
    const queueMetrics = {
      waiting: await answerQueue.getWaitingCount(),
      active: await answerQueue.getActiveCount(),
      completed: await answerQueue.getCompletedCount(),
      failed: await answerQueue.getFailedCount(),
    };

    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      mongodb:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      redis: {
        connected: pubClient.isOpen && subClient.isOpen,
      },
      queue: queueMetrics,
      sockets: {
        connected: io.of("/").sockets.size,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Routes
app.use("/quizzes", quizRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/gameResults", gameResultRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/beta-access", betaAccessRoutes);
app.use("/api/redis", redisRoutes);

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("⚠️  SIGTERM received, shutting down gracefully...");

  // Close worker first to stop processing new jobs
  await worker.close();
  console.log("✅ Worker closed");

  // Close server to stop accepting new connections
  server.close(() => {
    console.log("✅ HTTP server closed");
  });

  // Close Redis connections
  await pubClient.quit();
  await subClient.quit();
  console.log("✅ Redis connections closed");

  // Close MongoDB connection
  await mongoose.connection.close();
  console.log("✅ MongoDB connection closed");

  process.exit(0);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on :${PORT}`);
  console.log(
    `📊 Health check available at http://localhost:${PORT}/api/health`,
  );
});
