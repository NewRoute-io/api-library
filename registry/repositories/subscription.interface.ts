export interface UserSubscriptionRepository {
  getUserSubscriptions: (userId: string) => Promise<UserSubscription[]>;
  createUserSubscription: (
    props: CreateUserSubscription
  ) => Promise<UserSubscription>;
  removeUserSubscription: (userId: string, subId: string) => void;
}

type CreateUserSubscription = {
  plan: string;
  userId: string;
  customerId: string;
  subscriptionId: string;
};

export interface UserSubscription extends CreateUserSubscription {
  createdAt: string;
}
