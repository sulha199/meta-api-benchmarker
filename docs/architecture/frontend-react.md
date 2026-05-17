# Architecture: apps/frontend-react

## 1. Package Purpose

This is the React/Vite Single Page Application (SPA). It acts as the visual dashboard and the benchmark orchestrator. Its primary responsibilities are rendering the UI, managing user session state (registration gating), orchestrating heavy network requests via Web Workers, and visualizing complex benchmark datasets.

## 2. Core Concepts & State Management

### 2.1 Universal Session & Auth Gating

The frontend tracks a user's progress and access level using local storage (e.g., `appStorage`).

- **Anonymous State:** On first load, a user is assigned a raw `visitorId` (`crypto.randomUUID()`). They can view basic UI elements and run standard local benchmarks.
- **Registered State:** To unlock advanced community benchmarks and deep-dive charts, the user must supply a GitHub handle or Email address. Once submitted, the frontend state `isRegistered` becomes `true`.

### 2.2 Feature Gating & Visualization Strategy (GraphqlAstPage)

The `GraphqlAstPage` uses a multi-tab interface where content visibility is strictly controlled by the `isRegistered` state.

A core metric used across these charts is the **Query Complexity Score** (calculated by adding the number of requested fields + the number of relations involved in the AST).

- **Tab 1: The Lazy Trap (Public):** Open to all. Demonstrates the unoptimized N+1 GraphQL query locally.
- **Tab 2: Indexed Search (Public):** Open to all. Demonstrates the basic AST-parsed query optimization locally.
- **Tab 3: Global Latency Insights (Premium / Gated):** \* **Access:** Strictly requires `isRegistered === true`. Shows an Auth Gate UI if anonymous.
  - **Visualization 1: The "Latency Gap" Scatter Plot.**
    - _X-Axis:_ Query Complexity Score.
    - _Y-Axis:_ Latency (ms).
    - _Data:_ Dual series. Red dots for Backend DB Latency, Orange dots for Total Client Latency. The visual gap represents the Network Transit Time caused by massive payloads.
  - **Visualization 2: Latency Composition Stacked Area Chart.**
    - _X-Axis:_ Benchmark Run ID (sorted by total latency).
    - _Y-Axis:_ Time (ms).
    - _Data:_ Bottom stack is DB Execution Time (N+1 loops), Top stack is Network Transit Time.

- **Tab 4: Global Payload Savings (Premium / Gated):**
  - **Access:** Strictly requires `isRegistered === true`. Shows an Auth Gate UI if anonymous.
  - **Visualization 1: The "Bloat" Scatter Plot.**
    - _X-Axis:_ Query Complexity Score.
    - _Y-Axis:_ Response Size (KB).
    - _Data:_ Shows how `SELECT *` operations cause payload sizes to shotgun wildly out of proportion even for low-complexity queries.
  - **Visualization 2: Payload Composition Stacked Area Chart.**
    - _X-Axis:_ Benchmark Run ID.
    - _Y-Axis:_ Size (KB).
    - _Data:_ Bottom stack (Green) is Useful Data (bytes explicitly requested by the GraphQL AST). Top stack (Red) is Wasted Data (over-fetched bytes returned by the DB but stripped by the server).

### 2.3 The Web Worker Orchestration

- **Path:** `apps/frontend-react/src/workers/benchmark.worker.ts`
- **Behavior:** To prevent UI freezing (stuttering CSS animations or locked buttons) during heavy benchmarking, all network I/O is offloaded to a Web Worker. The main React thread only listens for `PROGRESS` and `COMPLETE` messages to update the Tailwind UI visually.

### 2.4 API Topology Orchestration (ApiTopologyPage)

The `ApiTopologyPage` tests raw network throughput and database connection overhead between two distinct cloud topologies.

- **Session Management:** Uses `appStorage` to persist a universal `visitorId`.
- **Universal Registration:** Before running a benchmark, it ensures the `visitorId` is registered in both the Node.js/Neon and Supabase ecosystems via a synchronized `Promise.all` call.
- **Real-time Visualization:**
  - **Progress Bars:** Animated Tailwind CSS bars that reflect the percentage of successful requests completed by the Web Worker.
  - **Competitor Cards:** Displays the infrastructure details (e.g., "Vercel + Neon DB", "Supabase Edge") and their respective cloud regions.
- **Non-Blocking Execution:** Leverages the `benchmark.worker.ts` to fire 100 concurrent requests without impacting the responsiveness of the UI thread.

## 3. AI Agent Instructions

When modifying or interacting with `apps/frontend-react`, the AI must follow these rules:

1. **Respect Auth Gating:** Whenever adding a new "Advanced" or "Premium" feature to a page, always wrap the UI implementation in a check against the user's `isRegistered` state. Provide a fallback UI prompting registration if they are anonymous.
2. **Chart Implementations:** Adhere strictly to the defined chart types (Scatter Plots for variance, Stacked Area Charts for composition). Do not mix completely different units (like ms and KB) on the same Y-axis. Ensure the charting library (e.g., Recharts, Chart.js) is lazy-loaded or strictly typed.
3. **Never Block the Main Thread:** Do not write `for` loops that trigger massive amounts of `fetch()` calls directly inside React components or `useEffect` hooks. Always use the `benchmark.worker.ts` pipeline.
