import argon from "argon2";

import {
  BasicAuthSchema,
  RefreshTokenSchema,
} from "@/schemaValidators/authBasic.interface.js";

import { accessTokenManager } from "@/modules/authBasic/utils/jwt/tokenManager.js";
import {
  usernameNotAvailable,
  invalidLoginCredentials,
} from "@/modules/authBasic/utils/errors/auth.js";
import { forbiddenError } from "@/modules/shared/utils/errors/common.js";

import { User, UserRepository } from "@/repositories/user.interface.js";
import {
  RefreshToken,
  RefreshTokenRepository,
} from "@/repositories/refreshToken.interface.js";

interface TokensOutput { accessToken: string; refreshToken: RefreshToken };
interface AuthOutput extends TokensOutput  {user: Omit<User, 'password'>}

interface AuthBasicController {
  login: (props: BasicAuthSchema) => Promise<AuthOutput>
  signup: (props: BasicAuthSchema) => Promise<AuthOutput>
  refreshToken: (props:RefreshTokenSchema) => Promise<TokensOutput>
}

export const createAuthBasicController = (
  userRepo: UserRepository,
  refreshTokenRepo: RefreshTokenRepository
): AuthBasicController => {
  const generateAccessToken = (userId: number) => {
    const signedJWT = accessTokenManager.sign({ userId: userId.toString() });

    return signedJWT;
  };

  const generateRefreshToken = async (userId: number, tokenFamily?: string) => {
    const expAt = new Date(new Date().getTime() + 31 * 24 * 60 * 60000); // Expire in 31 days
    const refreshTokenExp = expAt.toISOString();

    const token = await refreshTokenRepo.createToken({
      userId,
      tokenFamily,
      expiresAt: refreshTokenExp,
    });

    return token;
  };

  return {
    async signup(props) {
      const { username, password, email } = props;

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
        email,
      });

      const refreshToken = await generateRefreshToken(newUser.userId);
      const accessToken = generateAccessToken(newUser.userId);

      const { password: _, ...userRes } = newUser;

      return { user: userRes, accessToken, refreshToken };
    },
    
    async login(props) {
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

        const { password: _, ...userRes } = user;

        return { user: userRes, accessToken, refreshToken };
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
