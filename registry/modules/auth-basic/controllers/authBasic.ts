import argon from "argon2";

import {
  BasicAuthSchema,
  RefreshTokenSchema,
} from "@/schemaValidators/auth-basic.interface.js";

import { accessTokenManager } from "@/modules/auth-basic/utils/jwt/tokenManager.js";
import {
  usernameNotAvailable,
  invalidLoginCredentials,
} from "@/modules/auth-basic/utils/errors/auth.js";
import { forbiddenError } from "@/modules/shared/utils/errors/common.js";

import { UserRepository } from "@/repositories/user.interface.js";
import { RefreshTokenRepository } from "@/repositories/refreshToken.interface.js";

export const createAuthBasicController = (
  userRepo: UserRepository,
  refreshTokenRepo: RefreshTokenRepository
) => {
  const generateAccessToken = (userId: string) => {
    const signedJWT = accessTokenManager.sign({ userId });

    return signedJWT;
  };

  const generateRefreshToken = async (userId: string, tokenFamily?: string) => {
    const expAt = new Date(new Date().getTime() + 31 * 24 * 60 * 6000); // Expire in 31 days
    const refreshTokenExp = expAt.toISOString();

    const token = await refreshTokenRepo.createToken({
      userId,
      tokenFamily,
      expiresAt: refreshTokenExp,
    });

    return token;
  };

  return {
    async signup(props: BasicAuthSchema) {
      const { username, password } = props;

      await userRepo.getUser(username).then((res) => {
        if (res !== null) throw usernameNotAvailable();
      });

      // timeCost, parallelism and memoryCost configured according to OWASP recommendations: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
      const hashedPass = await argon.hash(password, {
        timeCost: 2,
        parallelism: 1,
        memoryCost: 19456, // 19 MiB
      });

      const newUser = await userRepo.createAuthBasicUser({
        username,
        hashedPass,
      });

      const refreshToken = await generateRefreshToken(newUser.userId);
      const accessToken = generateAccessToken(newUser.userId);

      return { user: newUser, accessToken, refreshToken };
    },

    async login(props: BasicAuthSchema) {
      const { username, password } = props;

      const user = await userRepo.getUser(username).then((res) => {
        if (res === null) throw invalidLoginCredentials();
        return res;
      });

      const hashedPass = user.password;
      const isOk = await argon.verify(hashedPass, password);

      if (isOk) {
        const refreshToken = await generateRefreshToken(user.userId);
        const accessToken = generateAccessToken(user.userId);

        return { user, accessToken, refreshToken };
      }

      throw invalidLoginCredentials();
    },

    async refreshToken({ token }: RefreshTokenSchema) {
      const tokenData = await refreshTokenRepo.getToken(token);

      if (!tokenData) throw forbiddenError();

      const { userId, tokenFamily, active } = tokenData;

      if (active) {
        // Token is valid and hasn't been used yet
        const newRefreshToken = await generateRefreshToken(userId, tokenFamily);
        const accessToken = generateAccessToken(userId);

        return { accessToken, refreshToken: newRefreshToken };
      } else {
        // Previously refreshed token used, invalidate all tokens in family
        refreshTokenRepo.invalidateTokenFamily(tokenFamily);

        throw forbiddenError();
      }
    },
  };
};
