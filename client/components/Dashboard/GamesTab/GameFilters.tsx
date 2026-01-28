"use client";
import { useEffect, useRef } from "react";
import { FilterType, SortType } from "../type";
import {
  Funnel,
  ArrowsDownUp,
  CaretDown,
  CaretUp,
  X as XIcon,
  Sparkle,
} from "@phosphor-icons/react";
import styles from "./GameFilters.module.css";

interface Props {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeFilter: FilterType;
  setActiveFilter: (f: FilterType) => void;
  activeSort: SortType;
  setActiveSort: (s: SortType) => void;
  sortDirection: "asc" | "desc";
  setSortDirection: (d: "asc" | "desc") => void;
  showFilterDropdown: boolean;
  setShowFilterDropdown: (s: boolean) => void;
  showSortDropdown: boolean;
  setShowSortDropdown: (s: boolean) => void;
  clearFilters: () => void;
  gamesCount: number;
  totalGames: number;
}

export default function GameFilters({
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  activeSort,
  setActiveSort,
  sortDirection,
  setSortDirection,
  showFilterDropdown,
  setShowFilterDropdown,
  showSortDropdown,
  setShowSortDropdown,
  clearFilters,
  gamesCount,
  totalGames,
}: Props) {
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // ✅ Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowFilterDropdown, setShowSortDropdown]);

  const getFilterDisplayName = (filter: FilterType) => {
    switch (filter) {
      case "all":
        return "ALL GAMES";
      case "recent":
        return "RECENT (LAST 7 DAYS)";
      case "oldest":
        return "OLDEST (30+ DAYS)";
      case "manyQuestions":
        return "MANY QUESTIONS (5+)";
      case "fewQuestions":
        return "FEW QUESTIONS (1-5)";
      case "aiGenerated":
        return "AI GENERATED";
      default:
        return "ALL GAMES";
    }
  };

  const getSortDisplayName = () => {
    const directionIcon = sortDirection === "asc" ? <CaretUp size={12} /> : <CaretDown size={12} />;
    switch (activeSort) {
      case "title":
        return <>TITLE {directionIcon}</>;
      case "date":
        return <>DATE {directionIcon}</>;
      case "questions":
        return <>QUESTIONS {directionIcon}</>;
      case "code":
        return <>CODE {directionIcon}</>;
      default:
        return <>DATE {directionIcon}</>;
    }
  };

  const handleSortSelect = (sort: SortType) => {
    if (activeSort === sort) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setActiveSort(sort);
      setSortDirection(sort === "date" ? "desc" : "asc");
    }
    setShowSortDropdown(false);
  };

  return (
    <div className={styles.sectionActions}>
      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search games..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className={styles.clearSearchButton}
            title="Clear search"
          >
            <XIcon size={16} />
          </button>
        )}
      </div>

      {/* Filter and Sort */}
      <div className={styles.filterSortContainer}>
        <div className={styles.filterSortGroup} ref={filterRef}>
          <button
            className={styles.filterButton}
            onClick={() => {
              setShowFilterDropdown(!showFilterDropdown);
              setShowSortDropdown(false);
            }}
          >
            <Funnel size={16} />
            {getFilterDisplayName(activeFilter)}
            {showFilterDropdown ? <CaretUp size={12} /> : <CaretDown size={12} />}
          </button>
          {showFilterDropdown && (
            <div className={styles.filterDropdown}>
              <button
                className={`${styles.filterOption} ${activeFilter === "all" ? styles.filterOptionActive : ""}`}
                onClick={() => {
                  setActiveFilter("all");
                  setShowFilterDropdown(false);
                }}
              >
                ALL GAMES
              </button>
              <button
                className={`${styles.filterOption} ${activeFilter === "recent" ? styles.filterOptionActive : ""}`}
                onClick={() => {
                  setActiveFilter("recent");
                  setShowFilterDropdown(false);
                }}
              >
                RECENT (LAST 7 DAYS)
              </button>
              <button
                className={`${styles.filterOption} ${activeFilter === "oldest" ? styles.filterOptionActive : ""}`}
                onClick={() => {
                  setActiveFilter("oldest");
                  setShowFilterDropdown(false);
                }}
              >
                OLDEST (30+ DAYS)
              </button>
              <button
                className={`${styles.filterOption} ${activeFilter === "manyQuestions" ? styles.filterOptionActive : ""}`}
                onClick={() => {
                  setActiveFilter("manyQuestions");
                  setShowFilterDropdown(false);
                }}
              >
                MANY QUESTIONS (5+)
              </button>
              <button
                className={`${styles.filterOption} ${activeFilter === "fewQuestions" ? styles.filterOptionActive : ""}`}
                onClick={() => {
                  setActiveFilter("fewQuestions");
                  setShowFilterDropdown(false);
                }}
              >
                FEW QUESTIONS (1-5)
              </button>
              {/* ✅ AI FILTER OPTION */}
              <button
                className={`${styles.filterOption} ${styles.aiFilterOption} ${activeFilter === "aiGenerated" ? styles.filterOptionActive : ""}`}
                onClick={() => {
                  setActiveFilter("aiGenerated");
                  setShowFilterDropdown(false);
                }}
              >
                <Sparkle size={14} weight="fill" />
                AI GENERATED
              </button>
            </div>
          )}
        </div>

        <div className={styles.filterSortGroup} ref={sortRef}>
          <button
            className={styles.sortButton}
            onClick={() => {
              setShowSortDropdown(!showSortDropdown);
              setShowFilterDropdown(false);
            }}
          >
            <ArrowsDownUp size={16} />
            {getSortDisplayName()}
            {showSortDropdown ? <CaretUp size={12} /> : <CaretDown size={12} />}
          </button>
          {showSortDropdown && (
            <div className={styles.sortDropdown}>
              <button
                className={`${styles.sortOption} ${activeSort === "title" ? styles.sortOptionActive : ""}`}
                onClick={() => handleSortSelect("title")}
              >
                TITLE{" "}
                {activeSort === "title" &&
                  (sortDirection === "asc" ? <CaretUp size={12} /> : <CaretDown size={12} />)}
              </button>
              <button
                className={`${styles.sortOption} ${activeSort === "date" ? styles.sortOptionActive : ""}`}
                onClick={() => handleSortSelect("date")}
              >
                DATE{" "}
                {activeSort === "date" &&
                  (sortDirection === "asc" ? <CaretUp size={12} /> : <CaretDown size={12} />)}
              </button>
              <button
                className={`${styles.sortOption} ${activeSort === "questions" ? styles.sortOptionActive : ""}`}
                onClick={() => handleSortSelect("questions")}
              >
                QUESTIONS{" "}
                {activeSort === "questions" &&
                  (sortDirection === "asc" ? <CaretUp size={12} /> : <CaretDown size={12} />)}
              </button>
              <button
                className={`${styles.sortOption} ${activeSort === "code" ? styles.sortOptionActive : ""}`}
                onClick={() => handleSortSelect("code")}
              >
                CODE{" "}
                {activeSort === "code" &&
                  (sortDirection === "asc" ? <CaretUp size={12} /> : <CaretDown size={12} />)}
              </button>
            </div>
          )}
        </div>

        {(activeFilter !== "all" || activeSort !== "date" || searchQuery) && (
          <button
            onClick={clearFilters}
            className={styles.clearFiltersButton}
            title="Clear all filters"
          >
            <XIcon size={16} /> CLEAR
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {(activeFilter !== "all" || searchQuery) && (
        <div className={styles.activeFilters}>
          <span className={styles.activeFiltersLabel}>ACTIVE FILTERS:</span>
          {activeFilter !== "all" && (
            <span className={styles.activeFilterTag}>
              {getFilterDisplayName(activeFilter)}
              <button onClick={() => setActiveFilter("all")} className={styles.removeFilterButton}>
                <XIcon size={12} />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className={styles.activeFilterTag}>
              SEARCH: "{searchQuery}"
              <button onClick={() => setSearchQuery("")} className={styles.removeFilterButton}>
                <XIcon size={12} />
              </button>
            </span>
          )}
          <span className={styles.gamesCount}>
            {gamesCount} of {totalGames} games
          </span>
        </div>
      )}
    </div>
  );
}
