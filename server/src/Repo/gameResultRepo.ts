import mongoose from "mongoose";
import GameResult from "../models/GameResult.js";

export const saveGameResult = async (resultData: any) => {
  const { hostId } = resultData;

  if (!hostId || !mongoose.Types.ObjectId.isValid(hostId)) {
    console.error("❌ Invalid hostId:", hostId);
    throw new Error("Invalid hostId");
  }

  resultData.hostId = new mongoose.Types.ObjectId(hostId);

  const result = new GameResult(resultData);
  return await result.save();
};

export async function saveTheGameResult(
  gameCode: any,
  leaderboard: any,
  hostId: any
) {
  // Convert hostId string to MongoDB ObjectId

  const hostObjectId = new mongoose.Types.ObjectId(hostId);

  return await GameResult.create({
    gameCode,
    hostId: hostObjectId,
    players: leaderboard,
    createdAt: new Date(),
  });
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
