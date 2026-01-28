// src/routes/subscriptionRoutes.ts
import { Router } from "express";
import {
  createCheckoutSession,
  createSubscription,
} from "../services/subscriptionService.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// Create Stripe Checkout Session
router.post(
  "/create-checkout-session",
  authMiddleware,
  async (req: any, res) => {
    try {
      const { plan, billingCycle } = req.body;

      // req.user comes from authMiddleware (has id and email)
      const { sessionUrl, sessionId } = await createCheckoutSession(
        req.user.id, // ✅ User ID from JWT
        req.user.email, // ✅ Email from JWT
        plan,
        billingCycle
      );

      res.json({ url: sessionUrl, sessionId }); // ✅ Return 'url' field
    } catch (err: any) {
      console.error("Create checkout error:", err);
      res.status(400).json({ error: err.message });
    }
  }
);

// Internal subscription creation (called by webhook)
router.post("/subscribe", authMiddleware, async (req: any, res) => {
  try {
    const { plan, billingCycle } = req.body;
    const subscription = await createSubscription(
      req.user.id,
      plan,
      billingCycle
    );
    res.json(subscription);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
