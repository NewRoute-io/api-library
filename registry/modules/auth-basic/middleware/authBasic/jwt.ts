import { NextFunction, Request, Response } from "express";
import { tokenManager } from "@/modules/auth-basic/utils/jwt/tokenManager.js";

/**
 * Middleware that can be used to protect a route/endpoint 
 * 
 * Extracts JWT token from the `Authorization` header with scheme `Bearer` 
 * 
 * @see {scheme} To define a custom Authorization header JWT scheme  
 */
export const protectedRoute = () => {
  return async (req: Request, _: Response, next: NextFunction) => {
    const authHeader = req.header("Authorization");
    const scheme = "Bearer "

    if (!authHeader) {
      // TODO: Throw error not authenticated
      return next();
    }

    const accessToken = authHeader.replace(scheme, "");

    try {
      tokenManager.validate(accessToken);
      // TODO: Get user from DB

      // TODO: Attach user to req.user

      next();
    } catch (err) {}
  };
};
