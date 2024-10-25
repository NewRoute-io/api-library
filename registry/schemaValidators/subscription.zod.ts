import z from "zod";
import { SubscriptionValidator } from "./subscription.interface.js";

const getUserSubsSchema = z.object({
  userId: z.string(),
});

const createSubCheckoutSchema = getUserSubsSchema.extend({
  priceId: z.string(),
});

const updateUserSubSchema = getUserSubsSchema.extend({
  subscriptionId: z.string(),
  newPriceId: z.string(),
});

const cancelUserSubSchema = getUserSubsSchema.extend({
  subscriptionId: z.string(),
});

export const subscriptionValidator = (): SubscriptionValidator => {
  return {
    async validateGetUserSubs(payload) {
      return await getUserSubsSchema.parseAsync(payload);
    },

    async validateCreateSubCheckout(payload) {
      return await createSubCheckoutSchema.parseAsync(payload);
    },

    async validateUpdateUserSub(payload) {
      return await updateUserSubSchema.parseAsync(payload);
    },

    async validateCancelUserSub(payload) {
      return await cancelUserSubSchema.parseAsync(payload);
    },
  };
};
