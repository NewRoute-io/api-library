import z from "zod";
import { EmailValidator } from "./email.interface.js";

const sendEmailSchema = z.object({
  receiverId: z.number(),
  templateName: z.string(),
  payload: z.record(z.string()),
});

const bulkEmailSchema = z.object({
  receiverIds: z.array(z.number()),
  templateName: z.string(),
  payload: z.record(z.string()),
});

export const emailValidator = (): EmailValidator => {
  return {
    async validateSendEmail(payload) {
      return await sendEmailSchema.parseAsync(payload);
    },

    async validateBulkEmail(payload) {
      return await bulkEmailSchema.parseAsync(payload);
    },
  };
};
