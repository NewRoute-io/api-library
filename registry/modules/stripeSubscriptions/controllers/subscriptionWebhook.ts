import Stripe from "stripe";

import { UserSubscriptionRepository } from "@/repositories/subscription.interface.js";

import { stripeWebhookEventNotSupported } from "@/modules/stripeSubscriptions/utils/errors/subscriptions.js";

interface SubscriptionsWHController {
  handleWebhook: (event: Stripe.Event) => void;
}

export const createSubscriptionsWebHookController = (
  stripe: Stripe,
  userSubRepository: UserSubscriptionRepository
): SubscriptionsWHController => {
  return {
    async handleWebhook(event) {
      switch (event.type) {
        case "checkout.session.async_payment_succeeded":
        case "checkout.session.completed": {
          const { mode, subscription, customer } = event.data.object;

          if (mode === "subscription" && subscription) {
            const stripeSub = await stripe.subscriptions.retrieve(
              subscription as string,
              { expand: ["items.data.price.product"] }
            );

            const userId = parseInt(stripeSub.metadata.userId);
            const price = stripeSub.items.data[0].price;
            const product = price.product as Stripe.Product; // We can assert the type as we expand the product object

            const planKey =
              price.lookup_key ||
              product.name.toLowerCase().replaceAll(" ", "_");

            await userSubRepository.createUserSubscription({
              userId,
              customerId: customer as string,
              subscriptionId: subscription as string,
              plan: planKey,
            });
          }

          break;
        }
        case "customer.subscription.deleted": {
          const subId = event.data.object.id;

          userSubRepository.removeUserSubscription(subId);
          break;
        }
        default: {
          throw stripeWebhookEventNotSupported(event.type);
        }
      }
    },
  };
};
