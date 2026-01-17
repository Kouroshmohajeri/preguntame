import { useState } from "react";
import { GameDetail, GameResultDetail, UserDetail } from "../../types/analytics.types";
import { listGames } from "@/app/api/game/actions";
import { listUsers } from "@/app/api/users/actions";
import { getAllGameResults } from "@/app/api/gameResult/actions";

export const useGameData = () => {
  const [games, setGames] = useState<GameDetail[]>([]);
  const [gameResults, setGameResults] = useState<GameResultDetail[]>([]);
  const [hostNames, setHostNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchGames = async () => {
    setLoading(true);
    try {
      const data = await listGames();
      const gamesArray = Array.isArray(data) ? data : data.games || [];
      setGames(gamesArray);

      const uniqueHostIds: string[] = Array.from(
        new Set(gamesArray.map((g: GameDetail) => g.hostId))
      ).filter((id): id is string => typeof id === "string");

      const hostNamesMap: Record<string, string> = {};
      const allUsers = await listUsers();
      const usersData = Array.isArray(allUsers) ? allUsers : allUsers.users || [];

      uniqueHostIds.forEach((hostId) => {
        const host = usersData.find((u: UserDetail) => u._id === hostId);
        if (host) {
          hostNamesMap[hostId] = `${host.name} ${host.lastname || ""}`.trim();
        } else {
          hostNamesMap[hostId] = "Unknown Host";
        }
      });

      setHostNames(hostNamesMap);
    } catch (err) {
      console.error("Failed to fetch games", err);
      setError("Failed to load games");
    } finally {
      setLoading(false);
    }
  };

  const fetchGameResults = async () => {
    setLoading(true);
    try {
      const data = await getAllGameResults(100);
      const resultsArray = Array.isArray(data) ? data : data.gameResults || [];
      setGameResults(resultsArray);

      const uniqueHostIds: string[] = Array.from(
        new Set(resultsArray.map((g: GameResultDetail) => g.hostId))
      ).filter((id): id is string => typeof id === "string");

      const hostNamesMap: Record<string, string> = {};
      const allUsers = await listUsers();
      const usersData = Array.isArray(allUsers) ? allUsers : allUsers.users || [];

      uniqueHostIds.forEach((hostId) => {
        const host = usersData.find((u: UserDetail) => u._id === hostId);
        if (host) {
          hostNamesMap[hostId] = `${host.name} ${host.lastname || ""}`.trim();
        } else {
          hostNamesMap[hostId] = "Unknown Host";
        }
      });

      setHostNames(hostNamesMap);
    } catch (err) {
      console.error("Failed to fetch game results", err);
      setError("Failed to load game results");
    } finally {
      setLoading(false);
    }
  };

  return {
    games,
    gameResults,
    hostNames,
    loading,
    error,
    fetchGames,
    fetchGameResults,
  };
};
