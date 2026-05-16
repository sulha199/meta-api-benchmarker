import esbuild from "esbuild";
import { readFileSync } from "fs";

const { dependencies, devDependencies } = JSON.parse(
  readFileSync("./package.json", "utf-8"),
);

const external = [
  ...Object.keys(dependencies || {}),
  ...Object.keys(devDependencies || {}),
];

await esbuild.build({
  entryPoints: ["src/api/graphql.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: "api/graphql.js",
  external: external.filter((dep) => !dep.startsWith("@repo/")),
  loader: {
    ".graphql": "text",
  },
});
