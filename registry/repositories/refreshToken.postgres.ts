import { QueryConfig } from "pg";
import { pgPool } from "@/repositories/connection.postgres.js";
import { RefreshTokenRepository } from "@/repositories/refreshToken.interface.js";

export const createRefreshTokenRepository = (): RefreshTokenRepository => {
  return {
    async getToken(token) {
      const query: QueryConfig = {
        name: "queryGetRefreshToken",
        text: `
            SELECT token, token_family, active, expires_at
            FROM refresh_tokens 
            WHERE token = $1
              AND expires_at < NOW();
        `,
        values: [token],
      };
      const result = await pgPool.query(query).then((data) => data.rows.at(0));

      if (result) {
        return {
          userId: result.user_id,
          token: result.token,
          active: result.active,
          tokenFamily: result.token_family,
          expiresAt: result.expires_at,
        };
      } else return null;
    },

    async createToken({ tokenFamily, userId, expiresAt }) {
      const query: QueryConfig = {
        name: "queryCreateRefreshToken",
        text: `
            INSERT INTO refresh_tokens (token_family, user_id, expires_at)
            VALUES (COALESCE($1, gen_random_uuid()), $2, $3)
            RETURNING *;
        `,
        values: [tokenFamily, userId, expiresAt],
      };
      const result = await pgPool.query(query).then((data) => data.rows.at(0));

      return {
        userId: result.user_id,
        token: result.token,
        active: result.active,
        tokenFamily: result.token_family,
        expiresAt: result.expire_at,
      };
    },

    async invalidateTokenFamily(tokenFamily) {
      const query: QueryConfig = {
        name: "queryInvalidateRefreshTokenFamily",
        text: `
            DELETE FROM refresh_tokens
            WHERE token_family = $1;
        `,
        values: [tokenFamily],
      };

      await pgPool.query(query);
    },
  };
};
