export type GetFileSchema = {
  userId: string;
  fileName: string;
};

export type ListFilesSchema = {
  userId: string;
  pageToken?: string;
};

export type DeleteFilesSchema = {
  userId: string;
  files: string[];
};

export interface StoreFileValidator {
  validateGetFile: (getFilePayload: GetFileSchema) => Promise<GetFileSchema>;
  validateListFiles: (
    listFilesPayload: ListFilesSchema
  ) => Promise<ListFilesSchema>;
  validateDeleteFiles: (
    deleteFilesPayload: DeleteFilesSchema
  ) => Promise<DeleteFilesSchema>;
}
