# Implementation Plan: API Topology Performance Charts

## Objective

Enhance the `ApiTopologyPage` to benchmark and visualize how different payload sizes affect network and database latency for Node.js vs. Supabase. Implement an automated payload sweep, persist the results locally, and visualize the data using two charts: a `LineChart` for the latest run and a `ScatterChart` for historical comparisons.

## Key Files & Context

- `apps/frontend-react/package.json`: Needs `recharts` added as a dependency.
- `apps/frontend-react/src/pages/ApiTopologyPage.tsx`: Needs UI updates to support multiple runs, persistence, and charting.
- `apps/frontend-react/src/workers/benchmark.worker.ts`: Needs modification to accept an array of payload sizes instead of a single size, executing the request count per payload size.
- `apps/frontend-react/src/utils/storage.ts`: Used to persist and retrieve the historical scatter plot data (`appStorage`).

## Implementation Steps

### 1. Install Dependencies

- Add `"recharts": "^2.15.0"` (or latest stable) to `apps/frontend-react/package.json`.

### 2. Update Benchmark Worker (`benchmark.worker.ts`)

- Modify `BenchmarkMessage` type to accept `payloadSizesKb: number[]` instead of a single `payloadSizeKb`.
- Update `BenchmarkResult` to include `payloadSizeKb: number` and `competitor: Competitor`.
- Refactor the worker's execution loop:
  - Iterate over the `payloadSizesKb` array.
  - Inside that, loop `requestCount` times.
  - Update the progress calculation to account for `totalRequests = payloadSizesKb.length * requestCount`.
  - Push results structured as `{ success, duration, payloadSizeKb, competitor }`.

### 3. State Management & Storage Integration (`ApiTopologyPage.tsx`)

- Define a sweep configuration (e.g., `PAYLOAD_SIZES = [1, 5, 25, 50, 100]`).
- On page load, retrieve historical data from `appStorage.get("meta_topology_history")`.
- Introduce local state variables for `latestRunData` (array of averages/points for the line chart) and `historicalData` (raw points for the scatter chart).
- On worker `COMPLETE`:
  - Process `results` to calculate averages per payload size for the `LineChart`.
  - Append the raw `results` to `historicalData`, updating state.
  - Persist the updated `historicalData` to `appStorage.set("meta_topology_history", ... )`.

### 4. Charting Implementation (`ApiTopologyPage.tsx`)

- Add a new section below the competitor cards for visual insights.
- **Latest Run (LineChart):**
  - Plot `payloadSizeKb` on the X-axis and average `duration` (ms) on the Y-axis.
  - Include two line series: one for Node.js and one for Supabase.
- **Historical Data (ScatterChart):**
  - Plot all persisted runs. X-axis: `payloadSizeKb`, Y-axis: `duration` (ms).
  - Use distinct colors (e.g., red vs. green) to distinguish the two competitors' scatter points.
- Ensure the charts are responsive using Recharts' `<ResponsiveContainer>`.

## Verification & Testing

- Start the app and navigate to the API Topology page.
- Trigger a benchmark for Node.js; verify the progress bar reaches 100% and the `LineChart` populates.
- Trigger a benchmark for Supabase; verify its lines map onto the same chart.
- Check the `ScatterChart` to confirm individual data points are plotted for both runs.
- Refresh the page and confirm the `ScatterChart` retains all previous data points via `appStorage`.
