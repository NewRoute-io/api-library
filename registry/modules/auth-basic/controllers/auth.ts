import argon from "argon2";

import { BasicAuth } from "@/schemas/auth.js";

import {
  usernameNotAvailable,
  invalidLoginCredentials,
} from "@/modules/auth-basic/utils/errors/auth.js";

export const signup = async (props: BasicAuth) => {
  const { username, password } = props;

  // TODO: Add check if user exists
  // TODO: throw usernameNotAvailable();

  // timeCost, parallelism and memoryCost configured according to OWASP recommendations: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
  const hashedPass = await argon.hash(password, {
    timeCost: 2,
    parallelism: 1,
    memoryCost: 19456, // 19 MiB
  });

  // TODO: store user in DB

  // TODO: Return user
};

export const login = async (props: BasicAuth) => {
  const { username, password } = props;

  // TODO: Add check if user exists and get the hashed password
  const hashedPass = "";
  const isOk = await argon.verify(hashedPass, password);

  if (isOk) {
    // Return user
  } else {
    throw invalidLoginCredentials();
  }
};
