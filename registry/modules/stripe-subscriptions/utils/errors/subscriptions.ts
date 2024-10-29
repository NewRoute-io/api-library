import { HttpError } from "@/modules/shared/utils/errors/HttpError.js";

export const subscriptionNotFound = (subscriptionId: string) => {
  return new HttpError(
    "SubscriptionNotFound",
    `This user doesn't have an active subscription that matches this subscription ID: ${subscriptionId}`,
    404
  );
};

export const noEmptySeatsToRemove = () => {
  return new HttpError(
    "NoEmptySeatsToRemove",
    `All seats are currently used. Remove users from the subscription before reducing the seat number`,
    409
  );
};

export const stripeWebhookValidationError = (error?: Error) => {
  return new HttpError(
    "StripeWebhookValidationError",
    `Webhook error: ${error?.message}`,
    404
  );
};

export const stripeWebhookEventNotSupported = (event: string) => {
  return new HttpError(
    "StripeWebhookEventNotSupported",
    `Webhook event not supported: ${event}`,
    400
  );
};
