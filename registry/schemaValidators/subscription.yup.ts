import yup from "yup";
import { SubscriptionValidator } from "./subscription.interface.js";

const getUserSubsSchema = yup.object({
  userId: yup.string().required(),
});

const createCheckoutSchema = getUserSubsSchema.shape({
  priceId: yup.string().required(),
  seats: yup.number().min(0).default(1).required()
});

const updateUserSubSchema = getUserSubsSchema.shape({
  subscriptionId: yup.string().required(),
  newPriceId: yup.string().required(),
});

const cancelSubscriptionSchema = getUserSubsSchema.shape({
  subscriptionId: yup.string().required(),
});

export const subscriptionValidator = (): SubscriptionValidator => {
  return {
    async validateGetUserSubs(payload) {
      return await getUserSubsSchema.noUnknown().strict(true).validate(payload);
    },

    async validateCreateCheckout(payload) {
      return await createCheckoutSchema
        .noUnknown()
        .strict(true)
        .validate(payload);
    },

    async validateUpdateUserSub(payload) {
      return await updateUserSubSchema
        .noUnknown()
        .strict(true)
        .validate(payload);
    },

    async validateCancelSubscription(payload) {
      return await cancelSubscriptionSchema
        .noUnknown()
        .strict(true)
        .validate(payload);
    },
  };
};
