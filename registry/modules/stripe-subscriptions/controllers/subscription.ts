import Stripe from "stripe";

import { UserSubscriptionRepository } from "@/repositories/subscription.interface.js";

const STRIPE_API_KEY = process.env.STRIPE_API_KEY as string;

const stripe = new Stripe(STRIPE_API_KEY);

// TODO: Get tiered pricing
type SubscriptionPrices = {
  currency: string;
  amount: number | null;
};

type Subscription = {
  key: string;
  priceId: string;
  name: string;
  description: string | null;
  interval: "day" | "week" | "month" | "year";
  price: SubscriptionPrices;
  priceType: "per_unit" | "tiered";
  features?: string[];
};

type UserSubsOutput = {
  plan: string;
  subscriptionId: string;
  createdAt: string;
};

interface SubscriptionsController {
  getSubTypes: () => Promise<Subscription[]>;
  getUserSubscriptions: (
    userId: string
  ) => Promise<{ subscriptions: UserSubsOutput[] }>;
  createSubCheckout: (priceId: string) => void;
  updateSub: () => void;
  deleteSub: () => void;
}

export const createSubscriptionController = (
  userSubRepository: UserSubscriptionRepository
): SubscriptionsController => {
  return {
    async getSubTypes() {
      const stripePrices = await stripe.prices
        .list({
          active: true,
          type: "recurring",
          expand: ["data.product"],
        })
        .then((res) => res.data);

      const subscriptionOptions: Subscription[] = [];

      stripePrices.forEach((el) => {
        const product = el.product as Stripe.Product; // We can assert the type as we expand the product object
        const { name, description, marketing_features } = product;

        const key = el.lookup_key || name.toLowerCase().replaceAll(" ", "_");

        const productFeatures = marketing_features
          .filter((el) => el.name !== undefined)
          .map((el) => el.name!);

        subscriptionOptions.push({
          key,
          name,
          description,
          priceId: el.id,
          interval: el.recurring!.interval,
          priceType: el.billing_scheme,
          price: {
            currency: el.currency,
            amount: el.unit_amount,
          },
          features: productFeatures,
        });
      });

      return subscriptionOptions;
    },

    async getUserSubscriptions(userId) {
      const userSubs = await userSubRepository.getUserSubscriptions(userId);
      let subscriptions: UserSubsOutput[] = [];

      if (userSubs.length > 0) {
        subscriptions = userSubs.map((el) => ({
          plan: el.plan,
          subscriptionId: el.subscriptionId,
          createdAt: el.createdAt,
        }));
      } else {
        // No stored subscription data found -> Check with Stripe
        const stripeRes = await stripe.subscriptions.search({
          query: `status:'active' metadata['userId']:${userId}`,
          expand: ["data.items.data.price.product"],
        });

        if (stripeRes.data.length > 0) {
          // Stripe has active subscriptions for that userId
          for (const stripeSub of stripeRes.data) {
            const price = stripeSub.items.data[0].price;
            const product = price.product as Stripe.Product; // We can assert the type as we expand the product object

            const key =
              price.lookup_key ||
              product.name.toLowerCase().replaceAll(" ", "_");

            // Upsert DB with Stripe subscription data
            const userSub = await userSubRepository.createUserSubscription({
              userId,
              customerId: stripeSub.customer as string,
              subscriptionId: stripeSub.id,
              plan: key,
            });

            subscriptions.push({
              plan: key,
              subscriptionId: stripeSub.id,
              createdAt: userSub.createdAt,
            });
          }
        }
      }

      return { subscriptions };
    },

    async createSubCheckout(priceId) {
      // Get user Customer ID from DB
      // Get success/return URLs
      // If exists -> create Subscription Checkout with priceId
      // If none   -> create Subscription Checkout with email (pass from user object) TODO: Update user DB to have an email in Auth Basic
    },

    async updateSub() {},

    async deleteSub() {},
  };
};
