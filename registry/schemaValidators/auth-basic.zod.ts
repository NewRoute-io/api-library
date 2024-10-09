import z from "zod";

const basicAuthSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type BasicAuth = z.infer<typeof basicAuthSchema>;

export const validateBasicAuthReq = async (
  payload: BasicAuth
): Promise<BasicAuth> => {
  return await basicAuthSchema.parseAsync(payload);
};
