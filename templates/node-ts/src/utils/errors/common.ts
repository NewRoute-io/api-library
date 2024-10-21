import { HttpError } from "@/utils/errors/HttpError.js";

export const notImplementedError = () => {
  return new HttpError("NotImplementedError", "Not Implemented", 501);
};

export const badRequestError = () => {
  return new HttpError("BadRequestError", "Bad Request", 400);
};

export const unauthorizedError = () => {
  return new HttpError("UnauthorizedError", "Unauthorized", 401);
};

export const forbiddenError = () => {
  return new HttpError("ForbiddenError", "Forbidden", 403);
};

export const notFoundError = () => {
  return new HttpError("NotFoundError", "Resource Not Found", 404);
};

export const internalServerError = () => {
  return new HttpError("InternalServerError", "Internal Server Error", 500);
};

export const tooManyRequestsError = () => {
  return new HttpError("TooManyRequestsError", "Too Many Requests", 429);
};

export const requestTimeoutError = () => {
  return new HttpError("RequestTimeoutError", "Request Timeout", 408);
};
