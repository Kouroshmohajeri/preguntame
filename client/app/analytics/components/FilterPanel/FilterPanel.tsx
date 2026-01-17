"use client";
import { Clock, Funnel, SortAscending } from "@phosphor-icons/react";
import { FilterState, SortOption } from "../../types/analytics.types";
import styles from "./FilterPanel.module.css";

interface FilterPanelProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filters: FilterState;
  updateFilter: (key: keyof FilterState, value: string) => void;
  clearFilters: () => void;
  activeFilterCount: number;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
}

export default function FilterPanel({
  showFilters,
  setShowFilters,
  filters,
  updateFilter,
  clearFilters,
  activeFilterCount,
  sortBy,
  setSortBy,
}: FilterPanelProps) {
  return (
    <>
      <div className={styles.filterControls}>
        <button
          className={`${styles.filterToggle} ${showFilters ? styles.active : ""}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Funnel size={18} weight="bold" />
          Filters
          {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
        </button>

        <div className={styles.sortContainer}>
          <SortAscending size={18} weight="bold" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className={styles.sortSelect}
          >
            <option value="date">Date (Newest)</option>
            <option value="questions">Questions (Most)</option>
            <option value="answers">Answers (Most)</option>
          </select>
        </div>
      </div>

      {showFilters && (
        <div className={styles.filterPanel}>
          <div className={styles.filterGrid}>
            <div className={styles.filterItem}>
              <label>
                <Clock size={16} /> Question Time (seconds)
              </label>
              <input
                type="number"
                placeholder="e.g., 20"
                value={filters.questionTime}
                onChange={(e) => updateFilter("questionTime", e.target.value)}
                className={styles.filterInput}
              />
            </div>

            <div className={styles.filterItem}>
              <label>Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter("dateFrom", e.target.value)}
                className={styles.filterInput}
              />
            </div>

            <div className={styles.filterItem}>
              <label>Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter("dateTo", e.target.value)}
                className={styles.filterInput}
              />
            </div>

            <div className={styles.filterItem}>
              <label>Host Name/Email</label>
              <input
                type="text"
                placeholder="Search host..."
                value={filters.host}
                onChange={(e) => updateFilter("host", e.target.value)}
                className={styles.filterInput}
              />
            </div>

            <div className={styles.filterItem}>
              <label>Question Count</label>
              <input
                type="number"
                placeholder="e.g., 5"
                value={filters.questionCount}
                onChange={(e) => updateFilter("questionCount", e.target.value)}
                className={styles.filterInput}
              />
            </div>

            <div className={styles.filterItem}>
              <label>Answer Count</label>
              <input
                type="number"
                placeholder="e.g., 4"
                value={filters.answerCount}
                onChange={(e) => updateFilter("answerCount", e.target.value)}
                className={styles.filterInput}
              />
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button className={styles.clearFiltersBtn} onClick={clearFilters}>
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </>
  );
}
