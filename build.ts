import * as esbuild from "esbuild";
import path from "path";
import fs from "node:fs";
import { build, loadConfigFromFile, mergeConfig } from "vite";

console.log("bundling for prod...");
console.log("cleaning out dir...");
try {
  fs.rmSync(path.resolve("build"), { recursive: true, force: true });
} catch (e) {
  console.error(e);
  console.log("build directory does not exist, continuing");
}
console.log("bundling client-side");

const clientConfig = await loadConfigFromFile({
  mode: "production",
  command: "build",
  isSsrBuild: false,
});
await build(clientConfig?.config);
console.log("bundling server-side");
const serverBuild = await loadConfigFromFile({
  mode: "production",
  command: "build",
  isSsrBuild: true,
});
await build(
  mergeConfig(serverBuild!.config!, {
    build: {
      ssr: true,
    },
  })
);
console.log("bundling server...");
await esbuild.build({
  logLevel: "debug",
  format: "esm",
  entryPoints: [
    {
      in: "./server.ts",
      out: "server",
    },
    {
      in: "./build/remix/server/index.js",
      out: "remix/server/index",
    },
  ],
  outdir: "build",
  target: "node21",
  platform: "node",
  external: [
    "./remix/server/index.js",
    "vite",
    "lightningcss",
    "sharp",
    "build.ts",
    "vite.config.ts",
  ],
  bundle: true,
  splitting: true,
  inject: ["cjs-shim.ts"],
  alias: {
    "~/*": path.resolve("./app"),
  },
  allowOverwrite: true,
});
