import z from "zod";
import { SubscriptionValidator } from "./subscription.interface.js";

const getUserSubsSchema = z.object({
  userId: z.number(),
});

const createCheckoutSchema = getUserSubsSchema.extend({
  priceId: z.string(),
  seats: z.number().min(0).default(1),
});

const updatePlanSchema = getUserSubsSchema.extend({
  subscriptionId: z.string(),
  newPriceId: z.string(),
});

const updateSeatsSchema = getUserSubsSchema.extend({
  subscriptionId: z.string(),
  newSeats: z.number().min(0),
});

const addUserToSeatSchema = getUserSubsSchema.extend({
  subscriptionId: z.string(),
});

const cancelSubscriptionSchema = getUserSubsSchema.extend({
  subscriptionId: z.string(),
});

export const subscriptionValidator = (): SubscriptionValidator => {
  return {
    async validateGetUserSubs(payload) {
      return await getUserSubsSchema.parseAsync(payload);
    },

    async validateCreateCheckout(payload) {
      return await createCheckoutSchema.parseAsync(payload);
    },

    async validateCreatePaymentLink(payload) {
      return await createCheckoutSchema.parseAsync(payload);
    },

    async validateUpdatePlanSub(payload) {
      return await updatePlanSchema.parseAsync(payload);
    },

    async validateUpdateSeats(payload) {
      return await updateSeatsSchema.parseAsync(payload);
    },

    async validateAddUserToSeat(payload) {
      return await addUserToSeatSchema.parseAsync(payload);
    },

    async validateRemoveUserFromSeat(payload) {
      return await addUserToSeatSchema.parseAsync(payload);
    },

    async validateCancelSubscription(payload) {
      return await cancelSubscriptionSchema.parseAsync(payload);
    },
  };
};
