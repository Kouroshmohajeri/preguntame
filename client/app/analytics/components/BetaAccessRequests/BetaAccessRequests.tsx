"use client";
import { useState, useEffect } from "react";
import {
  Robot,
  X,
  MagnifyingGlass,
  CheckCircle,
  XCircle,
  Clock,
  EnvelopeSimple,
  User,
  Calendar,
  Trash,
  ArrowCounterClockwise,
} from "@phosphor-icons/react";
import {
  getAllBetaRequests,
  getBetaAccessStats,
  approveBetaAccess,
  rejectBetaAccess,
  deleteBetaRequest,
} from "@/app/api/betaAccess/actions";
import { useToast } from "@/context/ToastContext/ToastContext";
import styles from "./BetaAccessRequests.module.css";

interface BetaRequest {
  _id: string;
  email: string;
  name: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  notes?: string;
}

interface BetaStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  approvalRate: string;
}

interface BetaAccessRequestsProps {
  show: boolean;
  onClose: () => void;
}

export default function BetaAccessRequests({ show, onClose }: BetaAccessRequestsProps) {
  const [requests, setRequests] = useState<BetaRequest[]>([]);
  const [stats, setStats] = useState<BetaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const { showToast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestsData, statsData] = await Promise.all([
        getAllBetaRequests(),
        getBetaAccessStats(),
      ]);

      setRequests(requestsData.requests || []);
      setStats(statsData.stats || null);
    } catch (error: any) {
      console.error("Error fetching beta requests:", error);
      showToast(error.message || "Failed to load beta access requests", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      fetchData();
    }
  }, [show]);

  if (!show) return null;

  const handleApprove = async (email: string, requestId: string) => {
    if (!confirm(`Approve beta access for ${email}?`)) return;

    setProcessingIds((prev) => new Set(prev).add(requestId));
    try {
      await approveBetaAccess(email);
      showToast(`Beta access approved for ${email}`, "success");
      await fetchData();
    } catch (error: any) {
      console.error("Error approving request:", error);
      showToast(error.message || "Failed to approve request", "error");
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleReject = async (email: string, requestId: string) => {
    const reason = prompt(`Reason for rejecting ${email}? (optional)`);
    if (reason === null) return;

    setProcessingIds((prev) => new Set(prev).add(requestId));
    try {
      await rejectBetaAccess(email, reason || undefined);
      showToast(`Beta access rejected for ${email}`, "success");
      await fetchData();
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      showToast(error.message || "Failed to reject request", "error");
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleRevoke = async (email: string, requestId: string) => {
    if (!confirm(`Revoke beta access for ${email}? This will remove their access and credits.`))
      return;

    setProcessingIds((prev) => new Set(prev).add(requestId));
    try {
      await deleteBetaRequest(email);
      showToast(`Beta access revoked for ${email}`, "success");
      await fetchData();
    } catch (error: any) {
      console.error("Error revoking access:", error);
      showToast(error.message || "Failed to revoke access", "error");
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleRevokeRejection = async (email: string, requestId: string) => {
    if (!confirm(`Restore request from ${email} to allow them to request again?`)) return;

    setProcessingIds((prev) => new Set(prev).add(requestId));
    try {
      await deleteBetaRequest(email);
      showToast(`Rejection revoked for ${email}. They can request again.`, "success");
      await fetchData();
    } catch (error: any) {
      console.error("Error revoking rejection:", error);
      showToast(error.message || "Failed to revoke rejection", "error");
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      search === "" ||
      request.email.toLowerCase().includes(search.toLowerCase()) ||
      request.name.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === "all" || request.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <Robot size={28} weight="fill" /> Beta Access Requests
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} weight="bold" />
          </button>
        </div>

        <div className={styles.searchBarContainer}>
          <MagnifyingGlass size={20} weight="bold" className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by email or name..."
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

        {/* Stats Grid */}
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <EnvelopeSimple size={24} weight="fill" />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Total</span>
              <span className={styles.statValue}>{stats?.total || 0}</span>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.pending}`}>
            <div className={styles.statIcon}>
              <Clock size={24} weight="fill" />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Pending</span>
              <span className={styles.statValue}>{stats?.pending || 0}</span>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.approved}`}>
            <div className={styles.statIcon}>
              <CheckCircle size={24} weight="fill" />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Approved</span>
              <span className={styles.statValue}>{stats?.approved || 0}</span>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.rejected}`}>
            <div className={styles.statIcon}>
              <XCircle size={24} weight="fill" />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Rejected</span>
              <span className={styles.statValue}>{stats?.rejected || 0}</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className={styles.filterContainer}>
          <button
            className={`${styles.filterTab} ${filter === "all" ? styles.active : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({requests.length})
          </button>
          <button
            className={`${styles.filterTab} ${filter === "pending" ? styles.active : ""}`}
            onClick={() => setFilter("pending")}
          >
            <Clock size={18} weight="fill" />
            Pending ({requests.filter((r) => r.status === "pending").length})
          </button>
          <button
            className={`${styles.filterTab} ${filter === "approved" ? styles.active : ""}`}
            onClick={() => setFilter("approved")}
          >
            <CheckCircle size={18} weight="fill" />
            Approved ({requests.filter((r) => r.status === "approved").length})
          </button>
          <button
            className={`${styles.filterTab} ${filter === "rejected" ? styles.active : ""}`}
            onClick={() => setFilter("rejected")}
          >
            <XCircle size={18} weight="fill" />
            Rejected ({requests.filter((r) => r.status === "rejected").length})
          </button>
        </div>

        <div className={styles.modalBody}>
          {loading ? (
            <div className={styles.modalLoading}>Loading...</div>
          ) : (
            <div className={styles.requestList}>
              {filteredRequests.length === 0 ? (
                <div className={styles.noResults}>No requests found</div>
              ) : (
                filteredRequests.map((request) => (
                  <div
                    key={request._id}
                    className={`${styles.requestCard} ${styles[request.status]}`}
                  >
                    <div className={styles.requestHeader}>
                      <div className={styles.userInfo}>
                        <div className={styles.avatar}>
                          <User size={24} weight="fill" />
                        </div>
                        <div className={styles.userDetails}>
                          <h3 className={styles.userName}>{request.name}</h3>
                          <p className={styles.userEmail}>
                            <EnvelopeSimple size={14} weight="fill" />
                            {request.email}
                          </p>
                        </div>
                      </div>

                      <div className={styles.statusBadge}>
                        {request.status === "pending" && (
                          <>
                            <Clock size={16} weight="fill" />
                            Pending
                          </>
                        )}
                        {request.status === "approved" && (
                          <>
                            <CheckCircle size={16} weight="fill" />
                            Approved
                          </>
                        )}
                        {request.status === "rejected" && (
                          <>
                            <XCircle size={16} weight="fill" />
                            Rejected
                          </>
                        )}
                      </div>
                    </div>

                    <div className={styles.requestDates}>
                      <div className={styles.dateItem}>
                        <Calendar size={14} weight="fill" />
                        <span className={styles.dateLabel}>Requested:</span>
                        <span className={styles.dateValue}>{formatDate(request.requestedAt)}</span>
                      </div>

                      {request.approvedAt && (
                        <div className={styles.dateItem}>
                          <CheckCircle size={14} weight="fill" />
                          <span className={styles.dateLabel}>Approved:</span>
                          <span className={styles.dateValue}>{formatDate(request.approvedAt)}</span>
                        </div>
                      )}

                      {request.rejectedAt && (
                        <div className={styles.dateItem}>
                          <XCircle size={14} weight="fill" />
                          <span className={styles.dateLabel}>Rejected:</span>
                          <span className={styles.dateValue}>{formatDate(request.rejectedAt)}</span>
                        </div>
                      )}
                    </div>

                    {request.notes && (
                      <div className={styles.notes}>
                        <strong>Notes:</strong> {request.notes}
                      </div>
                    )}

                    <div className={styles.requestActions}>
                      {request.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(request.email, request._id)}
                            className={`${styles.actionButton} ${styles.approveButton}`}
                            disabled={processingIds.has(request._id)}
                          >
                            <CheckCircle size={18} weight="fill" />
                            {processingIds.has(request._id) ? "Approving..." : "Approve"}
                          </button>
                          <button
                            onClick={() => handleReject(request.email, request._id)}
                            className={`${styles.actionButton} ${styles.rejectButton}`}
                            disabled={processingIds.has(request._id)}
                          >
                            <XCircle size={18} weight="fill" />
                            {processingIds.has(request._id) ? "Rejecting..." : "Reject"}
                          </button>
                        </>
                      )}

                      {request.status === "approved" && (
                        <button
                          onClick={() => handleRevoke(request.email, request._id)}
                          className={`${styles.actionButton} ${styles.revokeButton}`}
                          disabled={processingIds.has(request._id)}
                        >
                          <Trash size={18} weight="fill" />
                          {processingIds.has(request._id) ? "Revoking..." : "Revoke Access"}
                        </button>
                      )}

                      {request.status === "rejected" && (
                        <button
                          onClick={() => handleRevokeRejection(request.email, request._id)}
                          className={`${styles.actionButton} ${styles.restoreButton}`}
                          disabled={processingIds.has(request._id)}
                        >
                          <ArrowCounterClockwise size={18} weight="fill" />
                          {processingIds.has(request._id) ? "Restoring..." : "Revoke Rejection"}
                        </button>
                      )}
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
