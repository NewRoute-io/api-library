export type BasicAuthSchema = {
  username: string;
  password: string;
};

export type RefreshTokenSchema = {
  token: string;
};

export interface BasicAuthValidator {
  validateAuth: (basicAuthSchema: BasicAuthSchema) => Promise<BasicAuthSchema>;
  validateRefreshToken: (
    payload: RefreshTokenSchema
  ) => Promise<RefreshTokenSchema>;
}
