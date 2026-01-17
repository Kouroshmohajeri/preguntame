import { useState, useMemo } from "react";
import { GameDetail, FilterState, SortOption } from "../../types/analytics.types";

export const useFilters = (games: GameDetail[], hostNames: Record<string, string>) => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    questionTime: "",
    dateFrom: "",
    dateTo: "",
    host: "",
    questionCount: "",
    answerCount: "",
  });
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      questionTime: "",
      dateFrom: "",
      dateTo: "",
      host: "",
      questionCount: "",
      answerCount: "",
    });
  };

  const activeFilterCount = Object.values(filters).filter((f) => f !== "").length;

  const filteredAndSortedGames = useMemo(() => {
    return games
      .filter((game) => {
        if (!game) return false;

        // Search filter
        const searchLower = search.toLowerCase();
        const code = game.gameCode?.toLowerCase() || "";
        const title = game.title?.toLowerCase() || "";
        const hostName = hostNames[game.hostId]?.toLowerCase() || "";

        const matchesSearch =
          code.includes(searchLower) ||
          title.includes(searchLower) ||
          hostName.includes(searchLower);

        if (!matchesSearch) return false;

        // Question time filter
        if (filters.questionTime) {
          const targetTime = parseInt(filters.questionTime);
          const hasMatchingTime = game.questions.some((q) => q.time === targetTime);
          if (!hasMatchingTime) return false;
        }

        // Date range filter
        if (filters.dateFrom) {
          const gameDate = new Date(game.createdAt);
          const fromDate = new Date(filters.dateFrom);
          if (gameDate < fromDate) return false;
        }

        if (filters.dateTo) {
          const gameDate = new Date(game.createdAt);
          const toDate = new Date(filters.dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (gameDate > toDate) return false;
        }

        // Host filter
        if (filters.host) {
          const hostLower = filters.host.toLowerCase();
          const matchesHost = hostNames[game.hostId]?.toLowerCase().includes(hostLower);
          if (!matchesHost) return false;
        }

        // Question count filter
        if (filters.questionCount) {
          const targetCount = parseInt(filters.questionCount);
          if (game.questions.length !== targetCount) return false;
        }

        // Answer count filter
        if (filters.answerCount) {
          const targetAnswerCount = parseInt(filters.answerCount);
          const hasMatchingAnswerCount = game.questions.some(
            (q) => q.answers.length === targetAnswerCount
          );
          if (!hasMatchingAnswerCount) return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "date":
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case "questions":
            return b.questions.length - a.questions.length;
          case "answers":
            const avgAnswersA =
              a.questions.reduce((sum, q) => sum + q.answers.length, 0) / (a.questions.length || 1);
            const avgAnswersB =
              b.questions.reduce((sum, q) => sum + q.answers.length, 0) / (b.questions.length || 1);
            return avgAnswersB - avgAnswersA;
          default:
            return 0;
        }
      });
  }, [games, search, filters, sortBy, hostNames]);

  return {
    search,
    setSearch,
    filters,
    updateFilter,
    clearFilters,
    sortBy,
    setSortBy,
    showFilters,
    setShowFilters,
    activeFilterCount,
    filteredAndSortedGames,
  };
};
