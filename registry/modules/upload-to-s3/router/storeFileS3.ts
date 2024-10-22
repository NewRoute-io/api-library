import express from "express";

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

// TODO: Route to get file

// TODO: Route to get list of files (return only meta?)

// TODO: Route to delete files

export { router as storeFileS3Router };
