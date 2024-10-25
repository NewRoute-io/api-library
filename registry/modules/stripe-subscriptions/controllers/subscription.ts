import Stripe from "stripe";

import {
  GetUserSubsSchema,
  CreateSubCheckoutSchema,
  CancelUserSubSchema,
  UpdateUserSubSchema,
} from "@/schemaValidators/subscription.interface.js";

import { UserSubscriptionRepository } from "@/repositories/subscription.interface.js";
import {UserRepository} from "@/repositories/user.interface.js"

import { subscriptionNotFound } from "@/modules/stripe-subscriptions/utils/errors/subscriptions.js";

const STRIPE_API_KEY = process.env.STRIPE_API_KEY as string;
const CHECKOUT_SUCCESS_URL = process.env.CHECKOUT_SUCCESS_URL;
const CHECKOUT_CANCEL_URL = process.env.CHECKOUT_CANCEL_URL;

const stripe = new Stripe(STRIPE_API_KEY);

// TODO: Usage-based pricing
type SubscriptionPrices = {
  currency: string;
  amount: number | null;
};

// TODO: Per seat pricing (using quantities?)
type Subscription = {
  plan: string;
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

interface SubscriptionController {
  getSubscriptions: () => Promise<Subscription[]>;

  getUserSubs: (
    props: GetUserSubsSchema
  ) => Promise<{ userSubscriptions: UserSubsOutput[] }>;

  createSubCheckout: (
    props: CreateSubCheckoutSchema
  ) => Promise<{ url: string }>;

  updateUserSub: (props: UpdateUserSubSchema) => Promise<UserSubsOutput>;

  cancelUserSub: (props: CancelUserSubSchema) => void;

  stopUserSubCancellation: (props: CancelUserSubSchema) => void;
}

export const createSubscriptionController = (
  userSubRepository: UserSubscriptionRepository,
  userRepository: UserRepository
): SubscriptionController => {
  return {
    async getSubscriptions() {
      const stripePrices = await stripe.prices.list({
        active: true,
        type: "recurring",
        expand: ["data.product"],
      });

      const subscriptions: Subscription[] = [];

      stripePrices.data.forEach((price) => {
        const product = price.product as Stripe.Product; // We can assert the type as we expand the product object
        const { name, description, marketing_features } = product;

        const planKey = price.lookup_key || name.toLowerCase().replaceAll(" ", "_");

        const productFeatures = marketing_features
          .filter((el) => el.name !== undefined)
          .map((el) => el.name!);

        subscriptions.push({
          plan: planKey,
          name,
          description,
          priceId: price.id,
          interval: price.recurring!.interval,
          priceType: price.billing_scheme,
          price: {
            currency: price.currency,
            amount: price.unit_amount,
          },
          features: productFeatures,
        });
      });

      return subscriptions;
    },

    async getUserSubs({ userId }) {
      const userSubs = await userSubRepository.getUserSubscriptions(userId);
      let userSubscriptions: UserSubsOutput[] = [];

      if (userSubs.length > 0) {
        userSubscriptions = userSubs.map((el) => ({
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

        for (const stripeSub of stripeRes.data) {
          // Stripe has active subscriptions for that userId
          const price = stripeSub.items.data[0].price;
          const product = price.product as Stripe.Product; // We can assert the type as we expand the product object

          const planKey =
            price.lookup_key || product.name.toLowerCase().replaceAll(" ", "_");

          // Upsert DB with Stripe subscription data
          const userSub = await userSubRepository.createUserSubscription({
            userId,
            customerId: stripeSub.customer as string,
            subscriptionId: stripeSub.id,
            plan: planKey,
          });

          userSubscriptions.push({
            plan: planKey,
            subscriptionId: stripeSub.id,
            createdAt: userSub.createdAt,
          });
        }
      }

      return { userSubscriptions };
    },

    async createSubCheckout({ userId, priceId }) {
      const userSubscription = await userSubRepository
        .getUserSubscriptions(userId)
        .then((res) => res.at(0));

      let customerData;
      if (userSubscription) {
        // Returning paying user, reuse existing Stripe Customer
        customerData = { customer: userSubscription.customerId };
      } else {
        // First time paying user, create Stripe Customer after Checkout with email
        const user = await userRepository.getUserById(userId);
        customerData = { customer_email: user?.email };
      }

      const checkout = await stripe.checkout.sessions.create({
        ...customerData,
        client_reference_id: userId,
        customer_creation: "always",
        line_items: [{ quantity: 1, price: priceId }],
        subscription_data: { metadata: { userId } },
        saved_payment_method_options: { payment_method_save: "enabled" },
        success_url: CHECKOUT_SUCCESS_URL,
        cancel_url: CHECKOUT_CANCEL_URL,
        mode: "subscription",
      });

      return { url: checkout.url! };
    },

    async updateUserSub(props) {
      const { userId, subscriptionId, newPriceId } = props;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      if (subscription.metadata.userId === userId) {
        const subscriptionItem = subscription.items.data[0];

        const newSubscription = await stripe.subscriptionItems.update(
          subscriptionItem.id,
          { price: newPriceId, expand: ["price.product"] }
        );

        const product = newSubscription.price.product as Stripe.Product; // We can assert the type as we expand the product object
        const newPlanKey =
          newSubscription.price.lookup_key ||
          product.name.toLowerCase().replaceAll(" ", "_");

        const newUserSub = await userSubRepository.createUserSubscription({
          userId,
          subscriptionId: newSubscription.subscription,
          plan: newPlanKey,
          customerId: subscription.customer as string,
        });

        return {
          plan: newPlanKey,
          subscriptionId: newUserSub.subscriptionId,
          createdAt: newUserSub.createdAt,
        };
      } else {
        throw subscriptionNotFound(subscriptionId);
      }
    },

    async cancelUserSub({ userId, subscriptionId }) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      if (subscription.metadata.userId === userId) {
        await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      } else {
        throw subscriptionNotFound(subscriptionId);
      }
    },

    async stopUserSubCancellation({ userId, subscriptionId }) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      if (subscription.metadata.userId === userId) {
        await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: false,
        });
      } else {
        throw subscriptionNotFound(subscriptionId);
      }
    },
  };
};
