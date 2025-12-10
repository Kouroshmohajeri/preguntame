import { redis } from "../config/redis.js";

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isReady: boolean;
  score: number;
  isHost: boolean;
  uuid: string;
}

export interface Room {
  players: Record<string, Player>;
  hostId: string;
  createdAt: string;
  viewers: string[];
}

const ROOM_PREFIX = "room:";

export async function getRoom(code: string): Promise<Room | null> {
  const data = await redis.get(ROOM_PREFIX + code);
  return data ? JSON.parse(data) : null;
}

export async function saveRoom(code: string, room: Room) {
  await redis.set(ROOM_PREFIX + code, JSON.stringify(room));
}

export async function deleteRoom(code: string) {
  await redis.del(ROOM_PREFIX + code);
}

// export async function addPlayer(code: string, player: Player) {
//   const room = (await getRoom(code)) || {
//     players: {},
//     hostId: "",
//     createdAt: new Date().toISOString(),
//     viewers: [],
//   };

//   // assign host if none
//   if (!room.hostId) room.hostId = player.id;
//   player.isHost = room.hostId === player.id;

//   room.players[player.id] = player;
//   await saveRoom(code, room);
//   return room;
// }
export async function addPlayer(code: string, player: Player) {
  const room = (await getRoom(code)) || {
    players: {},
    hostId: "",
    createdAt: new Date().toISOString(),
    viewers: [],
  };

  // assign host if none
  if (!room.hostId) room.hostId = player.id;
  player.isHost = room.hostId === player.id;

  room.players[player.id] = player;
  await saveRoom(code, room);
  return room;
}

export async function removePlayer(code: string, id: string) {
  const room = await getRoom(code);
  if (!room) return;

  delete room.players[id];
  room.viewers = room.viewers.filter((v) => v !== id);

  // delete room if empty
  if (Object.keys(room.players).length === 0 && room.viewers.length === 0) {
    await deleteRoom(code);
    return;
  }

  await saveRoom(code, room);
}

export async function addViewer(code: string, id: string) {
  const room = (await getRoom(code)) || {
    players: {},
    hostId: "",
    createdAt: new Date().toISOString(),
    viewers: [],
  };
  if (!room.viewers.includes(id)) room.viewers.push(id);
  await saveRoom(code, room);
  return room;
}

export async function toggleReady(
  code: string,
  playerId: string,
  isReady: boolean
) {
  const room = await getRoom(code);
  if (!room || !room.players[playerId]) return;
  room.players[playerId].isReady = isReady;
  await saveRoom(code, room);
  return room;
}
