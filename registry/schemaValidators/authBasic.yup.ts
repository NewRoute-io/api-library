import yup from "yup";
import { BasicAuthValidator } from "./authBasic.interface.js";

const basicAuthSchema = yup.object({
  username: yup.string().required(),
  password: yup
    .string()
    .min(12, "Password must be at least 12 characters long")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/\d/, "Password must contain at least one number")
    .required(),
  email: yup.string().email()
});

const refreshTokenSchema = yup.object({
  token: yup.string().uuid().required(),
});

export const basicAuthValidator = (): BasicAuthValidator => {
  return {
    async validateAuth(payload) {
      return await basicAuthSchema.noUnknown().strict(true).validate(payload);
    },

    async validateRefreshToken(payload) {
      return await refreshTokenSchema
        .noUnknown()
        .strict(true)
        .validate(payload);
    },
  };
};
