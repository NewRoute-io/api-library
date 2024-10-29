import express from "express";

import { subscriptionValidator } from "@/schemaValidators/subscription.zod.js";

import { createSubscriptionController } from "@/modules/stripe-subscriptions/controllers/subscription.js";
import { createSubscriptionsWHController } from "@/modules/stripe-subscriptions/controllers/subscriptionWebhook.js";

import { createUserSubRepository } from "@/repositories/subscription.postgres.js";
import { createUserRepository } from "@/repositories/user.postgres.js";

import { validateStripeSignature } from "@/modules/stripe-subscriptions/middleware/subscriptions/stripeSignature.js";

import { protectedRoute } from "@/modules/auth-basic/middleware/authBasic/jwt.js";
import { response } from "@/modules/shared/utils/response.js";

const router = express.Router();

const userRepository = createUserRepository();
const userSubRepository = createUserSubRepository();

const subscriptionController = createSubscriptionController(
  userSubRepository,
  userRepository
);
const subscriptionWHController =
  createSubscriptionsWHController(userSubRepository);

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

router.patch(
  "/user/:subscriptionId",
  protectedRoute,
  async (req, res, next) => {
    const user = req.user!;
    const { subscriptionId } = req.params;
    const payload = req.body;

    await subscriptionValidator()
      .validateUpdateUserSub({
        ...payload,
        subscriptionId,
        userId: user.userId,
      })
      .then(subscriptionController.updateUserSub)
      .then((result) => res.json(response(result)))
      .catch(next);
  }
);

router
  .route("/user/:subscriptionId/cancel")
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

export { router };
