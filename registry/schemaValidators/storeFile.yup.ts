import yup from "yup";
import { StoreFileValidator } from "./storeFile.interface.js";

const fileNameSchema = yup
  .string()
  .matches(/^[a-zA-Z0-9._-]{1,255}$/, "Invalid file name");

const getFileSchema = yup.object({
  userId: yup.number().required(),
  fileName: fileNameSchema.required(),
});

const listFilesSchema = yup.object({
  userId: yup.number().required(),
  pageToken: yup.string(),
});

const deleteFilesSchema = yup.object({
  userId: yup.number().required(),
  files: yup.array(fileNameSchema.required()).required(),
});

export const storeFileValidator = (): StoreFileValidator => {
  return {
    async validateGetFile(payload) {
      return await getFileSchema.noUnknown().strict(true).validate(payload);
    },

    async validateListFiles(payload) {
      return await listFilesSchema.noUnknown().strict(true).validate(payload);
    },

    async validateDeleteFiles(payload) {
      return await deleteFilesSchema.noUnknown().strict(true).validate(payload);
    },
  };
};
