// gameResultRepo.ts
import mongoose from "mongoose";
import GameResult from "../models/GameResult.js";
import Game from "../models/Game.js"; // ✅ ADD THIS IMPORT

export const saveGameResult = async (resultData: any) => {
  const { hostId, gameCode } = resultData;

  if (!hostId || !mongoose.Types.ObjectId.isValid(hostId)) {
    console.error("❌ Invalid hostId:", hostId);
    throw new Error("Invalid hostId");
  }

  if (!gameCode) {
    throw new Error("gameCode is required");
  }

  resultData.hostId = new mongoose.Types.ObjectId(hostId);

  // Use findOneAndUpdate with upsert: true to replace if exists
  const result = await GameResult.findOneAndUpdate({ gameCode }, resultData, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });

  // ✅ UPDATE hasPlayed in Game model
  await Game.findOneAndUpdate(
    { gameCode },
    { $set: { hasPlayed: true } },
    { new: true },
  );

  return result;
};

export async function saveTheGameResult(
  gameCode: any,
  leaderboard: any,
  hostId: any,
) {
  const hostObjectId = new mongoose.Types.ObjectId(hostId);

  // Use upsert instead of create
  const result = await GameResult.findOneAndUpdate(
    { gameCode },
    {
      gameCode,
      hostId: hostObjectId,
      players: leaderboard,
      createdAt: new Date(),
    },
    {
      upsert: true,
      new: true,
    },
  );

  // ✅ UPDATE hasPlayed in Game model
  await Game.findOneAndUpdate(
    { gameCode },
    { $set: { hasPlayed: true } },
    { new: true },
  );

  return result;
}

export const checkGameCodeExists = async (gameCode: string) => {
  return await GameResult.exists({ gameCode });
};

export const markPlayerAsAssigned = async (gameCode: string, uuid: string) => {
  return await GameResult.findOneAndUpdate(
    { gameCode, "players.uuid": uuid },
    { $set: { "players.$.isAssigned": true } },
    { new: true },
  );
};

export const deleteGameResultByCode = async (gameCode: string) => {
  return await GameResult.findOneAndDelete({ gameCode });
};

export const getGameResultByCode = async (gameCode: string) => {
  return await GameResult.findOne({ gameCode });
};

// Get all game results
export const getAllGameResults = async (limit: number = 100) => {
  return await GameResult.find().sort({ createdAt: -1 }).limit(limit);
};
