import { RequestHandler } from "express";

import { createUserRepository } from "@/repositories/user.postgres.js";

import { accessTokenManager } from "@/modules/authBasic/utils/jwt/tokenManager.js";
import { notAuthenticated, invalidAccessToken } from "@/modules/authBasic/utils/errors/auth.js";

const userRepository = createUserRepository();

/**
 * Middleware that can be used to protect a route/endpoint
 *
 * Extracts JWT token from the `Authorization` header with scheme `bearer`
 *
 * @see {scheme} To define a custom Authorization header JWT scheme
 */
export const protectedRoute: RequestHandler = async (req, _, next) => {
  const authHeader = req.header("authorization");

  if (!authHeader) {
    return next(notAuthenticated);
  }

  const scheme = "bearer ";
  const accessToken = authHeader.replace(scheme, "");

  try {
    const { userId } = accessTokenManager.validate(accessToken);
    const user = await userRepository.getUserById(parseInt(userId));

    if (user) {
      req.user = user;
      next();
    } else {
      next(invalidAccessToken);
    }
  } catch (err) {
    next(err);
  }
};
