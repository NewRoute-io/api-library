import yup from "yup";
import { BasicAuthSchema, BasicAuthValidator } from "./auth-basic.interface.js";

const basicAuthSchema = yup.object({
  username: yup.string().required(),
  password: yup.string().required(),
});

export const basicAuthValidator = (): BasicAuthValidator => {
  return {
    async validate(payload: BasicAuthSchema): Promise<BasicAuthSchema> {
      return await basicAuthSchema.noUnknown().strict(true).validate(payload);
    },
  };
};
