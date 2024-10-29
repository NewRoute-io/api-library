import z from "zod";
import { SubscriptionValidator } from "./subscription.interface.js";

const getUserSubsSchema = z.object({
  userId: z.string(),
});

const createCheckoutSchema = getUserSubsSchema.extend({
  priceId: z.string(),
  seats: z.number().min(0).default(1),
});

const updateUserSubSchema = getUserSubsSchema.extend({
  subscriptionId: z.string(),
  newPriceId: z.string(),
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

    async validateUpdateUserSub(payload) {
      return await updateUserSubSchema.parseAsync(payload);
    },

    async validateCancelSubscription(payload) {
      return await cancelSubscriptionSchema.parseAsync(payload);
    },
  };
};
