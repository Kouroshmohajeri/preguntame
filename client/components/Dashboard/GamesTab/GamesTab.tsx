"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Game, UserData, FilterType, SortType } from "../type";
import GameFilters from "./GameFilters";
import GameCard from "./GameCard";
import { Joystick } from "@phosphor-icons/react";
import styles from "./GamesTab.module.css";

interface Props {
  games: Game[];
  setGames: React.Dispatch<React.SetStateAction<Game[]>>;
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  setDeleteModal: React.Dispatch<
    React.SetStateAction<{ isOpen: boolean; gameCode: string; gameTitle: string }>
  >;
  setShareModal: React.Dispatch<
    React.SetStateAction<{ isOpen: boolean; gameCode: string; gameTitle: string; email: string }>
  >;
  session: any;
}

export default function GamesTab({
  games,
  setGames,
  userData,
  setUserData,
  setDeleteModal,
  setShareModal,
  session,
}: Props) {
  const router = useRouter();
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [activeSort, setActiveSort] = useState<SortType>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and sort games
  const filteredAndSortedGames = useMemo(() => {
    let filteredGames = [...games];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredGames = filteredGames.filter(
        (game) =>
          game.title.toLowerCase().includes(query) || game.gameCode.toLowerCase().includes(query)
      );
    }

    // Apply category filters
    switch (activeFilter) {
      case "recent":
        filteredGames = filteredGames.filter(
          (game) => new Date(game.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
        break;
      case "oldest":
        filteredGames = filteredGames.filter(
          (game) => new Date(game.createdAt) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );
        break;
      case "manyQuestions":
        filteredGames = filteredGames.filter((game) => game.questions.length > 5);
        break;
      case "fewQuestions":
        filteredGames = filteredGames.filter((game) => game.questions.length <= 5);
        break;
      case "aiGenerated": // ✅ NEW AI FILTER
        filteredGames = filteredGames.filter((game) => game.isAi === true);
        break;
      case "all":
      default:
        break;
    }

    // Apply sorting
    filteredGames.sort((a, b) => {
      let comparison = 0;
      switch (activeSort) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "date":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "questions":
          comparison = a.questions.length - b.questions.length;
          break;
        case "code":
          comparison = a.gameCode.localeCompare(b.gameCode);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filteredGames;
  }, [games, activeFilter, activeSort, sortDirection, searchQuery]);

  const clearFilters = () => {
    setActiveFilter("all");
    setActiveSort("date");
    setSortDirection("desc");
    setSearchQuery("");
  };

  return (
    <div className={styles.gamesSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>MY GAMES</h2>
        <GameFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          activeSort={activeSort}
          setActiveSort={setActiveSort}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
          showFilterDropdown={showFilterDropdown}
          setShowFilterDropdown={setShowFilterDropdown}
          showSortDropdown={showSortDropdown}
          setShowSortDropdown={setShowSortDropdown}
          clearFilters={clearFilters}
          gamesCount={filteredAndSortedGames.length}
          totalGames={games.length}
        />
      </div>

      <div className={styles.gamesList}>
        {filteredAndSortedGames.length > 0 ? (
          filteredAndSortedGames.map((game) => (
            <GameCard
              key={game._id}
              game={game}
              onShare={() =>
                setShareModal({
                  isOpen: true,
                  gameCode: game.gameCode,
                  gameTitle: game.title,
                  email: session?.user?.email ?? "",
                })
              }
              onDelete={() =>
                setDeleteModal({
                  isOpen: true,
                  gameCode: game.gameCode,
                  gameTitle: game.title,
                })
              }
            />
          ))
        ) : (
          <div className={styles.emptyState}>
            <Joystick size={50} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No Games Found</h3>
            <p className={styles.emptyText}>
              {searchQuery || activeFilter !== "all"
                ? "No games match your current filters. Try changing your search or filters."
                : "Create your first game to get started!"}
            </p>
            {(searchQuery || activeFilter !== "all") && (
              <button onClick={clearFilters} className={styles.emptyButton}>
                CLEAR FILTERS
              </button>
            )}
            {!searchQuery && activeFilter === "all" && (
              <button onClick={() => router.push("/create")} className={styles.emptyButton}>
                CREATE FIRST GAME
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
