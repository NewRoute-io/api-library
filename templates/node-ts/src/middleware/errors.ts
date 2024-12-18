import { response } from "@/utils/response.js";
import { notImplementedError } from "@/utils/errors/common.js";
import { HttpError } from "@/utils/errors/HttpError.js";
import { NextFunction, Request, RequestHandler, Response } from "express";

// Global Error Handler Middleware
export const globalErrorHandler = (
  err: HttpError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(`Timestamp: ${new Date().toISOString()}`);
    console.error("Error:", err);
  }

  const responseStatus = err instanceof HttpError ? err.status : 500;
  res.status(responseStatus).send(response(undefined, err));
};

// Middleware for handling requests that don't match any available router
export const endpointNotImplemented: RequestHandler = (_req, _res, next) => {
  next(notImplementedError());
};
