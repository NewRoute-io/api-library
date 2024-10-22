export type GetFileSchema = {
  fileName: string;
};

export type ListFilesSchema = {
  pageToken?: string;
};

export interface StoreFileValidator {
  validateGetFile: (basicAuthSchema: GetFileSchema) => Promise<GetFileSchema>;
  validateListFiles: (
    basicAuthSchema: ListFilesSchema
  ) => Promise<ListFilesSchema>;
}
