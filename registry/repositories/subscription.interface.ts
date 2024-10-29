export interface UserSubscriptionRepository {
  getUserSubscriptions: (userId: number) => Promise<UserSubscription[]>;
  getSubscriptionUsers: (subscriptionId: string) => Promise<UserSubscription[]>;
  createUserSubscription: (
    props: CreateUserSubscription
  ) => Promise<UserSubscription>;
  removeUserSubscription: (subscriptionId: string) => void;
}

type CreateUserSubscription = {
  plan: string;
  userId: number;
  customerId?: string;
  subscriptionId: string;
};

export interface UserSubscription extends CreateUserSubscription {
  isOwner: boolean;
  createdAt: string;
}
