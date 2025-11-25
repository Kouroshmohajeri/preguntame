import Leaderboard, {
  LeaderboardDocument,
  LeaderboardPlayer,
} from "../models/Leaderboard.js";

export const createLeaderboard = async (hostId: string, gameCode: string) => {
  const leaderboard = new Leaderboard({ host: hostId, gameCode, players: [] });
  return leaderboard.save();
};

export const addOrUpdatePlayer = async (
  gameCode: string,
  player: LeaderboardPlayer
): Promise<LeaderboardDocument | null> => {
  const leaderboard = await Leaderboard.findOne({ gameCode });
  if (!leaderboard) return null;

  const existingPlayerIndex = leaderboard.players.findIndex(
    (p) => p.id === player.id
  );
  if (existingPlayerIndex !== -1) {
    leaderboard.players[existingPlayerIndex] = player;
  } else {
    leaderboard.players.push(player);
  }

  return leaderboard.save();
};

export const getLeaderboard = async (gameCode: string) => {
  return Leaderboard.findOne({ gameCode });
};
