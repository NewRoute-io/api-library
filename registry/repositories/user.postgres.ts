import { QueryConfig } from "pg";
import { pgPool } from "@/repositories/connection.postgres.js";
import { UserRepository } from "@/repositories/user.interface.js";

export const createUserRepository = (): UserRepository => {
  return {
    async getUser(username) {
      const query: QueryConfig = {
        name: "queryGetUserByUsername",
        text: `
          SELECT id, username, password, created_at
          FROM users 
          WHERE username = $1;
        `,
        values: [username],
      };
      const result = await pgPool.query(query).then((data) => data.rows.at(0));

      if (result) {
        return {
          userId: result.id,
          username: result.username,
          password: result.password,
          createdAt: result.created_at,
        };
      } else return null;
    },

    async getUserById(userId) {
      const query: QueryConfig = {
        name: "queryGetUserById",
        text: `
          SELECT id, username, password, created_at
          FROM users 
          WHERE id = $1;
        `,
        values: [userId],
      };
      const result = await pgPool.query(query).then((data) => data.rows.at(0));

      if (result) {
        return {
          userId: result.id,
          username: result.username,
          password: result.password,
          createdAt: result.created_at,
        };
      } else return null;
    },

    async createAuthBasicUser(data) {
      const query: QueryConfig = {
        name: "queryCreateAuthBasicUser",
        text: `
          INSERT INTO users (username, password) 
          VALUES ($1, $2) 
          RETURNING id, username, password, created_at;
        `,
        values: [data.username, data.hashedPass],
      };
      const result = await pgPool.query(query).then((data) => data.rows.at(0));

      return {
        userId: result.id,
        username: result.username,
        password: result.password,
        createdAt: result.created_at,
      };
    },
  };
};
