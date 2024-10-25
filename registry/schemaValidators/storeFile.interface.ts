export type GetFileSchema = {
  fileName: string;
};

export type ListFilesSchema = {
  pageToken?: string;
};

export type DeleteFilesSchema = {
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
