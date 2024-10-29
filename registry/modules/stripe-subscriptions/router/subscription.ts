import express from "express";
import Stripe from "stripe";

import { subscriptionValidator } from "@/schemaValidators/subscription.zod.js";

import { createSubscriptionController } from "@/modules/stripe-subscriptions/controllers/subscription.js";
import { createSubscriptionsWHController } from "@/modules/stripe-subscriptions/controllers/subscriptionWebhook.js";

import { createUserSubRepository } from "@/repositories/subscription.postgres.js";
import { createUserRepository } from "@/repositories/user.postgres.js";

import { validateStripeSignature } from "@/modules/stripe-subscriptions/middleware/subscriptions/stripeSignature.js";

import { protectedRoute } from "@/modules/auth-basic/middleware/authBasic/jwt.js";
import { response } from "@/modules/shared/utils/response.js";

const STRIPE_API_KEY = process.env.STRIPE_API_KEY as string;

const stripe = new Stripe(STRIPE_API_KEY);
const router = express.Router();

const userRepository = createUserRepository();
const userSubRepository = createUserSubRepository();

const subscriptionController = createSubscriptionController(
  stripe,
  userSubRepository,
  userRepository
);
const subscriptionWHController = createSubscriptionsWHController(
  stripe,
  userSubRepository
);

router.get("/", async (_, res, next) => {
  await subscriptionController
    .getSubscriptions()
    .then((result) => res.json(response(result)))
    .catch(next);
});

router.get("/user", protectedRoute, async (req, res, next) => {
  const user = req.user!;

  await subscriptionValidator()
    .validateGetUserSubs({ userId: user.userId })
    .then(subscriptionController.getUserSubs)
    .then((result) => res.json(response(result)))
    .catch(next);
});

router
  .route("/:subscriptionId/seat")
  .patch(protectedRoute, async (req, res, next) => {
    const user = req.user!;
    const { subscriptionId } = req.params;
    const payload = req.body;

    await subscriptionValidator()
      .validateUpdateSeats({
        ...payload,
        userId: user.userId,
        subscriptionId,
      })
      .then(subscriptionController.updateSeats)
      .then(() => res.json(response()))
      .catch(next);
  })
  .post(protectedRoute, async (req, res, next) => {
    const user = req.user!;
    const { subscriptionId } = req.params;

    await subscriptionValidator()
      .validateAddUserToSeat({
        userId: user.userId,
        subscriptionId,
      })
      .then(subscriptionController.addUserToSeat)
      .then(() => res.json(response()))
      .catch(next);
  })
  .delete(protectedRoute, async (req, res, next) => {
    const user = req.user!;
    const { subscriptionId } = req.params;

    await subscriptionValidator()
      .validateRemoveUserFromSeat({
        userId: user.userId,
        subscriptionId,
      })
      .then(subscriptionController.removeUserFromSeat)
      .then(() => res.json(response()))
      .catch(next);
  });

router
  .route("/:subscriptionId/cancel")
  .delete(protectedRoute, async (req, res, next) => {
    const user = req.user!;
    const { subscriptionId } = req.params;

    await subscriptionValidator()
      .validateCancelSubscription({
        userId: user.userId,
        subscriptionId,
      })
      .then(subscriptionController.cancelSubscription)
      .then(() => res.json(response()))
      .catch(next);
  })
  .post(protectedRoute, async (req, res, next) => {
    const user = req.user!;
    const { subscriptionId } = req.params;

    await subscriptionValidator()
      .validateCancelSubscription({
        userId: user.userId,
        subscriptionId,
      })
      .then(subscriptionController.stopCancellation)
      .then(() => res.json(response()))
      .catch(next);
  });

router.get("/payment/checkout", protectedRoute, async (req, res, next) => {
  const user = req.user!;
  const payload = req.body;

  await subscriptionValidator()
    .validateCreateCheckout({
      ...payload,
      userId: user.userId,
    })
    .then(subscriptionController.createCheckout)
    .then((result) => res.json(response(result)))
    .catch(next);
});

router.post("webhook", validateStripeSignature, async (req, res, next) => {
  try {
    const eventPayload = req.stripeEvent!;

    subscriptionWHController.handleWebhook(eventPayload);

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
});

router.patch("/:subscriptionId", protectedRoute, async (req, res, next) => {
  const user = req.user!;
  const { subscriptionId } = req.params;
  const payload = req.body;

  await subscriptionValidator()
    .validateUpdatePlanSub({
      ...payload,
      subscriptionId,
      userId: user.userId,
    })
    .then(subscriptionController.updatePlan)
    .then((result) => res.json(response(result)))
    .catch(next);
});

export { router };
