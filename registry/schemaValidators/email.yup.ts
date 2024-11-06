import yup from "yup";
import { EmailValidator } from "./email.interface.js";

const sendEmailSchema = yup.object({
  receiverId: yup.number().required(),
  templateName: yup.string().required(),
  payload: yup.object().required(),
});

const bulkEmailSchema = yup.object({
  receiverIds: yup.array(yup.number().required()).required(),
  templateName: yup.string().required(),
  payload: yup.object().required(),
});

export const emailValidator = (): EmailValidator => {
  return {
    async validateSendEmail(payload) {
      return await sendEmailSchema.noUnknown().strict(true).validate(payload);
    },

    async validateBulkEmail(payload) {
      return await bulkEmailSchema.noUnknown().strict(true).validate(payload);
    },
  };
};
