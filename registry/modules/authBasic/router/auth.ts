import express from "express";

import { basicAuthValidator } from "@/schemaValidators/auth-basic.zod.js";

import { createAuthBasicController } from "@/modules/authBasic/controllers/authBasic.js";
import { createUserRepository } from "@/repositories/user.postgres.js";
import { createRefreshTokenRepository } from "@/repositories/refreshToken.postgres.js";

import { response } from "@/modules/shared/utils/response.js";

const router = express.Router();

const userRepository = createUserRepository();
const refreshTokenRepository = createRefreshTokenRepository();

const authBasicController = createAuthBasicController(
  userRepository,
  refreshTokenRepository
);

router.post("/signup", async (req, res, next) => {
  const payload = req.body;

  await basicAuthValidator()
    .validateAuth(payload)
    .then(authBasicController.signup)
    .then((result) => res.json(response(result)))
    .catch(next);
});

router.post("/login", async (req, res, next) => {
  const payload = req.body;

  await basicAuthValidator()
    .validateAuth(payload)
    .then(authBasicController.login)
    .then((result) => res.json(response(result)))
    .catch(next);
});

router.post("/refresh-token", async (req, res, next) => {
  const payload = req.body;

  await basicAuthValidator()
    .validateRefreshToken(payload)
    .then(authBasicController.refreshToken)
    .then((result) => res.json(response(result)))
    .catch(next);
});

export { router };
