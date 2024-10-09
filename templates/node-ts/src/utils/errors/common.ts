import { ResponseError } from "@/utils/errors/index.js";

export const notImplementedError = () => {
  return new ResponseError("NotImplementedError", "Not Implemented", 501);
};

export const badRequestError = () => {
  return new ResponseError("BadRequestError", "Bad Request", 400);
};

export const unauthorizedError = () => {
  return new ResponseError("UnauthorizedError", "Unauthorized", 401);
};

export const forbiddenError = () => {
  return new ResponseError("ForbiddenError", "Forbidden", 403);
};

export const notFoundError = () => {
  return new ResponseError("NotFoundError", "Resource Not Found", 404);
};

export const internalServerError = () => {
  return new ResponseError("InternalServerError", "Internal Server Error", 500);
};

export const tooManyRequestsError = () => {
  return new ResponseError("TooManyRequestsError", "Too Many Requests", 429);
};

export const requestTimeoutError = () => {
  return new ResponseError("RequestTimeoutError", "Request Timeout", 408);
};
