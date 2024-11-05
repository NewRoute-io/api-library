CREATE TABLE users (
    "id" SERIAL PRIMARY KEY,
    "username" VARCHAR(255) UNIQUE NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) UNIQUE,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
    "id" SERIAL PRIMARY KEY,
    "token" UUID NOT NULL DEFAULT gen_random_uuid(),
    "token_family" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
    "active" BOOLEAN DEFAULT true,
    "expires_at" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_token_family ON refresh_tokens(token_family);
