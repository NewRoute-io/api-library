import { HttpError } from "@/modules/shared/utils/errors/HttpError.js";

export const jwtEnvVariablesMissing = () => {
  return new HttpError(
    "JWTEnvVariableMissing",
    "JWT env variables missing from your .env file",
    500
  );
};

export const invalidAccessToken = () => {
  return new HttpError(
    "InvalidAccessToken",
    "The JWT Access Token is not valid, please log in your account again.",
    400
  );
}

export const invalidLoginCredentials = () => {
  return new HttpError(
    "InvalidLoginCredentials",
    "Your login credentials are not correct, please try logging in again.",
    409
  );
};

export const notAuthenticated = () => {
  return new HttpError(
    "NotAuthenticated",
    "User not authenticated, please log into your account and try again.",
    401
  );
};

export const usernameNotAvailable = () => {
  return new HttpError(
    "UsernameNotAvailable",
    "This username is already taken, please choose another one.",
    409
  );
};
