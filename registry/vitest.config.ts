import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    clearMocks: true,
    reporters: "verbose",
    environment: "node",
    watch: true,
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      reporter: ["text", "json", "html"],
      all: true,
    },
    env: {
      JWT_SECRET_KEY: "testSecretKey",
      JWT_ISSUER: "api.library.tests",
    },
    alias: {
      "@/": new URL("./", import.meta.url).pathname,
    },
  },
});
