"use client";
import { useState } from "react";
import { AnalyticsData, VercelAnalytics } from "../../types/analytics.types";

export const useAnalytics = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mongoData, setMongoData] = useState<AnalyticsData | null>(null);
  const [vercelData, setVercelData] = useState<VercelAnalytics | null>(null);

  const fetchVercelAnalytics = async () => {
    setVercelData({
      activeUsers: 0,
      topCountry: "N/A",
    });
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/analytics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error("Invalid token");
      }

      const data = await response.json();
      setMongoData(data);
      setIsAuthenticated(true);
      fetchVercelAnalytics();
    } catch (err) {
      setError("Invalid authentication code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/analytics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const data = await response.json();
        setMongoData(data);
        fetchVercelAnalytics();
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    isAuthenticated,
    token,
    setToken,
    error,
    loading,
    mongoData,
    vercelData,
    handleVerify,
    refreshData,
  };
};
