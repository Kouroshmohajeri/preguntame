import { Queue, QueueEvents } from "bullmq";

// Connection options (not a Redis instance)
const connectionOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null, // Required for BullMQ
};

// Answer processing queue
export const answerQueue = new Queue("player-answers", {
  connection: connectionOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 200,
    },
    removeOnComplete: {
      count: 100,
      age: 3600, // 1 hour
    },
    removeOnFail: {
      count: 500,
      age: 7200, // 2 hours
    },
  },
});

// Queue health monitoring
const queueEvents = new QueueEvents("player-answers", {
  connection: connectionOptions,
});

queueEvents.on("failed", ({ jobId, failedReason }) => {
  console.error(`❌ Job ${jobId} failed:`, failedReason);
});

queueEvents.on("completed", ({ jobId }) => {
  console.log(`✅ Job ${jobId} completed`);
});

// Export connection options for the worker
export { connectionOptions };
