import z from "zod";
import { BasicAuthValidator } from "./authBasic.interface.js";

const basicAuthSchema = z.object({
  username: z.string(),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number"),
  email: z.string().email().optional(),
});

const refreshTokenSchema = z.object({
  token: z.string().uuid(),
});

export const basicAuthValidator = (): BasicAuthValidator => {
  return {
    async validateAuth(payload) {
      return await basicAuthSchema.parseAsync(payload);
    },

    async validateRefreshToken(payload) {
      return await refreshTokenSchema.parseAsync(payload);
    },
  };
};
