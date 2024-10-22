import z from "zod";
import {
  GetFileSchema,
  ListFilesSchema,
  StoreFileValidator,
} from "./storeFile.interface.js";

const getFileSchema = z.object({
  fileName: z.string(),
});

const listFilesSchema = z.object({
  pageToken: z.string().optional(),
});

export const storeFileValidator = (): StoreFileValidator => {
  return {
    async validateGetFile(payload): Promise<GetFileSchema> {
      return await getFileSchema.parseAsync(payload);
    },

    async validateListFiles(payload): Promise<ListFilesSchema> {
      return await listFilesSchema.parseAsync(payload);
    },
  };
};
