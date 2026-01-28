// src/services/subscriptionService.ts
import Stripe from "stripe";
import mongoose from "mongoose";
import User from "../models/User";
import Subscription from "../models/Subscription.js";
import Payment from "../models/Payment.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export const createCustomerIfNotExists = async (
  userId: string,
  email: string
) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({ email });
  user.stripeCustomerId = customer.id;
  await user.save();
  return customer.id;
};

// Create Stripe Checkout Session
export const createCheckoutSession = async (
  userId: string,
  email: string,
  plan: "starter" | "pro",
  billingCycle: "monthly" | "yearly"
) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // Get the appropriate price ID
  const priceIdEnvKey =
    plan === "starter"
      ? billingCycle === "monthly"
        ? "STRIPE_STARTER_MONTHLY_PRICE_ID"
        : "STRIPE_STARTER_YEARLY_PRICE_ID"
      : billingCycle === "monthly"
      ? "STRIPE_PRO_MONTHLY_PRICE_ID"
      : "STRIPE_PRO_YEARLY_PRICE_ID";

  const priceId = process.env[priceIdEnvKey];
  if (!priceId) throw new Error("Stripe Price ID not configured");

  // Create or get customer
  const customerId = await createCustomerIfNotExists(userId, email);

  // Determine trial period
  const trialDays = !user.hasUsedFreeTrial
    ? 7
    : plan === "pro" && billingCycle === "yearly"
    ? 14
    : 0;

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.CLIENT_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
    cancel_url: `${process.env.CLIENT_URL}/subscribe?canceled=true`,
    metadata: {
      userId,
      plan,
      billingCycle,
    },
    subscription_data:
      trialDays > 0
        ? {
            trial_period_days: trialDays,
          }
        : undefined,
  });

  return {
    sessionUrl: session.url,
    sessionId: session.id,
  };
};

// Keep existing createSubscription for webhook processing
export const createSubscription = async (
  userId: string,
  plan: "starter" | "pro",
  billingCycle: "monthly" | "yearly"
) => {
  // This function will be called by the webhook after successful payment
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const priceIdEnvKey =
    plan === "starter"
      ? billingCycle === "monthly"
        ? "STRIPE_STARTER_MONTHLY_PRICE_ID"
        : "STRIPE_STARTER_YEARLY_PRICE_ID"
      : billingCycle === "monthly"
      ? "STRIPE_PRO_MONTHLY_PRICE_ID"
      : "STRIPE_PRO_YEARLY_PRICE_ID";

  const priceId = process.env[priceIdEnvKey];
  if (!priceId) throw new Error("Stripe Price ID not configured");

  const customerId = await createCustomerIfNotExists(userId, user.email);
  const trialDays = !user.hasUsedFreeTrial ? 7 : 14;

  const subscription = (await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    trial_period_days: trialDays,
    expand: ["latest_invoice.payment_intent"],
  })) as Stripe.Subscription;

  let paymentIntent: Stripe.PaymentIntent | undefined;
  const latestInvoice = subscription.latest_invoice;

  if (latestInvoice && typeof latestInvoice !== "string") {
    const potentialPaymentIntent = (latestInvoice as any).payment_intent;

    if (potentialPaymentIntent && typeof potentialPaymentIntent !== "string") {
      paymentIntent = potentialPaymentIntent as Stripe.PaymentIntent;
    }
  }

  const mainItem = subscription.items.data[0];

  const sub = new Subscription({
    user: user._id,
    stripeSubscriptionId: subscription.id,
    plan,
    status: subscription.status as any,
    startDate: subscription.start_date
      ? new Date(subscription.start_date * 1000)
      : new Date(),
    currentPeriodEnd: mainItem?.current_period_end
      ? new Date(mainItem.current_period_end * 1000)
      : undefined,
    trialEnd: subscription.trial_end
      ? new Date(subscription.trial_end * 1000)
      : undefined,
  });

  await sub.save();

  user.currentSubscription = sub._id as any;
  user.hasUsedFreeTrial = true;
  await user.save();

  if (paymentIntent) {
    await Payment.create({
      user: user._id as any,
      subscription: sub._id as any,
      stripePaymentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status as any,
      paymentDate: new Date(paymentIntent.created * 1000),
    });
  }

  return sub;
};
