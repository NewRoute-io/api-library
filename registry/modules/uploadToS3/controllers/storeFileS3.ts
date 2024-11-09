import { Request } from "express";
import formidable from "formidable";
import { PassThrough } from "stream";
import {
  GetObjectCommandOutput,
  GetObjectCommand,
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

import {
  GetFileSchema,
  ListFilesSchema,
  DeleteFilesSchema,
} from "@/schemaValidators/storeFile.interface.js";

import {
  fileParseError,
  s3UploadFailed,
  errorDownloadingS3File,
  s3FileNotFound,
  cantGetS3Files,
} from "@/modules/uploadToS3/utils/errors/storeFileS3.js";

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

interface UploadFile extends GetFileSchema {
  req: Request;
}

type UploadedFileLoc = { s3Location: string | undefined };
type FileOutput = {
  name: string;
  size?: number;
  modified?: Date;
};
type FileListOutput = { files: FileOutput[]; nextToken: string | undefined };

interface StoreFileS3Controller {
  uploadFile: (props: UploadFile) => Promise<UploadedFileLoc>;
  downloadFile: (props: GetFileSchema) => Promise<GetObjectCommandOutput>;
  getFileList: (props: ListFilesSchema) => Promise<FileListOutput>;
  deleteFiles: (props: DeleteFilesSchema) => void;
}

export const createStoreFileS3Controller = (
  s3Client: S3Client
): StoreFileS3Controller => {
  const generateFileName = (userId: number, name: string) => {
    return `owner:${userId}_name:${name}`;
  };

  return {
    uploadFile({ req, fileName, userId }) {
      return new Promise((resolve, reject) => {
        const form = formidable({
          allowEmptyFiles: false,
          fileWriteStreamHandler: () => {
            const passThrough = new PassThrough();
            const uploadParams = {
              Bucket: S3_BUCKET_NAME,
              Key: generateFileName(userId, fileName),
              Body: passThrough,
            };

            new Upload({ client: s3Client, params: uploadParams })
              .done()
              .then((result) => resolve({ s3Location: result.Location }))
              .catch(() => reject(s3UploadFailed()));

            return passThrough;
          },
        });

        form.parse(req);

        form.on("error", (err) => reject(fileParseError(err?.code)));
      });
    },

    async downloadFile({ fileName, userId }) {
      const data = await s3Client
        .send(
          new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: generateFileName(userId, fileName),
          })
        )
        .catch((err: S3ServiceException) => {
          if (err.name === "NoSuchKey") {
            throw s3FileNotFound(fileName);
          } else {
            throw errorDownloadingS3File(fileName);
          }
        });

      return data;
    },

    async getFileList({ pageToken, userId }) {
      const list = await s3Client
        .send(
          new ListObjectsV2Command({
            Bucket: S3_BUCKET_NAME,
            ContinuationToken: pageToken,
          })
        )
        .catch(() => {
          throw cantGetS3Files();
        });

      const fileNames: FileOutput[] =
        list.Contents?.filter((file) =>
          file.Key?.includes(`owner:${userId}`)
        ).map((file) => ({
          name: file.Key!.split("name:")[1],
          size: file.Size,
          modified: file.LastModified,
        })) || [];

      list.Contents?.forEach((file) => {
        if (file.Key) {
          fileNames.push({
            name: file.Key.split("name:")[1],
            size: file.Size,
            modified: file.LastModified,
          });
        }
      });

      return { files: fileNames, nextToken: list.NextContinuationToken };
    },

    async deleteFiles({ files, userId }) {
      const deleteObjectsKeys = files.map((name) => ({
        Key: generateFileName(userId, name),
      }));

      await s3Client.send(
        new DeleteObjectsCommand({
          Bucket: S3_BUCKET_NAME,
          Delete: { Objects: deleteObjectsKeys },
        })
      );
    },
  };
};
