import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import Stripe from "stripe";

import { createSubscriptionsWHController } from "@/modules/stripeSubscriptions/controllers/subscriptionWebhook.js";

import { UserSubscriptionRepository } from "@/repositories/subscription.interface.js";

import { stripeWebhookEventNotSupported } from "@/modules/stripeSubscriptions/utils/errors/subscriptions.js";

// Mock Stripe instance
vi.mock("stripe", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      subscriptions: {
        retrieve: vi.fn(),
      },
    })),
  };
});

const stripe = new Stripe("");

describe("stripe-subscriptions API Module tests", () => {
  describe("Subscription Webhook Tests", () => {
    let controller: ReturnType<typeof createSubscriptionsWHController>;
    let subscriptionRepoMock: Partial<UserSubscriptionRepository>;

    const mockUserId = 123;
    const mockSubId = "sub_123";
    const mockPlanKey = "basic";
    const mockSubItem = {
      id: "price_123",
      quantity: 2,
      price: { lookup_key: mockPlanKey, product: { name: "Basic Plan" } },
      subscription: mockSubId,
    };
    const mockSubscription = {
      metadata: { userId: mockUserId },
      items: { data: [mockSubItem] },
    };

    beforeEach(() => {
      subscriptionRepoMock = {
        createUserSubscription: vi.fn(),
        removeUserSubscription: vi.fn(),
      };

      // Injecting the mocked repositories into the controller
      controller = createSubscriptionsWHController(
        stripe,
        subscriptionRepoMock as UserSubscriptionRepository
      );
    });

    it("should handle checkout.session.completed and create a user subscription", async () => {
      const mockEvent = {
        type: "checkout.session.completed",
        data: {
          object: {
            mode: "subscription",
            subscription: mockSubId,
            customer: "cust_123",
          },
        },
      };

      (stripe.subscriptions.retrieve as Mock).mockResolvedValue(
        mockSubscription
      );

      await controller.handleWebhook(mockEvent as Stripe.Event);

      expect(subscriptionRepoMock.createUserSubscription).toHaveBeenCalledWith({
        userId: mockUserId,
        customerId: "cust_123",
        subscriptionId: mockSubId,
        plan: mockPlanKey,
      });
    });

    it("should handle customer.subscription.deleted and remove a user subscription", async () => {
      const mockEvent = {
        type: "customer.subscription.deleted",
        data: { object: { id: mockSubId } },
      };

      await controller.handleWebhook(mockEvent as Stripe.Event);

      expect(subscriptionRepoMock.removeUserSubscription).toHaveBeenCalledWith(
        mockSubId
      );
    });

    it("should throw stripeWebhookEventNotSupported for unsupported event types", async () => {
      const mockEvent = { type: "unsupported.event.type", data: {} };

      await expect(
        controller.handleWebhook(mockEvent as Stripe.Event)
      ).rejects.toThrow(stripeWebhookEventNotSupported(mockEvent.type));
    });
  });
});
