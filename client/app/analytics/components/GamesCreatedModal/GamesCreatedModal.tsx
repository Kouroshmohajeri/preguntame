"use client";
import { useState } from "react";
import {
  GameController,
  X,
  MagnifyingGlass,
  Question,
  CaretDown,
  CaretUp,
  CheckCircle,
} from "@phosphor-icons/react";
import { GameDetail } from "../../types/analytics.types";
import BulkActions from "../BulkActions/BulkActions";
import FilterPanel from "../FilterPanel/FilterPanel";
import { useFilters } from "../hooks/useFilters";
import styles from "./GamesCreatedModal.module.css";

interface GamesCreatedModalProps {
  show: boolean;
  onClose: () => void;
  games: GameDetail[];
  hostNames: Record<string, string>;
  loading: boolean;
}

export default function GamesCreatedModal({
  show,
  onClose,
  games,
  hostNames,
  loading,
}: GamesCreatedModalProps) {
  const [selectedGames, setSelectedGames] = useState<Set<string>>(new Set());
  const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set());

  const {
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
  } = useFilters(games, hostNames);

  if (!show) return null;

  const toggleGameSelection = (gameId: string) => {
    setSelectedGames((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(gameId)) {
        newSet.delete(gameId);
      } else {
        newSet.add(gameId);
      }
      return newSet;
    });
  };

  const toggleAllGames = () => {
    if (selectedGames.size === filteredAndSortedGames.length) {
      setSelectedGames(new Set());
    } else {
      setSelectedGames(new Set(filteredAndSortedGames.map((g) => g._id)));
    }
  };

  const toggleQuestionsExpanded = (gameId: string) => {
    setExpandedGames((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(gameId)) {
        newSet.delete(gameId);
      } else {
        newSet.add(gameId);
      }
      return newSet;
    });
  };

  const handleBulkDelete = () => {
    if (selectedGames.size === 0) return;
    if (confirm(`Delete ${selectedGames.size} selected games?`)) {
      console.log("Delete games:", Array.from(selectedGames));
      // TODO: Implement actual delete logic
      setSelectedGames(new Set());
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <GameController size={28} weight="fill" /> All Games Created
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} weight="bold" />
          </button>
        </div>

        <div className={styles.searchBarContainer}>
          <MagnifyingGlass size={20} weight="bold" className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by code, title, or host..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchBar}
          />
          {search && (
            <button onClick={() => setSearch("")} className={styles.clearSearch}>
              <X size={16} weight="bold" />
            </button>
          )}
        </div>

        <FilterPanel
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          filters={filters}
          updateFilter={updateFilter}
          clearFilters={clearFilters}
          activeFilterCount={activeFilterCount}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        <BulkActions selectedCount={selectedGames.size} onDelete={handleBulkDelete} />

        <div className={styles.modalBody}>
          {loading ? (
            <div className={styles.modalLoading}>Loading...</div>
          ) : (
            <div className={styles.gameList}>
              {filteredAndSortedGames.length > 0 && (
                <div className={styles.selectAllContainer}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={
                        selectedGames.size === filteredAndSortedGames.length &&
                        filteredAndSortedGames.length > 0
                      }
                      onChange={toggleAllGames}
                      className={styles.checkbox}
                    />
                    <span>Select All ({filteredAndSortedGames.length})</span>
                  </label>
                </div>
              )}

              {filteredAndSortedGames.length === 0 ? (
                <div className={styles.noResults}>No games found</div>
              ) : (
                filteredAndSortedGames.map((game) => (
                  <div key={game._id} className={styles.gameCard}>
                    <label className={styles.cardCheckbox}>
                      <input
                        type="checkbox"
                        checked={selectedGames.has(game._id)}
                        onChange={() => toggleGameSelection(game._id)}
                        className={styles.checkbox}
                      />
                    </label>

                    <div className={styles.gameHeader}>
                      <div className={styles.gameCode}>#{game.gameCode}</div>
                      <div className={styles.gameDate}>
                        {new Date(game.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className={styles.gameTitle}>{game.title}</div>

                    <div className={styles.gameHost}>
                      <strong>Host:</strong> {hostNames[game.hostId] || "Loading..."}
                    </div>

                    <div className={styles.gamePlayers}>
                      <button
                        className={styles.togglePlayersButton}
                        onClick={() => toggleQuestionsExpanded(game._id)}
                      >
                        <h4 className={styles.playersTitle}>
                          <Question size={20} weight="fill" /> Questions ({game.questions.length})
                        </h4>
                        {expandedGames.has(game._id) ? (
                          <CaretUp size={20} weight="bold" />
                        ) : (
                          <CaretDown size={20} weight="bold" />
                        )}
                      </button>

                      <div
                        className={`${styles.questionsList} ${
                          expandedGames.has(game._id) ? styles.questionsExpanded : ""
                        }`}
                      >
                        {game.questions.map((q, idx) => (
                          <div key={idx} className={styles.questionItem}>
                            <div className={styles.questionHeader}>
                              <strong>Q{idx + 1}:</strong> {q.text}
                            </div>
                            <div className={styles.questionMeta}>
                              <span className={styles.questionTime}>⏱️ {q.time}s</span>
                            </div>
                            <div className={styles.answersList}>
                              {q.answers.map((ans, aIdx) => (
                                <div
                                  key={aIdx}
                                  className={`${styles.answerItem} ${
                                    ans.correct ? styles.correctAnswer : ""
                                  }`}
                                >
                                  {ans.correct && <CheckCircle size={16} weight="fill" />}
                                  {ans.text}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
