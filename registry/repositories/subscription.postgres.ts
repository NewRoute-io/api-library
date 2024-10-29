import { QueryConfig } from "pg";
import { pgPool } from "@/repositories/connection.postgres.js";
import {
  UserSubscriptionRepository,
  UserSubscription,
} from "@/repositories/subscription.interface.js";

export const createUserSubRepository = (): UserSubscriptionRepository => {
  return {
    async getUserSubscriptions(userId) {
      const query: QueryConfig = {
        name: "queryGetUserSubscriptions",
        text: `
            SELECT plan, user_id, customer_id, subscription_id, is_owner, created_at
            FROM user_subscriptions 
            WHERE user_id = $1;
        `,
        values: [userId],
      };
      const result = await pgPool.query(query).then((data) => data.rows);

      const subscriptions: UserSubscription[] = [];

      result.forEach((el) =>
        subscriptions.push({
          plan: el.plan,
          userId: el.user_id,
          customerId: el.customer_id,
          subscriptionId: el.subscription_id,
          isOwner: el.is_owner,
          createdAt: el.created_at,
        })
      );

      return subscriptions;
    },

    async getSubscriptionUsers(subscriptionId) {
      const query: QueryConfig = {
        name: "queryGetSubscriptionUsers",
        text: `
            SELECT plan, user_id, customer_id, subscription_id, is_owner, created_at
            FROM user_subscriptions 
            WHERE subscription_id = $1;
        `,
        values: [subscriptionId],
      };
      const result = await pgPool.query(query).then((data) => data.rows);

      const subscriptions: UserSubscription[] = [];

      result.forEach((el) =>
        subscriptions.push({
          plan: el.plan,
          userId: el.user_id,
          customerId: el.customer_id,
          subscriptionId: el.subscription_id,
          isOwner: el.is_owner,
          createdAt: el.created_at,
        })
      );

      return subscriptions;
    },

    async createUserSubscription(props) {
      const { plan, userId, customerId, subscriptionId, isOwner } = props;
      const query: QueryConfig = {
        name: "queryCreateUserSubscription",
        text: `
            INSERT INTO user_subscriptions (plan, user_id, customer_id, subscription_id, is_owner)
            VALUES ($1, $2, $3, $4, COALESCE($5, true))
            ON CONFLICT (user_id, customer_id)
                DO UPDATE
                SET plan = EXCLUDED.plan, 
                    subscription_id = EXCLUDED.subscription_id,
                    created_at = DEFAULT
            RETURNING plan, user_id, customer_id, subscription_id, is_owner, created_at;
        `,
        values: [plan, userId, customerId, subscriptionId, isOwner],
      };

      const result = await pgPool.query(query).then((data) => data.rows.at(0));

      return {
        plan: result.plan,
        userId: result.user_id,
        customerId: result.customer_id,
        subscriptionId: result.subscription_id,
        isOwner: result.is_owner,
        createdAt: result.created_at,
      };
    },

    async removeUserFromSubscription(userId, subscriptionId) {
      const query: QueryConfig = {
        name: "queryRemoveUserFromSubscription",
        text: `
            DELETE FROM user_subscriptions
            WHERE user_id = $1
              AND subscription_id = $2
              AND is_owner = false;
        `,
        values: [userId, subscriptionId],
      };

      await pgPool.query(query);
    },

    async removeUserSubscription(subscriptionId) {
      const query: QueryConfig = {
        name: "queryRemoveUserSubscription",
        text: `
            DELETE FROM user_subscriptions
            WHERE subscription_id = $1;
        `,
        values: [subscriptionId],
      };

      await pgPool.query(query);
    },
  };
};
