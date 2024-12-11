import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    clearMocks: true,
    reporters: "verbose",
    environment: "node",
    watch: true,
    poolOptions:{
      threads:{
        singleThread: true
      }
    },
    coverage: {
      provider: "istanbul",
      reportsDirectory: "./coverage",
      reporter: ["text", "json", "html"],
      exclude: [
        ...configDefaults.coverage.exclude || [],
        "repositories/*",
        "schemaValidators/*",
        "**/router/*",
        "**/middleware/*",
        "**/errors/*"
      ],
    },
    env: {
      JWT_SECRET_KEY: "testSecretKey",
      JWT_ISSUER: "api.library.tests",
      S3_BUCKET_NAME: "mockBucketName",
      S3_BUCKET_REGION: "us-east-1",
      POSTMARK_SERVER_TOKEN: "xxxx-xxxxx-xxxx-xxxxx-xxxxxx",
      PG_CONNECTION_STRING: "postgresql://postgres:password@localhost:5432/postgres"
    },
    alias: {
      "@/": new URL("./", import.meta.url).pathname,
    },
  },
});
