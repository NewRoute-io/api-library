/**
 * HOW TO USE THIS TEMPLATE:
 *
 * Use this Refresh Token Repository template file to integrate any database engine.
 *
 * Replace the `REPLACE:` comments with your query logic and return the correct types defined in user.interface.ts
 *
 * Once you complete your implementation you don't have to do anything else as
 * this repository is referenced in the rest of the code base and used to implement the service logic.
 */

import { RefreshTokenRepository } from "@/repositories/refreshToken.interface.js";

import { notImplementedError } from "@/modules/shared/utils/errors/common.js";

export const createRefreshTokenRepository = (): RefreshTokenRepository => {
  return {
    async getToken(token) {
      // REPLACE: Implement token retrieval with your DB of choice
      throw notImplementedError(); // Remove when implemented
    },

    async createToken(props) {
      // REPLACE: Implement token creation with your DB of choice
      throw notImplementedError(); // Remove when implemented
    },

    async invalidateTokenFamily(tokenFamily) {
      // REPLACE: Implement token family invalidation with your DB of choice
      throw notImplementedError(); // Remove when implemented
    },
  };
};
