import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import Stripe from "stripe";

import { createSubscriptionController } from "@/modules/stripe-subscriptions/controllers/subscription.js";

import { UserSubscriptionRepository } from "@/repositories/subscription.interface.js";
import { UserRepository } from "@/repositories/user.interface.js";

import {
  cantRemoveSubOwner,
  noAvailableSeats,
  noEmptySeatsToRemove,
  subscriptionNotFound,
} from "@/modules/stripe-subscriptions/utils/errors/subscriptions.js";

// Mock Stripe instance
vi.mock("stripe", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      checkout: {
        sessions: {
          create: vi.fn(),
        },
      },
      prices: {
        list: vi.fn(),
      },
      subscriptions: {
        update: vi.fn(),
        retrieve: vi.fn(),
      },
      subscriptionItems: {
        update: vi.fn(),
      },
    })),
  };
});

const stripe = new Stripe("");

describe("stripe-subscriptions API Module tests", () => {
  describe("Subscription Controller Tests", () => {
    let controller: ReturnType<typeof createSubscriptionController>;
    let subscriptionRepoMock: UserSubscriptionRepository;
    let userRepositoryMock: Partial<UserRepository>;

    const mockUserId = 123;
    const mockSubId = "sub_123";
    const mockPriceId = "price_123";
    const mockPlanKey = "basic";
    const mockUserSub = {
      plan: mockPlanKey,
      subscriptionId: mockSubId,
      isOwner: true,
      customerId: "cus_123",
      seats: 2,
      createdAt: new Date().toISOString(),
    };
    const mockSubItem = {
      id: mockPriceId,
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
        getUserSubscriptions: vi.fn(),
        getSubscriptionUsers: vi.fn(),
        createUserSubscription: vi.fn(),
        removeUserFromSubscription: vi.fn(),
        removeUserSubscription: vi.fn(),
      };

      userRepositoryMock = { getUserById: vi.fn() };

      // Injecting the mocked repositories into the controller
      controller = createSubscriptionController(
        stripe,
        subscriptionRepoMock,
        userRepositoryMock as UserRepository
      );
    });

    it("should return available subscriptions with correct structure", async () => {
      const mockPrices = [
        {
          id: mockPriceId,
          lookup_key: "basic",
          recurring: { interval: "month" },
          billing_scheme: "per_unit",
          currency: "USD",
          unit_amount: 1000,
          product: {
            name: "Basic Plan",
            description: "Basic features",
            marketing_features: [{ name: "100 API Calls" }],
          },
        },
      ];

      (stripe.prices.list as Mock).mockResolvedValue({ data: mockPrices });

      const result = await controller.getSubscriptions();

      const expectedValue = {
        plan: mockPrices[0].lookup_key,
        name: mockPrices[0].product.name,
        description: mockPrices[0].product.description,
        priceId: mockPrices[0].id,
        interval: mockPrices[0].recurring.interval,
        priceType: mockPrices[0].billing_scheme,
        price: {
          currency: mockPrices[0].currency,
          amount: mockPrices[0].unit_amount,
        },
        features: ["100 API Calls"],
      };
      expect(result).toContainEqual(expectedValue);
    });

    it("should return user subscriptions", async () => {
      (subscriptionRepoMock.getUserSubscriptions as Mock).mockResolvedValue([
        mockUserSub,
      ]);
      (stripe.subscriptions.retrieve as Mock).mockResolvedValue({
        items: { data: [{ quantity: mockUserSub.seats }] },
      });

      const result = await controller.getUserSubs({ userId: mockUserId });
      const { customerId, ...expectedValue } = mockUserSub;

      expect(stripe.subscriptions.retrieve).toHaveBeenCalledWith(
        mockUserSub.subscriptionId
      );
      expect(result.userSubscriptions).toContainEqual({
        ...expectedValue,
      });
    });

    it("should create a checkout session with existing Stripe Customer and return URL", async () => {
      const mockUrl = "https://checkout.stripe.com/test-session";

      (subscriptionRepoMock.getUserSubscriptions as Mock).mockResolvedValue([
        mockUserSub,
      ]);

      (stripe.checkout.sessions.create as Mock).mockResolvedValue({
        url: mockUrl,
      });

      const result = await controller.createCheckout({
        userId: mockUserId,
        priceId: mockPriceId,
        seats: 1,
      });

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith({
        customer: mockUserSub.customerId,
        customer_creation: "always",
        line_items: [
          {
            adjustable_quantity: { enabled: true },
            quantity: 1,
            price: mockPriceId,
          },
        ],
        subscription_data: { metadata: { userId: mockUserId } },
        saved_payment_method_options: { payment_method_save: "enabled" },
        mode: "subscription",
      });

      expect(result.url).toBe(mockUrl);
    });

    it("should create a checkout session with email and return URL", async () => {
      const mockUrl = "https://checkout.stripe.com/test-session";
      const mockUser = { email: "mock@mail.com" };

      (subscriptionRepoMock.getUserSubscriptions as Mock).mockResolvedValue(
        undefined
      );
      (userRepositoryMock.getUserById as Mock).mockResolvedValue(mockUser);

      (stripe.checkout.sessions.create as Mock).mockResolvedValue({
        url: mockUrl,
      });

      const result = await controller.createCheckout({
        userId: mockUserId,
        priceId: mockPriceId,
        seats: 1,
      });

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith({
        customer_email: mockUser.email,
        customer_creation: "always",
        line_items: [
          {
            adjustable_quantity: { enabled: true },
            quantity: 1,
            price: mockPriceId,
          },
        ],
        subscription_data: { metadata: { userId: mockUserId } },
        saved_payment_method_options: { payment_method_save: "enabled" },
        mode: "subscription",
      });

      expect(result.url).toBe(mockUrl);
    });

    it("should add a user to a subscription seat", async () => {
      (stripe.subscriptions.retrieve as Mock).mockResolvedValue(
        mockSubscription
      );
      (subscriptionRepoMock.getSubscriptionUsers as Mock).mockResolvedValue([
        mockUserSub,
      ]);

      await controller.addUserToSeat({
        userId: mockUserId,
        subscriptionId: mockSubId,
      });

      expect(subscriptionRepoMock.createUserSubscription).toHaveBeenCalledWith({
        userId: mockUserId,
        subscriptionId: mockSubId,
        plan: mockPlanKey,
        isOwner: false,
      });
    });

    it("should throw noAvailableSeats if subscription has only 1 seat", async () => {
      const mockSubscription2 = {
        ...mockSubscription,
        items: { data: [{ ...mockSubscription.items.data[0], quantity: 1 }] },
      };

      (stripe.subscriptions.retrieve as Mock).mockResolvedValue(
        mockSubscription2
      );

      await expect(
        controller.addUserToSeat({
          userId: mockUserId,
          subscriptionId: mockSubId,
        })
      ).rejects.toThrowError(noAvailableSeats());
    });

    it("should throw noAvailableSeats when all seats are used", async () => {
      const mockSubscription2 = {
        ...mockSubscription,
        items: { data: [{ ...mockSubscription.items.data[0], quantity: 3 }] },
      };

      (stripe.subscriptions.retrieve as Mock).mockResolvedValue(
        mockSubscription2
      );
      (subscriptionRepoMock.getSubscriptionUsers as Mock).mockResolvedValue([
        mockUserSub,
        mockUserSub,
        mockUserSub,
      ]);

      await expect(
        controller.addUserToSeat({
          userId: mockUserId,
          subscriptionId: mockSubId,
        })
      ).rejects.toThrowError(noAvailableSeats());
    });

    it("should update subscription plan", async () => {
      const mockNewPlanKey = "premium";
      const mockNewPriceId = "price_567";
      const mockNewUserSub = { ...mockUserSub, plan: mockNewPlanKey };
      const mockNewSubItem = {
        id: mockPriceId,
        quantity: 2,
        price: {
          lookup_key: mockNewPlanKey,
          product: { name: "Premium Plan" },
        },
        subscription: mockSubId,
      };

      (stripe.subscriptions.retrieve as Mock).mockResolvedValue(
        mockSubscription
      );
      (stripe.subscriptionItems.update as Mock).mockResolvedValue(
        mockNewSubItem
      );
      (subscriptionRepoMock.createUserSubscription as Mock).mockResolvedValue({
        subscriptionId: mockSubId,
        createdAt: mockNewUserSub.createdAt,
      });

      const result = await controller.updatePlan({
        userId: mockUserId,
        subscriptionId: mockSubId,
        newPriceId: mockNewPriceId,
      });

      const { customerId, ...expectedValue } = mockNewUserSub;
      expect(result).toEqual(expectedValue);
    });

    it("should throw subscriptionNotFound if non-owner tries to update subscription plan", async () => {
      (stripe.subscriptions.retrieve as Mock).mockResolvedValue(
        mockSubscription
      );

      await expect(
        controller.updatePlan({
          userId: 567,
          subscriptionId: mockSubId,
          newPriceId: "price_567",
        })
      ).rejects.toThrowError(subscriptionNotFound(mockSubId));
    });

    it("should increase subscription seats count", async () => {
      (stripe.subscriptions.retrieve as Mock).mockResolvedValue(
        mockSubscription
      );

      await controller.updateSeats({
        userId: mockUserId,
        subscriptionId: mockSubId,
        newSeats: 4,
      });

      expect(stripe.subscriptionItems.update).toHaveBeenCalledWith(
        mockPriceId,
        { quantity: 4 }
      );
    });

    it("should not update subscription seats if new count is the same as existing seats count", async () => {
      (stripe.subscriptions.retrieve as Mock).mockResolvedValue(
        mockSubscription
      );

      await controller.updateSeats({
        userId: mockUserId,
        subscriptionId: mockSubId,
        newSeats: 2,
      });

      expect(stripe.subscriptionItems.update).not.toHaveBeenCalled();
    });

    it("should reduce subscription seats count", async () => {
      (stripe.subscriptions.retrieve as Mock).mockResolvedValue(
        mockSubscription
      );
      (subscriptionRepoMock.getSubscriptionUsers as Mock).mockResolvedValue([
        mockUserSub,
      ]);

      await controller.updateSeats({
        userId: mockUserId,
        subscriptionId: mockSubId,
        newSeats: 1,
      });

      expect(stripe.subscriptionItems.update).toHaveBeenCalledWith(
        mockPriceId,
        { quantity: 1 }
      );
    });

    it("should throw noEmptySeatsToRemove if all seats are used", async () => {
      (stripe.subscriptions.retrieve as Mock).mockResolvedValue(
        mockSubscription
      );
      (subscriptionRepoMock.getSubscriptionUsers as Mock).mockResolvedValue([
        mockUserSub,
        mockUserSub,
      ]);

      await expect(
        controller.updateSeats({
          userId: mockUserId,
          subscriptionId: mockSubId,
          newSeats: 1,
        })
      ).rejects.toThrowError(noEmptySeatsToRemove());

      expect(stripe.subscriptionItems.update).not.toHaveBeenCalled();
    });

    it("should throw subscriptionNotFound if non-owner tries to update subscription seats", async () => {
      (stripe.subscriptions.retrieve as Mock).mockResolvedValue(
        mockSubscription
      );

      await expect(
        controller.updateSeats({
          userId: 567,
          subscriptionId: mockSubId,
          newSeats: 3,
        })
      ).rejects.toThrowError(subscriptionNotFound(mockSubId));
    });

    it("should remove user from subscription seat", async () => {
      (subscriptionRepoMock.getUserSubscriptions as Mock).mockResolvedValue([
        { ...mockUserSub, isOwner: false },
      ]);

      await controller.removeUserFromSeat({
        userId: mockUserId,
        subscriptionId: mockSubId,
      });

      expect(
        subscriptionRepoMock.removeUserFromSubscription
      ).toHaveBeenCalledWith(mockUserId, mockSubId);
    });

    it("should throw cantRemoveSubOwner if tried to remove subscription owner", async () => {
      (subscriptionRepoMock.getUserSubscriptions as Mock).mockResolvedValue([
        mockUserSub,
      ]);

      await expect(
        controller.removeUserFromSeat({
          userId: mockUserId,
          subscriptionId: mockSubId,
        })
      ).rejects.toThrowError(cantRemoveSubOwner());
    });

    it("should cancel the subscription", async () => {
      (stripe.subscriptions.retrieve as Mock).mockResolvedValue(
        mockSubscription
      );

      await controller.cancelSubscription({
        userId: mockUserId,
        subscriptionId: mockSubId,
      });

      expect(stripe.subscriptions.update).toHaveBeenCalledWith(mockSubId, {
        cancel_at_period_end: true,
      });
    });

    it("should throw subscriptionNotFound if non-owner cancels the subscription", async () => {
      (stripe.subscriptions.retrieve as Mock).mockResolvedValue(
        mockSubscription
      );

      await expect(
        controller.cancelSubscription({
          userId: 567,
          subscriptionId: mockSubId,
        })
      ).rejects.toThrowError(subscriptionNotFound(mockSubId));
    });

    it("should stop the cancellation of the subscription", async () => {
      (stripe.subscriptions.retrieve as Mock).mockResolvedValue(
        mockSubscription
      );

      await controller.stopCancellation({
        userId: mockUserId,
        subscriptionId: mockSubId,
      });

      expect(stripe.subscriptions.update).toHaveBeenCalledWith(mockSubId, {
        cancel_at_period_end: false,
      });
    });

    it("should throw subscriptionNotFound if non-owner stops the subscription cancelation", async () => {
      (stripe.subscriptions.retrieve as Mock).mockResolvedValue(
        mockSubscription
      );

      await expect(
        controller.stopCancellation({
          userId: 567,
          subscriptionId: mockSubId,
        })
      ).rejects.toThrowError(subscriptionNotFound(mockSubId));
    });
  });
});
