export type GetUserSubsSchema = {
  userId: number;
};

export type CreateCheckoutSchema = {
  userId: number;
  priceId: string;
  seats?: number;
};

export type CreatePaymentLinkSchema = CreateCheckoutSchema;

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

export interface AddUserToSeatSchema extends GetSubscriptionSchema {
  addUserId: number;
}
export interface RemoveUserFromSeatSchema extends GetSubscriptionSchema {
  removeUserId: number;
}

export type CancelSubscriptionSchema = GetSubscriptionSchema;

export interface SubscriptionValidator {
  validateGetUserSubs: (
    getSubsPayload: GetUserSubsSchema
  ) => Promise<GetUserSubsSchema>;

  validateCreateCheckout: (
    createCheckoutPayload: CreateCheckoutSchema
  ) => Promise<CreateCheckoutSchema>;

  validateCreatePaymentLink: (
    createPaymentLink: CreatePaymentLinkSchema
  ) => Promise<CreatePaymentLinkSchema>;

  validateUpdatePlanSub: (
    updatePlanPayload: UpdatePlanSchema
  ) => Promise<UpdatePlanSchema>;

  validateUpdateSeats: (
    updateSeatsPayload: UpdateSubscriptionSeatsSchema
  ) => Promise<UpdateSubscriptionSeatsSchema>;

  validateAddUserToSeat: (
    addUserToSeatPayload: AddUserToSeatSchema
  ) => Promise<AddUserToSeatSchema>;

  validateRemoveUserFromSeat: (
    removeUserFromSeat: RemoveUserFromSeatSchema
  ) => Promise<RemoveUserFromSeatSchema>;

  validateCancelSubscription: (
    cancelSubPayload: CancelSubscriptionSchema
  ) => Promise<CancelSubscriptionSchema>;
}
