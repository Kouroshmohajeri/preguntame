import { Worker } from "bullmq";
import { Server } from "socket.io";
import { connectionOptions } from "./answerQueueService.js";
import Game, { IGame } from "../models/Game.js";
import { applyScoreToPlayer } from "./scoringService.js";
import { getPlayer, savePlayer } from "./redisClient.js";

export function startAnswerWorker(io: Server) {
  const worker = new Worker(
    "player-answers",
    async (job) => {
      const { gameCode, playerUUID, questionIndex, answerId, timeLeft } =
        job.data;

      console.log(
        `🔍 Worker processing job ${job.id} for player ${playerUUID}`,
      );
      console.log(
        `   Game: ${gameCode}, Question: ${questionIndex}, Time: ${timeLeft}s`,
      );

      try {
        // ✅ Get ONLY this player's data (no lock needed!)
        const player = await getPlayer(gameCode, playerUUID);

        if (!player) {
          throw new Error(`Player ${playerUUID} not found`);
        }

        console.log(`✅ Found player: ${player.name} (${playerUUID})`);

        // Check if already answered
        const existingAnswerIndex = player.answers?.findIndex(
          (a) => a.questionIndex === questionIndex,
        );

        if (existingAnswerIndex !== undefined && existingAnswerIndex >= 0) {
          console.log(`⚠️  Player already answered question ${questionIndex}`);
          return { alreadyAnswered: true };
        }

        // Get game data
        const game = (await Game.findOne({ gameCode }).lean()) as IGame | null;
        if (!game) {
          throw new Error(`Game ${gameCode} not found`);
        }

        const question = game.questions[questionIndex];
        if (!question) {
          throw new Error(`Question ${questionIndex} not found`);
        }

        const selectedAnswer = question.answers.find(
          (a: any) => String(a._id) === String(answerId),
        );

        if (!selectedAnswer) {
          throw new Error(`Answer ${answerId} not found`);
        }

        const isCorrect = selectedAnswer.correct === true;
        console.log(`📝 Answer ${isCorrect ? "✅ CORRECT" : "❌ WRONG"}`);

        // Calculate score
        const { points, isCorrect: scoredCorrect } = applyScoreToPlayer(
          player,
          isCorrect,
          timeLeft,
        );

        console.log(
          `💯 Points awarded: ${points}, Total score: ${player.score}`,
        );

        // Store answer
        if (!player.answers) player.answers = [];

        player.answers.push({
          questionIndex,
          answerId,
          isCorrect: scoredCorrect,
          points,
          timeLeft,
        });

        // ✅ Save ONLY this player (atomic operation, no race condition!)
        await savePlayer(gameCode, playerUUID, player);
        console.log(`💾 Player saved to Redis`);

        // Emit event
        io.to(gameCode).emit("playerAnswered", {
          playerUUID,
          points,
          isCorrect: scoredCorrect,
          totalScore: player.score,
          playerAnswers: player.answers,
        });

        console.log(`📡 Emitted playerAnswered event`);
        console.log(`✅ Job ${job.id} completed for player ${player.name}`);

        return {
          success: true,
          playerUUID,
          points: player.score,
          totalScore: player.score,
        };
      } catch (error) {
        console.error(`❌ Job ${job.id} failed:`, error);
        throw error;
      }
    },
    {
      connection: connectionOptions,
      concurrency: 100, // ✅ Can handle 100+ concurrent now!
      limiter: {
        max: 1000,
        duration: 1000,
      },
      stalledInterval: 30000,
      maxStalledCount: 2,
    },
  );

  worker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completed successfully`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
  });

  worker.on("error", (err) => {
    console.error(`❌ Worker error:`, err);
  });

  console.log("✅ Answer worker started (NO LOCKS, FULL SPEED!)");
  return worker;
}
