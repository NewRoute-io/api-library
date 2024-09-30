/**
 * Standardized response format
 * @param {number} status response status (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status).
 * @param {string} message the success or error message.
 * @param {*} params optional parameters to return.
 */
export const response = (status: number, message: string, params: any) => {
  return {
    status: status,
    message: message,
    params: params,
  };
};
