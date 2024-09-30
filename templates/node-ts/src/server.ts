import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";

import {
  endpointNotImplemented,
  globalErrorHandler,
} from "@/middleware/errors.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

/*------------- Security Config -------------*/
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(helmet());

/*------------- Endpoints -------------*/

/**
 * Example endpoint definition:
 *
 * app.use("/api/user", v1.user);
 */

/*------------- Error middleware -------------*/
app.use(endpointNotImplemented);
app.use(globalErrorHandler);

app.listen(PORT, () => console.log(`Service listening on port ${PORT}...`));
