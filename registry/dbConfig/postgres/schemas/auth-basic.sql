CREATE TABLE users (
    "id" SERIAL,
    "user_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" VARCHAR(255) UNIQUE NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id)
);

CREATE INDEX idx_users_username ON users(username);
