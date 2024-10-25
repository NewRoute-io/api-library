export type GetUserSubsSchema = {
  userId: string;
};

export type CreateSubCheckoutSchema = {
  userId: string;
  priceId: string;
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

export type CancelUserSubSchema = GetSubscriptionSchema;

export interface SubscriptionValidator {
  validateGetUserSubs: (
    getSubsPayload: GetUserSubsSchema
  ) => Promise<GetUserSubsSchema>;

  validateCreateSubCheckout: (
    createCheckoutPayload: CreateSubCheckoutSchema
  ) => Promise<CreateSubCheckoutSchema>;

  validateUpdateUserSub: (
    updateSubPayload: UpdateUserSubSchema
  ) => Promise<UpdateUserSubSchema>;

  validateCancelUserSub: (
    cancelSubPayload: CancelUserSubSchema
  ) => Promise<CancelUserSubSchema>;
}
