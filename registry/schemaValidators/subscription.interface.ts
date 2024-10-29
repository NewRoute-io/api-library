export type GetUserSubsSchema = {
  userId: string;
};

export type CreateCheckoutSchema = {
  userId: string;
  priceId: string;
  seats: number;
};

export type GetSubscriptionSchema = {
  userId: string;
  subscriptionId: string;
};

export type UpdateUserSubSchema = {
  userId: string;
  subscriptionId: string;
  newPriceId: string;
};

export type CancelSubscriptionSchema = GetSubscriptionSchema;

export interface SubscriptionValidator {
  validateGetUserSubs: (
    getSubsPayload: GetUserSubsSchema
  ) => Promise<GetUserSubsSchema>;

  validateCreateCheckout: (
    createCheckoutPayload: CreateCheckoutSchema
  ) => Promise<CreateCheckoutSchema>;

  validateUpdateUserSub: (
    updateSubPayload: UpdateUserSubSchema
  ) => Promise<UpdateUserSubSchema>;

  validateCancelSubscription: (
    cancelSubPayload: CancelSubscriptionSchema
  ) => Promise<CancelSubscriptionSchema>;
}
