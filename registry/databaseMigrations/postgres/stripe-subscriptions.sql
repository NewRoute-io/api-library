CREATE TABLE user_subscriptions (
    "id" SERIAL PRIMARY KEY,
    "plan" VARCHAR NOT NULL,
    "user_id" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
    "customer_id" VARCHAR,
    "subscription_id" VARCHAR NOT NULL,
    "is_owner" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, subscription_id)
);

CREATE INDEX idx_user_subscriptions_plan ON user_subscriptions(plan);
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
