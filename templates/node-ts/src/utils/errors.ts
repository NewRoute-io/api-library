export interface ResponseError extends Error {
  status?: number;
}

export const notImplementedError = () => {
  const error: ResponseError = new Error();
  error.message = "Not Implemented";
  error.name = "NotImplementedError";
  error.status = 501;
  return error;
};

export const badRequestError = () => {
  const error: ResponseError = new Error();
  error.message = "Bad Request";
  error.name = "BadRequestError";
  error.status = 400;
  return error;
};

export const unauthorizedError = () => {
  const error: ResponseError = new Error();
  error.message = "Unauthorized";
  error.name = "UnauthorizedError";
  error.status = 401;
  return error;
};

export const forbiddenError = () => {
  const error: ResponseError = new Error();
  error.message = "Forbidden";
  error.name = "ForbiddenError";
  error.status = 403;
  return error;
};

export const notFoundError = () => {
  const error: ResponseError = new Error();
  error.message = "Resource Not Found";
  error.name = "NotFoundError";
  error.status = 404;
  return error;
};

export const internalServerError = () => {
  const error: ResponseError = new Error();
  error.message = "Internal Server Error";
  error.name = "InternalServerError";
  error.status = 500;
  return error;
};

export const tooManyRequestsError = () => {
  const error: ResponseError = new Error();
  error.message = "Too Many Requests";
  error.name = "TooManyRequestsError";
  error.status = 429;
  return error;
};

export const requestTimeoutError = () => {
  const error: ResponseError = new Error();
  error.message = "Request Timeout";
  error.name = "RequestTimeoutError";
  error.status = 408;
  return error;
};
