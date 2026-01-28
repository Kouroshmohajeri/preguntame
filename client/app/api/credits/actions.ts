import { API } from "../Server";

// Get user credits and beta info
// Get user credits
export const getUserCredits = async (email: string) => {
  try {
    const response = await API.get(`/beta-access/credits/${email}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      throw new Error("404: User has not applied for AI credits");
    }
    console.error("Get user credits error:", error?.response?.data || error.message);
    throw new Error(error?.response?.data?.error || "Failed to fetch credits");
  }
};

// Check if user can generate questions
export const checkGenerationEligibility = async (email: string, creditsRequired: number = 10) => {
  const response = await API.get(
    `/beta-access/credits/${email}/eligibility?creditsRequired=${creditsRequired}`
  );
  return response.data;
};

// Deduct credits before AI generation
export const deductCredits = async (email: string, amount: number) => {
  const response = await API.post("/beta-access/credits/deduct", {
    email,
    amount,
  });
  return response.data;
};

// Refund credits if generation fails
export const refundCredits = async (email: string, amount: number) => {
  const response = await API.post("/beta-access/credits/refund", {
    email,
    amount,
  });
  return response.data;
};
