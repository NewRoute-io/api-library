import express from "express";

import { storeFileValidator } from "@/schemaValidators/storeFile.zod.js";

import { protectedRoute } from "@/modules/auth-basic/middleware/authBasic/jwt.js";

import { response } from "@/modules/shared/utils/response.js";
import { createStoreFileS3Controller } from "@/modules/upload-to-s3/controllers/storeFileS3.js";

const storeFileController = createStoreFileS3Controller()
const router = express.Router();

router.post("/upload", protectedRoute, async (req, res, next) => {
  await storeFileController
    .uploadFile(req)
    .then((result) => res.json(response(result)))
    .catch(next);
});

router.get("/:fileKey", protectedRoute, async (req, res, next) => {
    const fileName = req.params.reqKey;

    await storeFileValidator()
      .validateGetFile({ fileName })
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

router.get("/files", protectedRoute, async (req, res, next) => {
    const pageToken = req.query.pageToken as string;

    await storeFileValidator()
      .validateListFiles({ pageToken })
      .then(storeFileController.getFileList)
      .then((result) => res.json(response(result)))
      .catch(next);
  });

// TODO: Route to delete files

export { router as storeFileS3Router };
