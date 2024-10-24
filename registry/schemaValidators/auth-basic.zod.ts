import z from "zod";
import { BasicAuthSchema, BasicAuthValidator } from "./auth-basic.interface.js";

const basicAuthSchema = z.object({
  username: z.string(),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number"),
});

const refreshTokenSchema = z.object({
  token: z.string().uuid()
})

export const basicAuthValidator = (): BasicAuthValidator => {
  return {
    async validateAuth(payload: BasicAuthSchema): Promise<BasicAuthSchema> {
      return await basicAuthSchema.parseAsync(payload);
    },

    async validateRefreshToken(payload) {
      return await refreshTokenSchema.parseAsync(payload);
    },
  };
};
