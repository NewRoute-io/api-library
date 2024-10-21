import { HttpError } from "./errors/HttpError.js";

/**
 * Standardized response format
 * @param {T} data optional parameters to return.
 * @param {HttpError | Error} error the success or error message.
 */
export const response = <T>(data?: T, error?: HttpError | Error) => {
  if (error !== undefined) {
    return { error: { name: error?.name, message: error?.message } };
  }
  return { data };
};
