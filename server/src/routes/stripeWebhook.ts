import express, { Request, Response } from "express";
import Stripe from "stripe";
import mongoose from "mongoose";
import Subscription from "../models/Subscription.js";
import Payment from "../models/Payment.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover", // Ensure this matches your dashboard
});

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subObj = event.data.object as Stripe.Subscription;
        const sub = await Subscription.findOne({
          stripeSubscriptionId: subObj.id,
        });

        if (sub) {
          sub.status = subObj.status as any;

          // FIX 1: Access current_period_end from the first subscription item
          const mainItem = subObj.items.data[0];
          if (mainItem?.current_period_end) {
            sub.currentPeriodEnd = new Date(mainItem.current_period_end * 1000);
          }

          await sub.save();
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subObj = event.data.object as Stripe.Subscription;
        const sub = await Subscription.findOne({
          stripeSubscriptionId: subObj.id,
        });
        if (sub) {
          sub.status = "canceled";
          await sub.save();
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;

        // FIX 2: Handle missing 'subscription' property in Type definition
        // In newer API versions, access the ID directly or cast to any if types are lagging
        const subscriptionId = (invoice as any).subscription as string;
        const paymentIntentId = (invoice as any).payment_intent as string;

        if (paymentIntentId && subscriptionId) {
          const sub = await Subscription.findOne({
            stripeSubscriptionId: subscriptionId,
          });
          if (sub) {
            // FIX 3: Use Mongoose casting for ObjectId
            await Payment.create({
              user: sub.user as unknown as mongoose.Types.ObjectId,
              subscription: sub._id as unknown as mongoose.Types.ObjectId,
              stripePaymentId: paymentIntentId,
              // FIX 4: Use Invoice fields directly instead of PaymentIntent expansion
              amount: invoice.amount_paid,
              currency: invoice.currency,
              status: invoice.status,
              // Use status_transitions.paid_at or created as fallback
              paymentDate: new Date(
                (invoice.status_transitions?.paid_at || invoice.created) * 1000
              ),
            });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string;

        if (subscriptionId) {
          const sub = await Subscription.findOne({
            stripeSubscriptionId: subscriptionId,
          });
          if (sub) {
            sub.status = "past_due" as any;
            await sub.save();
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
);

export default router;
