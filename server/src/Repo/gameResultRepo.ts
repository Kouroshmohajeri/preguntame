// gameResultRepo.ts
import mongoose from "mongoose";
import GameResult from "../models/GameResult.js";

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
  const result = await GameResult.findOneAndUpdate(
    { gameCode }, // Filter by gameCode
    resultData, // Replace with new data
    {
      upsert: true, // Insert if doesn't exist
      new: true, // Return the updated document
      setDefaultsOnInsert: true, // Apply schema defaults on insert
    }
  );

  return result;
};

export async function saveTheGameResult(
  gameCode: any,
  leaderboard: any,
  hostId: any
) {
  const hostObjectId = new mongoose.Types.ObjectId(hostId);

  // Use upsert instead of create
  return await GameResult.findOneAndUpdate(
    { gameCode }, // Find by gameCode
    {
      gameCode,
      hostId: hostObjectId,
      players: leaderboard,
      createdAt: new Date(),
    },
    {
      upsert: true, // Insert if doesn't exist
      new: true, // Return the updated document
    }
  );
}

export const checkGameCodeExists = async (gameCode: string) => {
  return await GameResult.exists({ gameCode });
};

export const markPlayerAsAssigned = async (gameCode: string, uuid: string) => {
  return await GameResult.findOneAndUpdate(
    { gameCode, "players.uuid": uuid },
    { $set: { "players.$.isAssigned": true } },
    { new: true }
  );
};

export const deleteGameResultByCode = async (gameCode: string) => {
  return await GameResult.findOneAndDelete({ gameCode });
};

export const getGameResultByCode = async (gameCode: string) => {
  return await GameResult.findOne({ gameCode });
};
