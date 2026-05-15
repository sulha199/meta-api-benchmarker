import express from "express";
import handler from "../dist/index.js";
import { config } from "dotenv";
import { resolve } from "path";

// Ensure env vars are loaded even if not using the bundle's internal loader
config({ path: resolve(process.cwd(), "../../.env") });

const app = express();

// Vercel's body parsing behavior
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle the GraphQL endpoint
app.all("/api/graphql", async (req, res) => {
  try {
    await handler(req, res);
  } catch (err) {
    console.error("Error in handler:", err);
    res.status(500).send("Internal Server Error");
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(
    `\x1b[32m%s\x1b[0m`,
    `> Local Vercel Simulation running at http://localhost:${PORT}/api/graphql`,
  );
  console.log(`> Injected environment from monorepo root`);
});
