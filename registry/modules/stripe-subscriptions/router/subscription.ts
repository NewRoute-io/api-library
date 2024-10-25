import express from "express";

import { subscriptionValidator } from "@/schemaValidators/subscription.zod.js";
import { createSubscriptionController } from "../controllers/subscription.js";
import { createUserSubRepository } from "@/repositories/subscription.postgres.js";

import { protectedRoute } from "@/modules/auth-basic/middleware/authBasic/jwt.js";
import { response } from "@/modules/shared/utils/response.js";

const router = express.Router();

const userSubRepository = createUserSubRepository();
const subscriptionController = createSubscriptionController(userSubRepository);

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
      .validateCancelUserSub({
        userId: user.userId,
        subscriptionId,
      })
      .then(subscriptionController.cancelUserSub)
      .then(() => res.json(response()))
      .catch(next);
  })
  .post(protectedRoute, async (req, res, next) => {
    const user = req.user!;
    const { subscriptionId } = req.params;

    await subscriptionValidator()
      .validateCancelUserSub({
        userId: user.userId,
        subscriptionId,
      })
      .then(subscriptionController.stopUserSubCancellation)
      .then(() => res.json(response()))
      .catch(next);
  });

router.get("/checkout/:priceId", protectedRoute, async (req, res, next) => {
  const user = req.user!;
  const { priceId } = req.params;

  await subscriptionValidator()
    .validateCreateSubCheckout({
      userId: user.userId,
      priceId,
    })
    .then(subscriptionController.createSubCheckout)
    .then((result) => res.json(response(result)))
    .catch(next);
});

// TODO: Stripe Webhooks

export { router };
