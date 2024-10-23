import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  format: ["esm"],
  entry: ["src/server.ts"],
  minify: true,
  target: "es2022",
  outDir: "dist",
  splitting: false,
  sourcemap: true,
});
