import { HttpError } from "@/modules/shared/utils/errors/HttpError.js";

export const subscriptionNotFound = (subscriptionId: string) => {
  return new HttpError(
    "SubscriptionNotFound",
    `This user doesn't have an active subscription that matches this subscription ID: ${subscriptionId}`,
    404
  );
};
