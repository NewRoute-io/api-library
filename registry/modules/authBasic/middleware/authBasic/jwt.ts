import { RequestHandler } from "express";

import { createUserRepository } from "@/repositories/user.postgres.js";

import { accessTokenManager } from "@/modules/authBasic/utils/jwt/tokenManager.js";
import { notAuthenticated, invalidAccessToken } from "@/modules/authBasic/utils/errors/auth.js";

const userRepository = createUserRepository();

/**
 * This middleware can be used to protect a route or a single endpoint. 
 * Add it before any authorization middleware. 
 * 
 * It will append the current user object to `req.user`
 *
 * Extracts JWT token from the `authorization` header with scheme `B/bearer`
 */
export const protectedRoute: RequestHandler = async (req, _, next) => {
  const authHeader = req.header("authorization");

  if (!authHeader) {
    return next(notAuthenticated());
  }

  const accessToken = authHeader.replace(new RegExp("\\b[Bb]earer\\s"), "");

  try {
    const { userId } = accessTokenManager.validate(accessToken);
    const user = await userRepository.getUserById(parseInt(userId));

    if (user) {
      req.user = user;
      next();
    } else {
      next(invalidAccessToken());
    }
  } catch (err) {
    next(invalidAccessToken());
  }
};
