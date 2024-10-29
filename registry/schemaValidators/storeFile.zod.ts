import z from "zod";
import {
  GetFileSchema,
  ListFilesSchema,
  StoreFileValidator,
  DeleteFilesSchema,
} from "./storeFile.interface.js";

const getFileSchema = z.object({
  userId: z.string(),
  fileName: z.string(),
});

const listFilesSchema = z.object({
  userId: z.string(),
  pageToken: z.string().optional(),
});

const deleteFilesSchema = z.object({
  userId: z.string(),
  files: z.array(z.string()),
});

export const storeFileValidator = (): StoreFileValidator => {
  return {
    async validateGetFile(payload): Promise<GetFileSchema> {
      return await getFileSchema.parseAsync(payload);
    },

    async validateListFiles(payload): Promise<ListFilesSchema> {
      return await listFilesSchema.parseAsync(payload);
    },

    async validateDeleteFiles(payload): Promise<DeleteFilesSchema> {
      return await deleteFilesSchema.parseAsync(payload);
    },
  };
};
