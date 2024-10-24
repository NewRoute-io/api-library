import yup from "yup";
import {
  GetFileSchema,
  ListFilesSchema,
  StoreFileValidator,
  DeleteFilesSchema,
} from "./storeFile.interface.js";

const getFileSchema = yup.object({
  fileName: yup.string().required(),
});

const listFilesSchema = yup.object({
  pageToken: yup.string(),
});

const deleteFilesSchema = yup.object({
  files: yup.array(yup.string().required()).required(),
});

export const storeFileValidator = (): StoreFileValidator => {
  return {
    async validateGetFile(payload): Promise<GetFileSchema> {
      return await getFileSchema.noUnknown().strict(true).validate(payload);
    },

    async validateListFiles(payload): Promise<ListFilesSchema> {
      return await listFilesSchema.noUnknown().strict(true).validate(payload);
    },

    async validateDeleteFiles(payload): Promise<DeleteFilesSchema> {
      return await deleteFilesSchema.noUnknown().strict(true).validate(payload);
    },
  };
};
