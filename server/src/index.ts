import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import { connectRedis } from "./config/redis.js";
import { setupSocket } from "./sockets/setupSocket.js";

import quizRoutes from "./routes/quizzes.js";
import gameRoutes from "./routes/gameRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import gameResultRoutes from "./routes/gameResultRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
// import aiRoutes from "./routes/aiRoutes.js";
// import subscribeRoutes from "./routes/subscriptionRoutes.js";
// import stripeWebhook from "./routes/stripeWebhook.js";
import adminRoutes from "./routes/adminRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";

const app = express();
app.use(cors());
// app.use("/api/webhooks", stripeWebhook);
app.use(express.json());

const server = http.createServer(app);
setupSocket(server);

const PORT = Number(process.env.PORT) || 4000;

// Connect MongoDB & Redis
await mongoose.connect(process.env.MONGO_URI!);
console.log("✅ MongoDB connected");
await connectRedis();

app.use("/quizzes", quizRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/gameResults", gameResultRoutes);
app.use("/api/gameResults", gameResultRoutes);
app.use("/api/notifications", notificationRoutes);
// app.use("/api/ai", aiRoutes);
// app.use("/api/subscribe", subscribeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/email", emailRoutes);

server.listen(PORT, "0.0.0.0", () =>
  console.log(`✅ Server running on :${PORT}`),
);
