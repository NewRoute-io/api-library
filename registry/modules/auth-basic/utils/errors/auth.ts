import { ResponseError } from "@/modules/shared/utils/errors/ResponseError.js";

export const jwtEnvVariablesMissing = () => {
  return new ResponseError(
    "JWTEnvVariableMissing",
    "JWT env variables missing from your .env file",
    500
  );
};

export const invalidAccessToken = () => {
  return new ResponseError(
    "InvalidAccessToken",
    "The JWT Access Token is not valid, please log in your account again.",
    400
  );
}

export const invalidLoginCredentials = () => {
  return new ResponseError(
    "InvalidLoginCredentials",
    "Your login credentials are not correct, please try logging in again.",
    409
  );
};

export const notAuthenticated = () => {
  return new ResponseError(
    "NotAuthenticated",
    "User not authenticated, please log into your account and try again.",
    401
  );
};

export const usernameNotAvailable = () => {
  return new ResponseError(
    "UsernameNotAvailable",
    "This username is already taken, please choose another one.",
    409
  );
};
