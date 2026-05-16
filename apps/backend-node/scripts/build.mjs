import esbuild from "esbuild";
import { readFileSync } from "fs";

const { dependencies, devDependencies } = JSON.parse(
  readFileSync("./package.json", "utf-8"),
);

const external = [
  ...Object.keys(dependencies || {}),
  ...Object.keys(devDependencies || {}),
];

const isVercel = process.env.VERCEL === "1";

await esbuild.build({
  entryPoints: ["api/graphql.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: isVercel ? "api/graphql.ts" : "api/graphql.js",
  allowOverwrite: isVercel,
  external: external.filter((dep) => !dep.startsWith("@repo/")),
  loader: {
    ".graphql": "text",
  },
});
