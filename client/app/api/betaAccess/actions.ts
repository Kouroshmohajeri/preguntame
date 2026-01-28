import { API } from "../Server";

// ============= BETA ACCESS ACTIONS =============

// Request beta access (public)
export const requestBetaAccess = async (email: string, name: string) => {
  const response = await API.post("/beta-access/request", {
    email,
    name,
  });
  return response.data;
};

// Check beta access status by email (public)
export const checkBetaAccessStatus = async (email: string) => {
  const response = await API.get(`/beta-access/status/${encodeURIComponent(email)}`);
  return response.data;
};

// ============= ADMIN ACTIONS =============

// Get all beta access requests (admin only)
export const getAllBetaRequests = async () => {
  const response = await API.get("/beta-access/all");
  return response.data;
};

// Get beta access statistics (admin only)
export const getBetaAccessStats = async () => {
  const response = await API.get("/beta-access/stats");
  return response.data;
};

// Approve beta access request (admin only)
export const approveBetaAccess = async (email: string, notes?: string) => {
  const response = await API.post(`/beta-access/approve/${encodeURIComponent(email)}`, { notes });
  return response.data;
};

// Reject beta access request (admin only)
export const rejectBetaAccess = async (email: string, notes?: string) => {
  const response = await API.post(`/beta-access/reject/${encodeURIComponent(email)}`, { notes });
  return response.data;
};

// Delete beta access request (admin only)
export const deleteBetaRequest = async (email: string) => {
  const response = await API.delete(`/beta-access/${encodeURIComponent(email)}`);
  return response.data;
};
