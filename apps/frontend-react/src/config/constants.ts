// apps/frontend-react/src/constants.ts

// Determine if we should use the cloud backend
const USE_CLOUD_BACKEND = import.meta.env.VITE_USE_CLOUD_BACKEND === "true";

// Capture all environment variables
export const NODE_GRAPHQL_URL = USE_CLOUD_BACKEND
  ? (import.meta.env.VITE_NODE_GRAPHQL_URL_CLOUD as string)
  : (import.meta.env.VITE_NODE_GRAPHQL_URL_LOCAL as string);

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Centralized validation
if (!NODE_GRAPHQL_URL || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "⚠️ CRITICAL WARNING: Environment Variables are missing in the root .env file!",
  );
}

// Centralized type for our competitors to ensure consistency
export type Competitor = "Node.js" | "Supabase";

// Initial progress state structure
export const INITIAL_PROGRESS: Record<Competitor, number> = {
  "Node.js": 0,
  Supabase: 0,
};

// ==========================================
// FETCH CONFIGURATIONS (DRY)
// ==========================================

// 1. Dedicated GraphQL endpoint
export const SUPABASE_GRAPHQL_ENDPOINT = `${SUPABASE_URL}/graphql/v1` as const;

// 2. Standard Headers object for Supabase
export const SUPABASE_HEADERS = {
  "Content-Type": "application/json",
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}` as const,
};

// 3. Standard Headers object for Node.js
export const NODE_HEADERS = {
  "Content-Type": "application/json",
};
