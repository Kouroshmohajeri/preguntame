import Redis from "ioredis";
import { Room, Player } from "../types/gameTypes.js";

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  enableAutoPipelining: true,
  autoPipeliningIgnoredCommands: [],
});
// Clean up all room data (use when host starts fresh game)
export async function cleanupRoom(gameCode: string): Promise<void> {
  const pipeline = redis.pipeline();

  // Delete all room-related keys
  pipeline.del(`room:${gameCode}`);
  pipeline.del(`room:${gameCode}:metadata`);
  pipeline.del(`room:${gameCode}:players`);
  pipeline.del(`leaderboard:${gameCode}`);

  // Optional: Delete any other game-related keys
  // pipeline.del(`room:${gameCode}:answers`);

  await pipeline.exec();

  console.log(`🧹 Cleaned up room data for ${gameCode}`);
}

// Player operations (already optimal)
export async function getPlayer(
  gameCode: string,
  playerUUID: string,
): Promise<Player | null> {
  const data = await redis.hget(`room:${gameCode}:players`, playerUUID);
  if (!data) return null;
  return JSON.parse(data);
}

export async function savePlayer(
  gameCode: string,
  playerUUID: string,
  player: Player,
): Promise<void> {
  await redis.hset(
    `room:${gameCode}:players`,
    playerUUID,
    JSON.stringify(player),
  );
}

export async function getAllPlayers(
  gameCode: string,
): Promise<Record<string, Player>> {
  const data = await redis.hgetall(`room:${gameCode}:players`);
  const players: Record<string, Player> = {};

  for (const [uuid, playerData] of Object.entries(data)) {
    players[uuid] = JSON.parse(playerData);
  }

  return players;
}

// Room metadata operations
export async function getRoom(gameCode: string): Promise<Room | null> {
  const [metadataStr, playersData] = await Promise.all([
    redis.get(`room:${gameCode}:metadata`),
    redis.hgetall(`room:${gameCode}:players`),
  ]);

  if (!metadataStr) return null;

  const metadata = JSON.parse(metadataStr);
  const players: Record<string, Player> = {};

  for (const [uuid, playerData] of Object.entries(playersData)) {
    players[uuid] = JSON.parse(playerData);
  }

  return {
    ...metadata,
    players,
  };
}

export async function saveRoom(gameCode: string, room: Room): Promise<void> {
  const metadata = {
    hostId: room.hostId,
    viewers: room.viewers,
    createdAt: room.createdAt,
    gameStarted: room.gameStarted,
    currentQuestion: room.currentQuestion,
  };

  await redis.set(
    `room:${gameCode}:metadata`,
    JSON.stringify(metadata),
    "EX",
    3600,
  );
}

// NEW: Batch save player + metadata using pipeline
export async function savePlayerAndMetadata(
  gameCode: string,
  playerUUID: string,
  player: Player,
  metadata: any,
): Promise<void> {
  const pipeline = redis.pipeline();

  pipeline.hset(`room:${gameCode}:players`, playerUUID, JSON.stringify(player));

  pipeline.set(
    `room:${gameCode}:metadata`,
    JSON.stringify(metadata),
    "EX",
    3600,
  );

  await pipeline.exec();
}

export async function deleteRoom(gameCode: string): Promise<void> {
  await Promise.all([
    redis.del(`room:${gameCode}:metadata`),
    redis.del(`room:${gameCode}:players`),
  ]);
}

export default redis;
