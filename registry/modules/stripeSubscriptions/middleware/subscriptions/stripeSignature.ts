import { RequestHandler } from "express";
import Stripe from "stripe";

import { stripeWebhookValidationError } from "@/modules/stripeSubscriptions/utils/errors/subscriptions.js";

const STRIPE_API_KEY = process.env.STRIPE_API_KEY as string;
const STRIPE_WH_SECRET = process.env.STRIPE_WH_SECRET as string;

const stripe = new Stripe(STRIPE_API_KEY);

declare global {
  namespace Express {
    interface Request {
      stripeEvent?: Stripe.Event;
    }
  }
}

export const validateStripeSignature: RequestHandler = async (req, _, next) => {
  const sig = req.header("stripe-signature");

  if (sig) {
    const body = req.body;
    const event = await stripe.webhooks.constructEventAsync(body, sig, STRIPE_WH_SECRET);
    req.stripeEvent = event;
    
    next();
  } else {
    next(
      stripeWebhookValidationError({
        name: "MissingSignature",
        message: "Stripe Signature missing",
      })
    );
  }
};
