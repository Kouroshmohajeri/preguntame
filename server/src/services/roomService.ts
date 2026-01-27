import { redis } from "../config/redis.js";
import { Player, Room } from "../types/gameTypes.js";
import { getPlayer, savePlayer, getAllPlayers } from "./redisClient.js";

const ROOM_PREFIX = "room:";

export async function getRoom(code: string): Promise<Room | null> {
  const data = await redis.get(ROOM_PREFIX + code);
  if (!data) return null;

  const room = JSON.parse(data) as Room;
  room.players = await getAllPlayers(code);

  return room;
}

export async function saveRoom(code: string, room: Room) {
  const { players, ...metadata } = room;

  // Save metadata
  await redis.set(ROOM_PREFIX + code, JSON.stringify(metadata), { EX: 3600 });

  // Save players individually (no pipeline needed)
  for (const [uuid, player] of Object.entries(players)) {
    await redis.hset(
      `${ROOM_PREFIX}${code}:players`,
      uuid,
      JSON.stringify(player),
    );
  }
}

export async function deleteRoom(code: string) {
  await redis.del(ROOM_PREFIX + code);
  await redis.del(`${ROOM_PREFIX}${code}:players`);
}

export async function addPlayer(code: string, player: Player) {
  const roomData = await redis.get(ROOM_PREFIX + code);
  let room: Room;

  if (!roomData) {
    room = {
      players: {},
      hostId: "",
      createdAt: new Date().toISOString(),
      viewers: [],
      gameStarted: false,
      currentQuestion: 0,
    };
  } else {
    room = JSON.parse(roomData);
    if (!room.players) room.players = {};
  }

  if (!room.hostId) room.hostId = player.id;
  player.isHost = room.hostId === player.id;

  if (!player.currentQuestion) player.currentQuestion = 0;
  if (!player.answers) player.answers = [];

  await savePlayer(code, player.uuid || player.id, player);

  room.players = await getAllPlayers(code);

  const { players, ...metadata } = room;
  await redis.set(ROOM_PREFIX + code, JSON.stringify(metadata), { EX: 3600 });

  return room;
}

export async function removePlayer(code: string, id: string) {
  const room = await getRoom(code);
  if (!room) return;

  delete room.players[id];
  room.viewers = room.viewers.filter((v) => v !== id);

  if (Object.keys(room.players).length === 0 && room.viewers.length === 0) {
    await deleteRoom(code);
    return;
  }

  await saveRoom(code, room);
}

export async function addViewer(code: string, id: string) {
  const roomData = await redis.get(ROOM_PREFIX + code);
  let room: Room;

  if (!roomData) {
    room = {
      players: {},
      hostId: "",
      createdAt: new Date().toISOString(),
      viewers: [],
      gameStarted: false,
      currentQuestion: 0,
    };
  } else {
    room = JSON.parse(roomData);
    if (!room.players) room.players = {};
  }

  if (!room.viewers.includes(id)) room.viewers.push(id);

  const { players, ...metadata } = room;
  await redis.set(ROOM_PREFIX + code, JSON.stringify(metadata), { EX: 3600 });

  room.players = await getAllPlayers(code);

  return room;
}

export async function toggleReady(
  code: string,
  playerId: string,
  isReady: boolean,
) {
  const room = await getRoom(code);
  if (!room || !room.players[playerId]) return;

  const player = room.players[playerId];
  player.isReady = isReady;

  await savePlayer(code, player.uuid || playerId, player);

  return await getRoom(code);
}
