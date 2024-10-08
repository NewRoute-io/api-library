import { NextFunction, Request, Response } from "express";
import argon from "argon2";

type AuthOptions = {
  usernameField?: string;
  passwordField?: string;
};

interface SignupOptions extends AuthOptions {
  passwordRegex?: string;
  // TODO: Add database dependency
}

export const signup = (options: SignupOptions) => {
  return async (req: Request, _: Response, next: NextFunction) => {
    const username = req.body[options.usernameField || "username"];
    const password = req.body[options.passwordField || "password"];
    // TODO: Add field validation

    // TODO: Add check if user exists

    // timeCost, parallelism and memoryCost configured according to OWASP recommendations: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
    const hashedPass = await argon.hash(password, {
      timeCost: 2,
      parallelism: 1,
      memoryCost: 19456,
    });

    // TODO: store user in DB

    // TODO: Append user to req.user
    next();
  };
};

export const login = (options: AuthOptions) => {
  return async (req: Request, _: Response, next: NextFunction) => {
    const username = req.body[options.usernameField || "username"];
    const password = req.body[options.passwordField || "password"];

    // TODO: Add check if user exists and get the hashed password
    const hashedPass = "";
    const isOk = await argon.verify(hashedPass, password);

    if (isOk) {
      // Append user to req.user
      next();
    } else {
      // Throw auth error
    }
  };
};
