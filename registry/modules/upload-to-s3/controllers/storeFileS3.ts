import { Request } from "express";
import fs from "fs";
import formidable from "formidable";
import { PassThrough } from "stream";
import {
  GetObjectCommandOutput,
  GetObjectCommand,
  S3Client,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

import {
  GetFileSchema,
  ListFilesSchema,
} from "@/schemaValidators/storeFile.interface.js";

import {
  fileUploadFailed,
  s3UploadFailed,
  errorDownloadingS3File,
  cantGetS3Files,
} from "@/modules/upload-to-s3/utils/errors/storeFileS3.js";

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

type FileLocationsArray = (string | undefined)[];
type FileOutput = {
  name: string;
  size?: number;
  modified?: Date;
};
type FileListOutput = { files: FileOutput[]; nextToken: string | undefined };

interface StoreFileS3Controller {
  uploadFile: (req: Request) => Promise<{ s3Locations: FileLocationsArray }>;
  downloadFile: (props: GetFileSchema) => Promise<GetObjectCommandOutput>;
  getFileList: (props: ListFilesSchema) => Promise<FileListOutput>;
  deleteFiles: (props: GetFileSchema) => void;
};

export const createStoreFileS3Controller = (): StoreFileS3Controller => {
  const s3Client = new S3Client();

  return {
    uploadFile(req) {
      return new Promise((resolve, reject) => {
        const fileLocations: FileLocationsArray = [];
        const form = formidable({ allowEmptyFiles: false });

        form.on("fileBegin", (fileName, file) => {
          const passThrough = new PassThrough();
          const fileStream = fs.createReadStream(file.filepath);

          fileStream.pipe(passThrough);

          const uploadParams = {
            Bucket: S3_BUCKET_NAME,
            Key: file.originalFilename || fileName,
            Body: passThrough,
            ContentType: file.mimetype || "application/octet-stream",
          };

          new Upload({ client: s3Client, params: uploadParams })
            .done()
            .then((result) => fileLocations.push(result.Location))
            .catch(() => reject(s3UploadFailed()));
        });

        form.on("error", (err) => reject(fileUploadFailed(err?.code)));
        form.on("end", () => resolve({ s3Locations: fileLocations }));

        form.parse(req);
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

      return { files: fileNames, nextToken: list.ContinuationToken };
    },

    async deleteFiles({ fileName }) {
        
    },
  };
};
