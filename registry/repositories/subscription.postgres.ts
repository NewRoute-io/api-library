import { QueryConfig } from "pg";
import { pgPool } from "@/repositories/connection.postgres.js";
import {
  UserSubscriptionRepository,
  UserSubscription,
} from "@/repositories/subscription.interface.js";

export const createRefreshTokenRepository = (): UserSubscriptionRepository => {
  return {
    async getUserSubscriptions(userId) {
      const query: QueryConfig = {
        name: "queryGetUserSubscriptions",
        text: `
            SELECT plan, user_id, customer_id, subscription_id, created_at
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
          createdAt: el.created_at,
        })
      );

      return subscriptions;
    },

    async createUserSubscription(props) {
      const { plan, userId, customerId, subscriptionId } = props;
      const query: QueryConfig = {
        name: "queryCreateUserSubscription",
        text: `
            INSERT INTO user_subscriptions (plan, user_id, customer_id, subscription_id)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, customer_id)
                DO UPDATE
                SET plan = EXCLUDED.plan, 
                    subscription_id = EXCLUDED.subscription_id,
                    created_at = DEFAULT
            RETURNING plan, user_id, customer_id, subscription_id, created_at;
        `,
        values: [plan, userId, customerId, subscriptionId],
      };

      const result = await pgPool.query(query).then((data) => data.rows.at(0));

      return {
        plan: result.plan,
        userId: result.user_id,
        customerId: result.customer_id,
        subscriptionId: result.subscription_id,
        createdAt: result.created_at,
      };
    },

    async removeUserSubscription(userId, subId) {
      const query: QueryConfig = {
        name: "queryRemoveUserSubscription",
        text: `
            DELETE FROM user_subscriptions
            WHERE user_id = $1
                AND subscription_id = $2;
        `,
        values: [userId, subId],
      };

      await pgPool.query(query);
    },
  };
};
