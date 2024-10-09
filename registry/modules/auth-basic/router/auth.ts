import express from "express";
import { validateBasicAuthReq } from "@/schemas/auth.js";

import { signup, login } from "@/modules/auth-basic/controllers/auth.js";
import { response } from "@/modules/shared/utils/response.js";

const router = express.Router();

router.post("/signup", async (req, res, next) => {
  const payload = req.body;

  await validateBasicAuthReq(payload)
    .then(signup)
    .then((result) => res.json(response(result)))
    .catch(next);
});

router.post("/login", async (req, res, next) => {
  const payload = req.body;

  await validateBasicAuthReq(payload)
    .then(login)
    .then((result) => res.json(response(result)))
    .catch(next);
});

export { router };
