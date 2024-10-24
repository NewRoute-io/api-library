import Stripe from "stripe";

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

interface SubscriptionsController {
  getSubTypes: () => Promise<Subscription[]>;
  getUserSubscription: (userId: string) => void;
  createSubCheckout: () => void;
  updateSub: () => void;
  deleteSub: () => void;
}

export const createSubscriptionController = (): SubscriptionsController => {
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

    async getUserSubscription(userId) {},

    async createSubCheckout() {},

    async updateSub() {},

    async deleteSub() {},
  };
};
