import { pgPool } from "@/repositories/connection.postgres.js";
import {
  UserRepository,
  User,
  AuthBasicSignup,
} from "@/repositories/user.interface.js";

export function createUserRepository(): UserRepository {
  return {
    async getUser(username: string): Promise<User | null> {
      const result = await pgPool.query<User>(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      return result.rows.length ? result.rows[0] : null;
    },

    async getUserById(userId: string): Promise<User | null> {
      const result = await pgPool.query<User>(
        "SELECT * FROM users WHERE user_id = $1",
        [userId]
      );
      return result.rows.length ? result.rows[0] : null;
    },

    async createAuthBasicUser(data: AuthBasicSignup): Promise<User> {
      const result = await pgPool.query<User>(
        "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
        [data.username, data.hashedPass]
      );
      return result.rows[0];
    },
  };
}
