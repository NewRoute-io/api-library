import jwt from "jsonwebtoken";

import { jwtEnvVariablesMissing } from "@/modules/authBasic/utils/errors/auth.js";

/**
 * Example reading public/private keys from a "./keys" folder in rootDir
 *
 * const JWT_PUBLIC_KEY = fs.readFileSync(path.join(process.cwd(), "/keys/jwt_public.key"), { encoding: 'utf8' });
 * const JWT_PRIVATE_KEY = fs.readFileSync(path.join(process.cwd(), "/keys/jwt_private.key"), { encoding: 'utf8' });
 */
const JWT_ISSUER = process.env.JWT_ISSUER; // This is set as the project name in `package.json`
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY as string; // Randomly generated when the API module is installed. Min length: 64 characters

/**
 * JWT Token Manager - Define any JWT-related functions here to reuse JWT configuration
 *
 * @see {algorithm} Use the `RS256` (or equivalent) algorithm with public/private keys if you are building a distributed system or the JWT token will be shared between services
 */
const TokenManager = <T extends string | Buffer | object>(
  secretOrPrivateKey: string,
  secretOrPublicKey: string,
  options: jwt.SignOptions | jwt.VerifyOptions
) => {
  if (!JWT_SECRET_KEY || !JWT_ISSUER) {
    throw jwtEnvVariablesMissing();
  }

  const algorithm = "HS256";

  const sign = (payload: T, signOptions?: jwt.SignOptions) => {
    const jwtSignOptions = Object.assign({ algorithm }, signOptions, options);
    return jwt.sign(payload, secretOrPrivateKey, jwtSignOptions);
  };

  const validate = (token: string, verifyOptions?: jwt.VerifyOptions) => {
    const jwtVerifyOptions = Object.assign(
      { algorithms: algorithm },
      verifyOptions,
      options
    );
    return jwt.verify(token, secretOrPublicKey, jwtVerifyOptions) as T;
  };

  return { validate, sign };
};

type JWTAccessToken = {
  userId: string;
}

export const accessTokenManager = TokenManager<JWTAccessToken>(
  JWT_SECRET_KEY,
  JWT_SECRET_KEY,
  {
    issuer: JWT_ISSUER,
    audience: `${JWT_ISSUER}:client`,
  }
);
