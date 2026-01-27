import { API } from "../Server";

// Create a subscription
export const createSubscription = async (
  plan: "starter" | "pro",
  billingCycle: "monthly" | "yearly"
) => {
  const response = await API.post("/subscribe/subscribe", {
    plan,
    billingCycle,
  });
  return response.data;
};

// Create Stripe Checkout Session
export const createCheckoutSession = async (
  plan: "starter" | "pro",
  billingCycle: "monthly" | "yearly"
) => {
  const response = await API.post("/subscribe/create-checkout-session", {
    plan,
    billingCycle,
  });
  return response.data;
};

// Get current user's subscription
export const getCurrentSubscription = async () => {
  const response = await API.get("/subscribe/current");
  return response.data;
};

// Cancel subscription
export const cancelSubscription = async (subscriptionId: string) => {
  const response = await API.post("/subscribe/cancel", { subscriptionId });
  return response.data;
};

// Get subscription history
export const getSubscriptionHistory = async () => {
  const response = await API.get("/subscribe/history");
  return response.data;
};

// Get payment history
export const getPaymentHistory = async () => {
  const response = await API.get("/subscribe/payments");
  return response.data;
};
