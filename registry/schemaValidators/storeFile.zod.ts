import z from "zod";
import {
  GetFileSchema,
  ListFilesSchema,
  StoreFileValidator,
  DeleteFilesSchema,
} from "./storeFile.interface.js";

const fileNameSchema = z
  .string()
  .regex(/^[a-zA-Z0-9._-]{1,255}$/, "Invalid file name");

const getFileSchema = z.object({
  userId: z.number(),
  fileName: fileNameSchema,
});

const listFilesSchema = z.object({
  userId: z.number(),
  pageToken: z.string().optional(),
});

const deleteFilesSchema = z.object({
  userId: z.number(),
  files: z.array(fileNameSchema),
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
