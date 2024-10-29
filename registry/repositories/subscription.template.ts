/**
 * HOW TO USE THIS TEMPLATE:
 *
 * Use this User Subscription Repository template file to integrate any database engine.
 *
 * Replace the `REPLACE:` comments with your query logic and return the correct types defined in subscription.interface.ts
 *
 * Once you complete your implementation you don't have to do anything else as
 * this repository is referenced in the rest of the code base and used to implement the service logic.
 */

import { UserSubscriptionRepository } from "@/repositories/subscription.interface.js";

import { notImplementedError } from "@/modules/shared/utils/errors/common.js";

export const createUserSubRepository = (): UserSubscriptionRepository => {
  return {
    async getUserSubscriptions(userId) {
      // REPLACE: Implement subscription retrieval with your DB of choice
      throw notImplementedError(); // Remove when implemented
    },

    async getSubscriptionUsers(subscriptionId) {
      // REPLACE: Implement subscription users retrieval with your DB of choice
      throw notImplementedError(); // Remove when implemented
    },

    async createUserSubscription(props) {
      // REPLACE: Implement subscription creation with your DB of choice
      throw notImplementedError(); // Remove when implemented
    },

    async removeUserFromSubscription(userId, subscriptionId) {
      // REPLACE: Implement remove user from subscription with your DB of choice
      throw notImplementedError(); // Remove when implemented
    },

    async removeUserSubscription(subscriptionId) {
      // REPLACE: Implement subscription deletion with your DB of choice
      throw notImplementedError(); // Remove when implemented
    },
  };
};
