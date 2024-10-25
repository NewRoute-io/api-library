import z from "zod";
import { StoreFileValidator } from "./storeFile.interface.js";

const getFileSchema = z.object({
  fileName: z.string(),
});

const listFilesSchema = z.object({
  pageToken: z.string().optional(),
});

const deleteFilesSchema = z.object({
  files: z.array(z.string()),
});

export const storeFileValidator = (): StoreFileValidator => {
  return {
    async validateGetFile(payload) {
      return await getFileSchema.parseAsync(payload);
    },

    async validateListFiles(payload) {
      return await listFilesSchema.parseAsync(payload);
    },

    async validateDeleteFiles(payload) {
      return await deleteFilesSchema.parseAsync(payload);
    },
  };
};
