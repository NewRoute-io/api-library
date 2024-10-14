import express from "express";

import { basicAuthValidator } from "@/schemas/auth-basic.js";

import { createAuthBasicController } from "@/modules/auth-basic/controllers/authBasic.js";
import { createUserRepository } from "@/repositories/user.js";

import { response } from "@/modules/shared/utils/response.js";

const router = express.Router();

const userRepository = createUserRepository();
const authBasicController = createAuthBasicController(userRepository);

router.post("/signup", async (req, res, next) => {
  const payload = req.body;

  await basicAuthValidator()
    .validate(payload)
    .then(authBasicController.signup)
    .then((result) => res.json(response(result)))
    .catch(next);
});

router.post("/login", async (req, res, next) => {
  const payload = req.body;

  await basicAuthValidator()
    .validate(payload)
    .then(authBasicController.login)
    .then((result) => res.json(response(result)))
    .catch(next);
});

export { router };
