import { HttpError } from "@/modules/shared/utils/errors/HttpError.js";

export const fileParseError = (errorCode?: string) => {
  return new HttpError(
    "FileParseError",
    `File couldn't be parsed, please try again. ${
      errorCode && "Error code: " + errorCode
    }`,
    400
  );
};

export const s3UploadFailed = () => {
  return new HttpError(
    "FileUploadFailed",
    `There was a problem uploading your file`,
    500
  );
};

export const errorDownloadingS3File = (fileName: string) => {
  return new HttpError(
    "ErrorDownloadingFile",
    `There was a problem downloading file ${fileName}`,
    400
  );
};

export const s3FileNotFound = (fileName: string) => {
  return new HttpError(
    "FileNotFound",
    `File ${fileName} couldn't be found`,
    404
  );
};

export const cantGetS3Files = () => {
  return new HttpError("CantGetFiles", `Couldn't get your files`, 400);
};
