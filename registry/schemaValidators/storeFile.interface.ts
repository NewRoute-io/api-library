export type GetFileSchema = {
  userId: number;
  fileName: string;
};

export type ListFilesSchema = {
  userId: number;
  pageToken?: string;
};

export type DeleteFilesSchema = {
  userId: number;
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
