import argon from "argon2";

import { BasicAuthSchema } from "@/schemaValidators/auth-basic.interface.js";

import { accessTokenManager } from "@/modules/auth-basic/utils/jwt/tokenManager.js";
import {
  usernameNotAvailable,
  invalidLoginCredentials,
} from "@/modules/auth-basic/utils/errors/auth.js";

import { User, UserRepository } from "@/repositories/user.interface.js";

type AuthBasicController = {
  login: (props: BasicAuthSchema) => Promise<{user: User, accessToken: string}>
  signup: (props: BasicAuthSchema) => Promise<{user: User, accessToken: string}>
}

export const createAuthBasicController = (userRepo: UserRepository): AuthBasicController => {
  const generateAccessToken = (userId: string) => {
    const signedJWT = accessTokenManager.sign({ userId });

    return signedJWT;
  };

  return {
    async signup(props) {
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

      const newUser = await userRepo.createAuthBasicUser({ username, hashedPass });
      const accessToken = generateAccessToken(newUser.userId);

      return { user: newUser, accessToken };
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
        const accessToken = generateAccessToken(user.userId);

        return { user, accessToken };
      }

      throw invalidLoginCredentials();
    },
  };
};
