import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command }) => {
  return {
    plugins: [
      remix({
        appDirectory: "./app",
        serverModuleFormat: "esm",
        buildDirectory: "./build/remix",
      }),
      tsconfigPaths(),
    ],
    ...(command === "build" && {
      // Bundle this otherwise remix will try to import the CJS bundle...
      ssr: {
        noExternal: ["react"],
      },
    }),
  };
});
