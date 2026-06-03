# Architecture: API Topology Benchmark

## 1. Benchmark Purpose

The API Topology benchmark is designed to measure and visualize the performance differences in network I/O, connection pooling, and throughput under load between two distinct deployment architectures.

Unlike the GraphQL AST benchmark (which tests query efficiency), this benchmark tests **raw infrastructure and connection management** by firing an automated sweep of requests across multiple payload sizes (1KB to 100KB) to insert `VisitLog` entities.

## 2. The Competitors

### 2.1 Competitor A: Supabase Edge (Serverless)

- **Infrastructure:** Supabase Edge Network routing directly to the Supabase Data API (GraphQL/PostgREST).
- **Region:** South Asia (Mumbai).
- **Characteristics:** Highly distributed Edge Runtime. Optimized for low-latency data access at the edge, but susceptible to cold starts and connection limits under sudden massive concurrency.
- **Data Flow:** Frontend Web Worker ➡️ Supabase GraphQL API ➡️ PostgreSQL.

### 2.2 Competitor B: Node.js on Vercel + NeonDB (Serverless)

- **Infrastructure:** A Node.js/Express application hosted on Vercel (Serverless Functions), connecting to a Serverless Postgres database (NeonDB) via Drizzle ORM.
- **Region:** AWS US East 1 (N. Virginia).
- **Characteristics:** Runs on the standard Vercel Node.js runtime. While serverless, it uses Drizzle to manage connections to NeonDB. This setup tests the overhead of a full Node.js execution environment compared to a direct Data API.
- **Data Flow:** Frontend Web Worker ➡️ Vercel Serverless Function (Node.js) ➡️ Drizzle ORM ➡️ NeonDB PostgreSQL.

## 3. Core Concepts & Implementation

### 3.1 Universal Visitor Registration

To ensure a fair, apples-to-apples comparison, the frontend generates a single `visitorId` (`crypto.randomUUID()`). Before the race begins, this ID must be registered in **both** databases via a synchronized `Promise.all` request.

### 3.2 The Web Worker Payload

The frontend Web Worker (`benchmark.worker.ts`) executes the automated sweep.

- It iterates through a predefined list of payload sizes.
- For each size, it fires a series of sequential insertion requests.
- It measures the round-trip latency for each individual request.
- It streams `PROGRESS` events back to the React UI to animate the progress bars in real-time.
- It returns a complete dataset of all request durations and success states upon completion.

## 4. AI Agent Instructions

When modifying or interacting with the API Topology benchmark (frontend or backend), the AI must follow these rules:

1. **Maintain Benchmark Integrity:** Do not introduce artificial delays (`setTimeout`) or caching mechanisms (like Redis) into either pipeline. This is a raw test of HTTP and Database connection overhead.
2. **Isolate Connection Logic:** Ensure the Drizzle connection pool to NeonDB (`@repo/adapter-drizzle`) is instantiated exactly once at the Composition Root (`apps/backend-node/server.ts`) to accurately represent a long-running server.
3. **Handle Concurrency Gracefully:** If adding new metrics (like error rates), ensure the Web Worker catches network failures or HTTP 429 (Too Many Requests) errors without crashing the entire benchmark suite.
