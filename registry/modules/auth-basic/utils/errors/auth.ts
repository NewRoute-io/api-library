import { ResponseError } from "@/modules/shared/utils/errors/index.js";

export const jwtEnvVariablesMissing = () => {
  return new ResponseError(
    "JWTEnvVariableMissing",
    "JWT env variables missing from your .env file",
    500
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
