import { HttpError } from "@/modules/shared/utils/errors/HttpError.js";

export const emailNotFound = () => {
  return new HttpError(
    "EmailNotFound",
    "No email was found for this user. Please add an email to the account and try again",
    404
  );
};

export const postmarkSendError = (message?: string) => {
  return new HttpError(
    "SendEmailError",
    `There was an internal error sending the email. Error: ${message}`,
    500
  );
};
