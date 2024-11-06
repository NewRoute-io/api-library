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
    "All seats are currently used. Remove users from the subscription before reducing the seat number",
    409
  );
};

export const noAvailableSeats = () => {
  return new HttpError(
    "NoAvailableSeats",
    "Can't add this user to the subscription as there are no available seats to assign. Add more seats and try again",
    409
  );
};

export const cantRemoveSubOwner = () => {
  return new HttpError(
    "CantRemoveSubOwner",
    "The subscription owner can't be removed. To remove a subscription for the owner you need to cancel the subscription",
    400
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

export const notAuthorizedToModifySubscription = () => {
  return new HttpError(
    "NotAuthorizedToModifySubscription",
    `User not authorized to modify this subscription. Only subscription owners can modify subscription details`,
    401
  );
};
