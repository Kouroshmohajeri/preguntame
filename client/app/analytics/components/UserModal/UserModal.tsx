"use client";
import { useState } from "react";
import {
  Users,
  X,
  MagnifyingGlass,
  Envelope,
  Phone,
  GameController,
  Trophy,
  CheckCircle,
  XCircle,
  CreditCard,
} from "@phosphor-icons/react";
import { UserDetail } from "../../types/analytics.types";
import BulkActions from "../BulkActions/BulkActions";
import styles from "./UserModal.module.css";

interface UserModalProps {
  show: boolean;
  onClose: () => void;
  users: UserDetail[];
  loading: boolean;
}

export default function UserModal({ show, onClose, users, loading }: UserModalProps) {
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  if (!show) return null;

  const filteredUsers = users.filter((user) => {
    const searchLower = search.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.lastname?.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const toggleAllUsers = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((u) => u._id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedUsers.size === 0) return;
    if (confirm(`Delete ${selectedUsers.size} selected users?`)) {
      console.log("Delete users:", Array.from(selectedUsers));
      // TODO: Implement actual delete logic
      setSelectedUsers(new Set());
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <Users size={28} weight="fill" /> All Users
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} weight="bold" />
          </button>
        </div>

        <div className={styles.searchBarContainer}>
          <MagnifyingGlass size={20} weight="bold" className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name or email..."
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

        <BulkActions selectedCount={selectedUsers.size} onDelete={handleBulkDelete} />

        <div className={styles.modalBody}>
          {loading ? (
            <div className={styles.modalLoading}>Loading...</div>
          ) : (
            <div className={styles.userList}>
              {filteredUsers.length > 0 && (
                <div className={styles.selectAllContainer}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={
                        selectedUsers.size === filteredUsers.length && filteredUsers.length > 0
                      }
                      onChange={toggleAllUsers}
                      className={styles.checkbox}
                    />
                    <span>Select All ({filteredUsers.length})</span>
                  </label>
                </div>
              )}

              {filteredUsers.length === 0 ? (
                <div className={styles.noResults}>No users found</div>
              ) : (
                filteredUsers.map((user) => (
                  <div key={user._id} className={styles.userCard}>
                    <label className={styles.cardCheckbox}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user._id)}
                        onChange={() => toggleUserSelection(user._id)}
                        className={styles.checkbox}
                      />
                    </label>

                    <div className={styles.userHeader}>
                      {user.avatar && (
                        <img src={user.avatar} alt={user.name} className={styles.userAvatar} />
                      )}
                      <div>
                        <h3 className={styles.userName}>
                          {user.name} {user.lastname || ""}
                        </h3>
                        <p className={styles.userEmail}>
                          <Envelope size={16} weight="fill" /> {user.email}
                        </p>
                        {user.phoneNumber && (
                          <p className={styles.userPhone}>
                            <Phone size={16} weight="fill" /> {user.phoneNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className={styles.userStats}>
                      <div className={styles.userStat}>
                        <GameController size={20} weight="fill" />
                        <span>{user.gamesCreated} Created</span>
                      </div>
                      <div className={styles.userStat}>
                        <Trophy size={20} weight="fill" />
                        <span>{user.gamesPlayed} Played</span>
                      </div>
                      <div className={styles.userStat}>
                        <CheckCircle size={20} weight="fill" />
                        <span>{user.correctAnswers || 0} Correct</span>
                      </div>
                      <div className={styles.userStat}>
                        <XCircle size={20} weight="fill" />
                        <span>{user.wrongAnswers || 0} Wrong</span>
                      </div>
                    </div>

                    <div className={styles.userMeta}>
                      <div className={styles.userNotifications}>
                        {user.emailNotifications ? (
                          <span className={styles.notifEnabled}>
                            <CheckCircle size={18} weight="fill" /> Notifications On
                          </span>
                        ) : (
                          <span className={styles.notifDisabled}>
                            <XCircle size={18} weight="fill" /> Notifications Off
                          </span>
                        )}
                      </div>

                      {user.currentSubscription && (
                        <div className={styles.userSubscription}>
                          <CreditCard size={18} weight="fill" />
                          <span>
                            {user.currentSubscription.plan} - {user.currentSubscription.status}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className={styles.userDate}>
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
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
