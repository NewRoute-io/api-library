import { HttpError } from "./errors/HttpError.js";

/**
 * Standardized response format
 * @param {T} data optional parameters to return.
 * @param {HttpError | Error} error the success or error message.
 */
export const response = <T>(data?: T, error?: HttpError | Error) => {
  if (error !== undefined) {
    const errMessage = error.name === "ZodError" ? JSON.parse(error.message) : error.message;

    return { error: { name: error?.name, message: errMessage } };
  }
  return { data };
};
