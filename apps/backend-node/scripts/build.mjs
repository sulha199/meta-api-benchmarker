import esbuild from "esbuild";
import { readFileSync } from "fs";
import { execSync } from "child_process";
import { config } from "dotenv";
import { resolve } from "path";

// Look for .env in the monorepo root
config({ path: resolve(process.cwd(), "../../.env") });

const isLocal = process.env.VERCEL_LOCAL === "1";
const isVercelCloud = process.env.VERCEL === "1";

/**
 * Handle conditional build logic for local vs cloud.
 * Only run slow type-checking if NOT in fast local mode.
 */
if (isLocal) {
  console.log("🔍 [Build] Running type check...");
  try {
    execSync("pnpm tsc --noEmit", { stdio: "inherit" });
  } catch (e) {
    console.error("❌ [Build] Type check failed. Aborting build.");
    process.exit(1);
  }
} else {
  const { dependencies, devDependencies } = JSON.parse(
    readFileSync("./package.json", "utf-8"),
  );

  const external = [
    ...Object.keys(dependencies || {}),
    ...Object.keys(devDependencies || {}),
  ];

  console.log(
    `📦 [Build] Starting bundling with esbuild (Cloud: ${isVercelCloud})...`,
  );

  await esbuild.build({
    entryPoints: ["api/graphql.ts"],
    bundle: true,
    platform: "node",
    format: "cjs",
    // In Vercel Cloud, we must overwrite the .ts file so Vercel uses the bundled output.
    // Locally, we output to .js to avoid polluting the source.
    outfile: isVercelCloud ? "api/graphql.ts" : "api/graphql.js",
    allowOverwrite: isVercelCloud,
    external: external.filter((dep) => !dep.startsWith("@repo/")),
    loader: {
      ".graphql": "text",
    },
  });
}

console.log(
  `✅ [Build] Bundling complete. Output: ${isVercelCloud ? "api/graphql.ts" : "api/graphql.js"}`,
);
