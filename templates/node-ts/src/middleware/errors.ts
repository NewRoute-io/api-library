import { response } from "@/utils/response.js";
import { ResponseError, notImplementedError } from "@/utils/errors.js";
import { NextFunction, Request, RequestHandler, Response } from "express";

// Global Error Handler Middleware
export const globalErrorHandler = (
  err: ResponseError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { message, name } = err;
  const status = err.status || 500;

  if (process.env.NODE_ENV !== "production") {
    console.error(`Timestamp: ${new Date().toISOString()}`);
    console.error("Error:", err);
  }

  const errorObj = {
    error: {
      name: status !== 500 ? name : "InternalServerError",
      message:
        status !== 500
          ? message
          : "There was an internal server error, please try again later.",
    },
  };

  res.status(status).send(response(status, "Request failed", errorObj));
};

// Middleware for handling requests that don't match any available router
export const endpointNotImplemented: RequestHandler = (_req, _res, next) => {
  next(notImplementedError());
};
