import yup from "yup";

const basicAuthSchema = yup.object({
  username: yup.string().required(),
  password: yup.string().required(),
});

export type BasicAuth = yup.InferType<typeof basicAuthSchema>;

export const validateBasicAuthReq = async (
  payload: BasicAuth
): Promise<BasicAuth> => {
  return await basicAuthSchema.noUnknown().strict(true).validate(payload);
};
