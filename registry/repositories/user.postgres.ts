import { QueryConfig } from "pg";
import { pgPool } from "@/repositories/connection.postgres.js";
import {
  UserRepository,
  User,
  AuthBasicSignup,
} from "@/repositories/user.interface.js";

export const createUserRepository = (): UserRepository => {
  return {
    async getUser(username: string): Promise<User | null> {
      const query: QueryConfig = {
        name: "queryGetUserByUsername",
        text: `
          SELECT user_id, username, password, created_at
          FROM users 
          WHERE username = $1;
        `,
        values: [username],
      };
      const result = await pgPool.query<User>(query);
      return result.rows.at(0) || null;
    },

    async getUserById(userId: string): Promise<User | null> {
      const query: QueryConfig = {
        name: "queryGetUserById",
        text: `
          SELECT user_id, username, password, created_at
          FROM users 
          WHERE user_id = $1;
        `,
        values: [userId],
      };
      const result = await pgPool.query<User>(query);
      return result.rows.at(0) || null;
    },

    async createAuthBasicUser(data: AuthBasicSignup): Promise<User> {
      const query: QueryConfig = {
        name: "queryCreateAuthBasicUser",
        text: `
          INSERT INTO users (username, password) 
          VALUES ($1, $2) 
          RETURNING user_id, username, password, created_at;
        `,
        values: [data.username, data.hashedPass],
      };
      const result = await pgPool.query<User>(query);
      return result.rows[0];
    },
  };
};
