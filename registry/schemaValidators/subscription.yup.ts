import yup from "yup";
import { SubscriptionValidator } from "./subscription.interface.js";

const getUserSubsSchema = yup.object({
  userId: yup.string().required(),
});

const createSubCheckoutSchema = getUserSubsSchema.shape({
  priceId: yup.string().required(),
});

const updateUserSubSchema = getUserSubsSchema.shape({
  subscriptionId: yup.string().required(),
  newPriceId: yup.string().required(),
});

const removeUserSubSchema = getUserSubsSchema.shape({
  subscriptionId: yup.string().required(),
});

export const subscriptionValidator = (): SubscriptionValidator => {
  return {
    async validateGetUserSubs(payload) {
      return await getUserSubsSchema.noUnknown().strict(true).validate(payload);
    },

    async validateCreateSubCheckout(payload) {
      return await createSubCheckoutSchema
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

    async validateCancelUserSub(payload) {
      return await removeUserSubSchema
        .noUnknown()
        .strict(true)
        .validate(payload);
    },
  };
};
