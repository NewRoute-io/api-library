import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    clearMocks: true,
    reporters: "verbose",
    environment: "node",
    watch: true,
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
    env: {},
    alias: {
      "@/": new URL("./", import.meta.url).pathname,
    },
  },
});
