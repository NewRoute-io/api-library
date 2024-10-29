export type GetUserSubsSchema = {
  userId: number;
};

export type CreateCheckoutSchema = {
  userId: number;
  priceId: string;
  seats: number;
};

export type GetSubscriptionSchema = {
  userId: number;
  subscriptionId: string;
};

export type UpdatePlanSchema = {
  userId: number;
  subscriptionId: string;
  newPriceId: string;
};

export type UpdateSubscriptionSeatsSchema = {
    userId: number;
    subscriptionId: string;
    newSeats: number;
}

export type CancelSubscriptionSchema = GetSubscriptionSchema;

export interface SubscriptionValidator {
  validateGetUserSubs: (
    getSubsPayload: GetUserSubsSchema
  ) => Promise<GetUserSubsSchema>;

  validateCreateCheckout: (
    createCheckoutPayload: CreateCheckoutSchema
  ) => Promise<CreateCheckoutSchema>;

  validateUpdatePlanSub: (
    updatePlanPayload: UpdatePlanSchema
  ) => Promise<UpdatePlanSchema>;

  validateUpdateSeats: (
    updateSeatsPayload: UpdateSubscriptionSeatsSchema
  ) => Promise<UpdateSubscriptionSeatsSchema>;

  validateCancelSubscription: (
    cancelSubPayload: CancelSubscriptionSchema
  ) => Promise<CancelSubscriptionSchema>;
}
