import express from "express";
import { S3Client } from "@aws-sdk/client-s3";

import { storeFileValidator } from "@/schemaValidators/storeFile.zod.js";

import { createStoreFileS3Controller } from "@/modules/upload-to-s3/controllers/storeFileS3.js";
import { protectedRoute } from "@/modules/auth-basic/middleware/authBasic/jwt.js";

import { response } from "@/modules/shared/utils/response.js";

const s3Client = new S3Client();
const storeFileController = createStoreFileS3Controller(s3Client);
const router = express.Router();

router.post("/upload/:fileName", protectedRoute, async (req, res, next) => {
  const { fileName } = req.params;
  const { userId } = req.user!;

  await storeFileValidator()
    .validateGetFile({ fileName, userId })
    .then((val) =>
      storeFileController.uploadFile({ req, fileName: val.fileName, userId })
    )
    .then((result) => res.json(response(result)))
    .catch(next);
});

router
  .route("/files")
  .get(protectedRoute, async (req, res, next) => {
    const pageToken = req.query.pageToken as string;
    const { userId } = req.user!;

    await storeFileValidator()
      .validateListFiles({ pageToken, userId })
      .then(storeFileController.getFileList)
      .then((result) => res.json(response(result)))
      .catch(next);
  })
  .delete(protectedRoute, async (req, res, next) => {
    const payload = req.body;

    await storeFileValidator()
      .validateDeleteFiles(payload)
      .then(storeFileController.deleteFiles)
      .then((result) => res.json(response(result)))
      .catch(next);
  });

router
  .route("/:fileKey")
  .get(protectedRoute, async (req, res, next) => {
    const fileName = req.params.fileKey;
    const { userId } = req.user!;

    await storeFileValidator()
      .validateGetFile({ fileName, userId })
      .then(storeFileController.downloadFile)
      .then((result) => {
        res.setHeader(
          "Content-Type",
          result.ContentType || "application/octet-stream"
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${fileName}"`
        );

        res.send(result.Body);
      })
      .catch(next);
  })
  .delete(protectedRoute, async (req, res, next) => {
    const fileName = req.params.fileKey;
    const { userId } = req.user!;

    await storeFileValidator()
      .validateDeleteFiles({ files: [fileName], userId })
      .then(storeFileController.deleteFiles)
      .then((result) => res.json(response(result)))
      .catch(next);
  });

export { router as storeFileS3Router };
