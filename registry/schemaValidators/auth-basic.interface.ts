export type BasicAuthSchema = {
  username: string;
  password: string;
};

export interface BasicAuthValidator {
  validate: (basicAuthPayload: BasicAuthSchema) => Promise<BasicAuthSchema>;
}
