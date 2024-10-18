import { ResponseError } from "./errors/ResponseError.js";

/**
 * Standardized response format
 * @param {T} data optional parameters to return.
 * @param {ResponseError | Error} error the success or error message.
 */
export const response = <T>(data?: T, error?: ResponseError | Error) => {
  return { data, error: { name: error?.name, message: error?.message } };
};
