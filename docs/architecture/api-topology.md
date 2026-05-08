# Architecture: API Topology Benchmark

## 1. Benchmark Purpose
The API Topology benchmark is designed to measure and visualize the performance differences in network I/O, connection pooling, and throughput under load between two distinct deployment architectures. 

Unlike the GraphQL AST benchmark (which tests query efficiency), this benchmark tests **raw infrastructure and connection management** by firing 100 concurrent requests to insert `VisitLog` entities.

## 2. The Competitors

### 2.1 Competitor A: Supabase Edge (Serverless)
* **Infrastructure:** Vercel Edge Network (or Supabase Edge Functions) routing directly to the Supabase Data API (PostgREST).
* **Characteristics:** Highly distributed, but susceptible to cold starts and connection limits under sudden massive concurrency. 
* **Data Flow:** Frontend Web Worker ➡️ Supabase SDK / Edge Network ➡️ Supabase REST API ➡️ PostgreSQL.

### 2.2 Competitor B: Render + NeonDB (Long-Running Server)
* **Infrastructure:** A persistent Node.js/Express application hosted on Render, connecting to a Serverless Postgres database (NeonDB) via Drizzle ORM.
* **Characteristics:** The Express server maintains a warm, persistent connection pool to NeonDB. It does not suffer from application-level cold starts, though NeonDB's compute engine handles the auto-scaling and scaling-to-zero capabilities at the database layer.
* **Data Flow:** Frontend Web Worker ➡️ Render Express Server ➡️ Drizzle ORM (Persistent Pool) ➡️ NeonDB PostgreSQL.

## 3. Core Concepts & Implementation

### 3.1 Universal Visitor Registration
To ensure a fair, apples-to-apples comparison, the frontend generates a single `visitorId` (`crypto.randomUUID()`). Before the race begins, this ID must be registered in **both** databases via a synchronized `Promise.all` request.

### 3.2 The Web Worker Payload
The frontend Web Worker (`benchmark.worker.ts`) executes the race. 
* It uses `Promise.allSettled` to fire concurrent insertion requests.
* It measures the round-trip latency for each individual request.
* It streams `PROGRESS` events back to the React UI to animate the progress bars in real-time.

## 4. AI Agent Instructions
When modifying or interacting with the API Topology benchmark (frontend or backend), the AI must follow these rules:
1. **Maintain Benchmark Integrity:** Do not introduce artificial delays (`setTimeout`) or caching mechanisms (like Redis) into either pipeline. This is a raw test of HTTP and Database connection overhead.
2. **Isolate Connection Logic:** Ensure the Drizzle connection pool to NeonDB (`@repo/schema-drizzle`) is instantiated exactly once at the Composition Root (`apps/backend-node/server.ts`) to accurately represent a long-running server.
3. **Handle Concurrency Gracefully:** If adding new metrics (like error rates), ensure the Web Worker catches network failures or HTTP 429 (Too Many Requests) errors without crashing the entire benchmark suite.
