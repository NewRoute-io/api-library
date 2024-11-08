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

declare module "http" {
  interface IncomingMessage {
    rawBody: string;
  }
}

app.use(
  express.json({
    verify: (req, _, buf) => {
      // Provide access to the request raw body
      req.rawBody = buf.toString();
    },
  })
);
app.use(express.urlencoded({ extended: false }));

/*------------- Security Config -------------*/
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
