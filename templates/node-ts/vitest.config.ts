import { configDefaults, defineConfig } from "vitest/config";
import path from "path";

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
        "**/repositories/*",
        "**/schemas/*",
        "**/routes/*",
        "**/middleware/*",
        "**/errors/*"
      ],
    },
    env: {},
    alias: [
      {
        find: new RegExp('^@/(.*)$'),
        replacement: path.resolve(__dirname, './src/$1'),
      }
    ],
  },
});
