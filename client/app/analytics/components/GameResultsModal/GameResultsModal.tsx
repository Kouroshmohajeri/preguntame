"use client";
import { useState } from "react";
import {
  TrendUp,
  X,
  MagnifyingGlass,
  CaretDown,
  CaretUp,
  CheckCircle,
  XCircle,
  Target,
} from "@phosphor-icons/react";
import { GameResultDetail } from "../../types/analytics.types";
import BulkActions from "../BulkActions/BulkActions";
import styles from "./GameResultsModal.module.css";

interface GameResultsModalProps {
  show: boolean;
  onClose: () => void;
  gameResults: GameResultDetail[];
  hostNames: Record<string, string>;
  loading: boolean;
}

export default function GameResultsModal({
  show,
  onClose,
  gameResults,
  hostNames,
  loading,
}: GameResultsModalProps) {
  const [search, setSearch] = useState("");
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set());
  const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set());

  if (!show) return null;

  const filteredGames = gameResults.filter((game) => {
    const searchLower = search.toLowerCase();
    return (
      game.gameCode.toLowerCase().includes(searchLower) ||
      hostNames[game.hostId]?.toLowerCase().includes(searchLower) ||
      game.players.some((p) => p.name.toLowerCase().includes(searchLower))
    );
  });

  const toggleResultSelection = (resultId: string) => {
    setSelectedResults((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(resultId)) {
        newSet.delete(resultId);
      } else {
        newSet.add(resultId);
      }
      return newSet;
    });
  };

  const toggleAllResults = () => {
    if (selectedResults.size === filteredGames.length) {
      setSelectedResults(new Set());
    } else {
      setSelectedResults(new Set(filteredGames.map((g) => g._id)));
    }
  };

  const togglePlayersExpanded = (gameId: string) => {
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
    if (selectedResults.size === 0) return;
    if (confirm(`Delete ${selectedResults.size} selected game results?`)) {
      console.log("Delete game results:", Array.from(selectedResults));
      // TODO: Implement actual delete logic
      setSelectedResults(new Set());
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <TrendUp size={28} weight="fill" /> Game Results
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} weight="bold" />
          </button>
        </div>

        <div className={styles.searchBarContainer}>
          <MagnifyingGlass size={20} weight="bold" className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by game code, host, or player..."
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

        <BulkActions selectedCount={selectedResults.size} onDelete={handleBulkDelete} />

        <div className={styles.modalBody}>
          {loading ? (
            <div className={styles.modalLoading}>Loading...</div>
          ) : (
            <div className={styles.gameList}>
              {filteredGames.length > 0 && (
                <div className={styles.selectAllContainer}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={
                        selectedResults.size === filteredGames.length && filteredGames.length > 0
                      }
                      onChange={toggleAllResults}
                      className={styles.checkbox}
                    />
                    <span>Select All ({filteredGames.length})</span>
                  </label>
                </div>
              )}

              {filteredGames.length === 0 ? (
                <div className={styles.noResults}>No games found</div>
              ) : (
                filteredGames.map((game) => (
                  <div key={game._id} className={styles.gameCard}>
                    <label className={styles.cardCheckbox}>
                      <input
                        type="checkbox"
                        checked={selectedResults.has(game._id)}
                        onChange={() => toggleResultSelection(game._id)}
                        className={styles.checkbox}
                      />
                    </label>

                    <div className={styles.gameHeader}>
                      <div className={styles.gameCode}>#{game.gameCode}</div>
                      <div className={styles.gameDate}>
                        {new Date(game.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className={styles.gameHost}>
                      <strong>Host:</strong> {hostNames[game.hostId] || "Loading..."}
                    </div>

                    <div className={styles.gamePlayers}>
                      <button
                        className={styles.togglePlayersButton}
                        onClick={() => togglePlayersExpanded(game._id)}
                      >
                        <h4 className={styles.playersTitle}>Players ({game.players.length})</h4>
                        {expandedGames.has(game._id) ? (
                          <CaretUp size={20} weight="bold" />
                        ) : (
                          <CaretDown size={20} weight="bold" />
                        )}
                      </button>

                      <div
                        className={`${styles.playersList} ${
                          expandedGames.has(game._id) ? styles.playersExpanded : ""
                        }`}
                      >
                        {game.players.map((player, idx) => (
                          <div key={idx} className={styles.playerItem}>
                            {player.avatar && (
                              <img
                                src={player.avatar}
                                alt={player.name}
                                className={styles.playerAvatar}
                              />
                            )}
                            <div className={styles.playerInfo}>
                              <div className={styles.playerName}>
                                {player.name}
                                {player.isAssigned && (
                                  <span className={styles.assignedBadge}>
                                    <CheckCircle size={14} weight="fill" /> Assigned
                                  </span>
                                )}
                              </div>
                              <div className={styles.playerScore}>
                                <Target size={16} weight="fill" /> {player.score} pts
                              </div>
                            </div>
                            <div className={styles.playerResults}>
                              <span className={styles.correct}>
                                <CheckCircle size={16} weight="fill" /> {player.correct}
                              </span>
                              <span className={styles.wrong}>
                                <XCircle size={16} weight="fill" /> {player.wrong}
                              </span>
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
