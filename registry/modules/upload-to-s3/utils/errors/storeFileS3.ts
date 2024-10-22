import { HttpError } from "@/modules/shared/utils/errors/HttpError.js";

export const fileUploadFailed = (errorCode?: string) => {
  return new HttpError(
    "FileUploadFailed",
    `There was an error uploading your file. ${
      errorCode && "Error code: " + errorCode
    }`,
    400
  );
};

export const s3UploadFailed = () => {
  return new HttpError(
    "S3FileUploadFailed",
    `There was a problem when uploading your file to your S3 storage. Please check logs and try again`,
    400
  );
};
