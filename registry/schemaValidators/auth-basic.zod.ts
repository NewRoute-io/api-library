import z from "zod";
import { BasicAuthSchema, BasicAuthValidator } from "./auth-basic.interface.js";

const basicAuthSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const basicAuthValidator = (): BasicAuthValidator => {
  return {
    async validate(payload: BasicAuthSchema): Promise<BasicAuthSchema> {
      return await basicAuthSchema.parseAsync(payload);
    },
  };
};
