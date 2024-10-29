export interface UserSubscriptionRepository {
  getUserSubscriptions: (userId: number) => Promise<UserSubscription[]>;
  getSubscriptionUsers: (subscriptionId: string) => Promise<UserSubscription[]>;
  createUserSubscription: (
    props: CreateUserSubscription
  ) => Promise<UserSubscription>;
  removeUserFromSubscription: (userId: number, subscriptionId: string) => void;
  removeUserSubscription: (subscriptionId: string) => void;
}

type CreateUserSubscription = {
  plan: string;
  userId: number;
  customerId?: string;
  subscriptionId: string;
  isOwner?: boolean;
};

export interface UserSubscription extends CreateUserSubscription {
  isOwner: boolean;
  createdAt: string;
}
