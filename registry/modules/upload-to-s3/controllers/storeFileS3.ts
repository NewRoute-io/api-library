import { Request } from "express";
import formidable from "formidable";
import { PassThrough } from "stream";
import {
  GetObjectCommandOutput,
  GetObjectCommand,
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

import {
  GetFileSchema,
  ListFilesSchema,
  DeleteFilesSchema,
} from "@/schemaValidators/storeFile.interface.js";

import {
  fileUploadFailed,
  s3UploadFailed,
  errorDownloadingS3File,
  cantGetS3Files,
} from "@/modules/upload-to-s3/utils/errors/storeFileS3.js";

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
  return {
    uploadFile({ req, fileName }) {
      return new Promise((resolve, reject) => {
        const form = formidable({
          allowEmptyFiles: false,
          fileWriteStreamHandler: () => {
            const passThrough = new PassThrough();
            const uploadParams = {
              Bucket: S3_BUCKET_NAME,
              Key: fileName,
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

        form.on("error", (err) => reject(fileUploadFailed(err?.code)));
      });
    },

    async downloadFile({ fileName }) {
      const data = await s3Client
        .send(new GetObjectCommand({ Bucket: S3_BUCKET_NAME, Key: fileName }))
        .catch(() => {
          throw errorDownloadingS3File(fileName);
        });

      return data;
    },

    async getFileList({ pageToken }) {
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

      const fileNames: FileOutput[] = [];

      list.Contents?.forEach((file) => {
        if (file.Key) {
          fileNames.push({
            name: file.Key,
            size: file.Size,
            modified: file.LastModified,
          });
        }
      });

      return { files: fileNames, nextToken: list.NextContinuationToken };
    },

    async deleteFiles({ files }) {
      const deleteObjectsKeys = files.map((el) => ({ Key: el }));

      await s3Client.send(
        new DeleteObjectsCommand({
          Bucket: S3_BUCKET_NAME,
          Delete: { Objects: deleteObjectsKeys },
        })
      );
    },
  };
};
