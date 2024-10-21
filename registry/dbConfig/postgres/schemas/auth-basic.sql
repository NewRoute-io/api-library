CREATE TABLE users (
    "id" SERIAL,
    "username" VARCHAR(255) UNIQUE NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id)
);

CREATE INDEX idx_users_username ON users(username);
