import { Request } from "express";
import fs from 'fs';
import formidable from "formidable";
import { PassThrough } from 'stream';
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from '@aws-sdk/lib-storage';

import { fileUploadFailed, s3UploadFailed } from "@/modules/upload-to-s3/utils/errors/storeFileS3.js";

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

type StoreFileS3Controller = {
  uploadFile: (req: Request) => Promise<{ s3Location?: string }>;
  downloadFile: (key: string) => void;
  getFilesMeta: () => void;
  deleteFiles: (key: string) => void;
};

export const createStoreFileS3Controller = (): StoreFileS3Controller => {
  const s3Client = new S3Client();

  return {
    async uploadFile(req) {
      return new Promise((resolve, reject) => {
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
            .then((result) => {
              resolve({ s3Location: result.Location });
            })
            .catch(() => reject(s3UploadFailed()));
        });

        form.on("error", (err) => reject(fileUploadFailed(err?.code)));

        form.parse(req);
      });
    },

    async downloadFile(key) {},

    async getFilesMeta() {},

    async deleteFiles(key) {},
  };
};
