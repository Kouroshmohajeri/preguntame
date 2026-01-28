"use client";
import React from "react";
import { useAnalytics } from "./components/hooks/useAnalytics";
import { useUserData } from "./components/hooks/useUserData";
import { useGameData } from "./components/hooks/useGameData";
import AuthBox from "./components/AuthBox/AuthBox";
import DashboardStats from "./components/DashboardStats/DashboardStats";
import UserModal from "./components/UserModal/UserModal";
import GamesCreatedModal from "./components/GamesCreatedModal/GamesCreatedModal";
import GameResultsModal from "./components/GameResultsModal/GameResultsModal";
import EmailCommunications from "./components/EmailCommunications/EmailCommunications";
import BetaAccessRequests from "./components/BetaAccessRequests/BetaAccessRequests"; // NEW IMPORT

export default function AnalyticsPage() {
  const {
    isAuthenticated,
    token,
    setToken,
    error,
    loading,
    mongoData,
    vercelData,
    handleVerify,
    refreshData,
  } = useAnalytics();

  const { users, loading: usersLoading, fetchUsers } = useUserData();
  const {
    games,
    gameResults,
    hostNames,
    loading: gamesLoading,
    fetchGames,
    fetchGameResults,
  } = useGameData();

  const [showUserModal, setShowUserModal] = React.useState(false);
  const [showGameModal, setShowGameModal] = React.useState(false);
  const [showGamesCreatedModal, setShowGamesCreatedModal] = React.useState(false);
  const [showEmailModal, setShowEmailModal] = React.useState(false);
  const [showBetaAccessModal, setShowBetaAccessModal] = React.useState(false);

  const handleUsersClick = async () => {
    setShowUserModal(true);
    await fetchUsers();
  };

  const handleGamesCreatedClick = async () => {
    setShowGamesCreatedModal(true);
    await fetchGames();
  };

  const handleGamesClick = async () => {
    setShowGameModal(true);
    await fetchGameResults();
  };

  const handleEmailClick = () => {
    setShowEmailModal(true);
  };

  const handleBetaAccessClick = () => {
    setShowBetaAccessModal(true);
  };

  if (!isAuthenticated) {
    return (
      <AuthBox
        token={token}
        setToken={setToken}
        error={error}
        loading={loading}
        onSubmit={handleVerify}
      />
    );
  }

  return (
    <>
      <DashboardStats
        mongoData={mongoData}
        vercelData={vercelData}
        onUsersClick={handleUsersClick}
        onGamesCreatedClick={handleGamesCreatedClick}
        onGamesClick={handleGamesClick}
        onEmailClick={handleEmailClick}
        onBetaAccessClick={handleBetaAccessClick}
        onRefresh={refreshData}
      />

      <UserModal
        show={showUserModal}
        onClose={() => setShowUserModal(false)}
        users={users}
        loading={usersLoading}
      />

      <GamesCreatedModal
        show={showGamesCreatedModal}
        onClose={() => setShowGamesCreatedModal(false)}
        games={games}
        hostNames={hostNames}
        loading={gamesLoading}
      />

      <GameResultsModal
        show={showGameModal}
        onClose={() => setShowGameModal(false)}
        gameResults={gameResults}
        hostNames={hostNames}
        loading={gamesLoading}
      />

      <EmailCommunications show={showEmailModal} onClose={() => setShowEmailModal(false)} />

      <BetaAccessRequests
        show={showBetaAccessModal}
        onClose={() => setShowBetaAccessModal(false)}
      />
    </>
  );
}
