import Stripe from "stripe";

import {
  GetUserSubsSchema,
  CreateCheckoutSchema,
  CancelSubscriptionSchema,
  UpdatePlanSchema,
  UpdateSubscriptionSeatsSchema,
} from "@/schemaValidators/subscription.interface.js";

import { UserSubscriptionRepository } from "@/repositories/subscription.interface.js";
import { UserRepository } from "@/repositories/user.interface.js";

import {
  subscriptionNotFound,
  noEmptySeatsToRemove,
} from "@/modules/stripe-subscriptions/utils/errors/subscriptions.js";

const STRIPE_API_KEY = process.env.STRIPE_API_KEY as string;
const CHECKOUT_SUCCESS_URL = process.env.CHECKOUT_SUCCESS_URL;
const CHECKOUT_CANCEL_URL = process.env.CHECKOUT_CANCEL_URL;

const stripe = new Stripe(STRIPE_API_KEY);

type SubscriptionPrices = {
  currency: string;
  amount: number | null;
};

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
  isOwner: boolean;
  seats?: number;
  createdAt: string;
};

interface SubscriptionController {
  getSubscriptions: () => Promise<Subscription[]>;

  getUserSubs: (
    props: GetUserSubsSchema
  ) => Promise<{ userSubscriptions: UserSubsOutput[] }>;

  createCheckout: (props: CreateCheckoutSchema) => Promise<{ url: string }>;

  updatePlan: (props: UpdatePlanSchema) => Promise<UserSubsOutput>;

  updateSeats: (props: UpdateSubscriptionSeatsSchema) => void;

  cancelSubscription: (props: CancelSubscriptionSchema) => void;

  stopCancellation: (props: CancelSubscriptionSchema) => void;
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

        const planKey =
          price.lookup_key || name.toLowerCase().replaceAll(" ", "_");

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

      for (const sub of userSubs) {
        const subscription = await stripe.subscriptions.retrieve(
          sub.subscriptionId
        );

        const items = subscription.items.data[0];

        userSubscriptions.push({
          plan: sub.plan,
          subscriptionId: sub.subscriptionId,
          isOwner: sub.isOwner,
          seats: items.quantity,
          createdAt: sub.createdAt,
        });
      }

      return { userSubscriptions };
    },

    async createCheckout({ userId, priceId, seats }) {
      const userSubscription = await userSubRepository
        .getUserSubscriptions(userId)
        .then((res) => res.at(0));

      let customerData;
      if (userSubscription && userSubscription.customerId) {
        // Returning paying user, reuse existing Stripe Customer
        customerData = { customer: userSubscription.customerId };
      } else {
        // First time paying user, create Stripe Customer after Checkout with email
        const user = await userRepository.getUserById(userId);
        customerData = { customer_email: user?.email };
      }

      const checkout = await stripe.checkout.sessions.create({
        ...customerData,
        customer_creation: "always",
        line_items: [
          {
            adjustable_quantity: { enabled: true }, // Remove this line if your subscription is not per seat based
            quantity: seats,
            price: priceId,
          },
        ],
        subscription_data: { metadata: { userId } },
        saved_payment_method_options: { payment_method_save: "enabled" },
        success_url: CHECKOUT_SUCCESS_URL,
        cancel_url: CHECKOUT_CANCEL_URL,
        mode: "subscription",
      });

      return { url: checkout.url! };
    },

    async updatePlan(props) {
      const { userId, subscriptionId, newPriceId } = props;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      if (parseInt(subscription.metadata.userId) === userId) {
        // User is owner of this subscription
        const subscriptionItem = subscription.items.data[0];

        const newSubscriptionItem = await stripe.subscriptionItems.update(
          subscriptionItem.id,
          { price: newPriceId, expand: ["price.product"] }
        );

        const product = newSubscriptionItem.price.product as Stripe.Product; // We can assert the type as we expand the product object
        const newPlanKey =
          newSubscriptionItem.price.lookup_key ||
          product.name.toLowerCase().replaceAll(" ", "_");

        const newUserSub = await userSubRepository.createUserSubscription({
          userId,
          subscriptionId: newSubscriptionItem.subscription,
          plan: newPlanKey,
          customerId: subscription.customer as string,
        });

        return {
          plan: newPlanKey,
          subscriptionId: newUserSub.subscriptionId,
          isOwner: true,
          seats: newSubscriptionItem.quantity,
          createdAt: newUserSub.createdAt,
        };
      } else {
        throw subscriptionNotFound(subscriptionId);
      }
    },

    async updateSeats(props) {
      const { userId, subscriptionId, newSeats } = props;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      if (parseInt(subscription.metadata.userId) === userId) {
        // User is owner of this subscription
        const subscriptionItem = subscription.items.data[0];
        const subscriptionSeats = subscriptionItem.quantity!;

        if (newSeats === subscriptionSeats) return;
        else if (newSeats < subscriptionSeats) {
          // Remove seats, check if there are available empty seats
          const subscriptionUsers = await userSubRepository.getSubscriptionUsers(subscriptionId)

          if(newSeats <= subscriptionUsers.length) {
            // No available seats to remove
            throw noEmptySeatsToRemove()
          }
        }

        // Update seats
        await stripe.subscriptionItems.update(subscriptionItem.id, {
          quantity: newSeats,
        });
      } else {
        throw subscriptionNotFound(subscriptionId);
      }
    },

    // TODO: Add logic to add/remove users from a subscription (IF SEAT BASED)

    async cancelSubscription({ userId, subscriptionId }) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      if (parseInt(subscription.metadata.userId) === userId) {
        await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      } else {
        throw subscriptionNotFound(subscriptionId);
      }
    },

    async stopCancellation({ userId, subscriptionId }) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      if (parseInt(subscription.metadata.userId) === userId) {
        await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: false,
        });
      } else {
        throw subscriptionNotFound(subscriptionId);
      }
    },
  };
};
