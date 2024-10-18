export type BasicAuthSchema = {
  username: string;
  password: string;
};

export interface BasicAuthValidator {
  validate: (basicAuthSchema: BasicAuthSchema) => Promise<BasicAuthSchema>;
}
