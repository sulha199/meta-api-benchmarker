import {
  NODE_GRAPHQL_URL,
  NODE_HEADERS,
  SUPABASE_GRAPHQL_ENDPOINT,
  SUPABASE_HEADERS,
  type Competitor,
} from "../config/constants";

/**
 * Define the structure of the message data for type safety within the worker
 */
export type BenchmarkMessage = {
  competitor: Competitor;
  visitorId: string;
  requestCount: number;
  payloadSizesKb: number[];
};

export type BenchmarkResult = {
  success: boolean;
  /** Duration in miliseconds */
  duration: number;
  payloadSizeKb: number;
  competitor: Competitor;
};

/**
 * Web Worker for generating load and measuring API performance.
 */
self.onmessage = async (event: MessageEvent<BenchmarkMessage>) => {
  const { competitor, visitorId, requestCount, payloadSizesKb } = event.data;

  const totalRequests = payloadSizesKb.length * requestCount;
  let completedRequests = 0;
  const results: BenchmarkResult[] = [];

  for (const size of payloadSizesKb) {
    // 1. Generate the dummy payload per size
    const dummyPayload = "A".repeat(size * 1024);

    for (let i = 0; i < requestCount; i++) {
      const startTime = performance.now();

      try {
        if (competitor === "Node.js") {
          // Send request to Vercel Serverless
          const response = await fetch(NODE_GRAPHQL_URL, {
            method: "POST",
            headers: NODE_HEADERS,
            body: JSON.stringify({
              query: `
                mutation SubmitBenchmark(
                  $visitorId: ID!,
                  $environment: Environment!,
                  $payloadSizeKb: Int!,
                  $dummyPayload: String,
                  $totalRoundtripMs: Int
                ) {
                  submitBenchmark(
                    visitorId: $visitorId,
                    environment: $environment,
                    payloadSizeKb: $payloadSizeKb,
                    dummyPayload: $dummyPayload,
                    totalRoundtripMs: $totalRoundtripMs
                  ) {
                    id
                  }
                }
              `,
              variables: {
                visitorId: visitorId,
                environment: "NODE_JS",
                payloadSizeKb: size,
                dummyPayload: dummyPayload,
                totalRoundtripMs: 0,
              },
            }),
          });

          await response.json();
        } else if (competitor === "Supabase") {
          // Send request directly to Supabase GraphQL API
          const response = await fetch(SUPABASE_GRAPHQL_ENDPOINT, {
            method: "POST",
            headers: SUPABASE_HEADERS,
            body: JSON.stringify({
              query: `
                mutation InsertBenchmark(
                  $visitorId: UUID!,
                  $environment: environment!,
                  $payloadSizeKb: Int!,
                  $totalRoundtripMs: Int
                ) {
                  insertIntobenchmarksCollection(objects: [{
                    visitor_id: $visitorId,
                    environment: $environment,
                    payload_size_kb: $payloadSizeKb,
                    total_roundtrip_ms: $totalRoundtripMs
                  }]) {
                    records {
                      id
                    }
                  }
                }
              `,
              variables: {
                visitorId: visitorId,
                environment: "Supabase",
                payloadSizeKb: size,
                totalRoundtripMs: 0,
              },
            }),
          });

          await response.json();
        }

        const endTime = performance.now();
        const durationMs = Math.round(endTime - startTime);

        results.push({
          success: true,
          duration: durationMs,
          payloadSizeKb: size,
          competitor,
        });

        completedRequests++;
        self.postMessage({
          type: "PROGRESS",
          progress: (completedRequests / totalRequests) * 100,
          currentRoundtrip: durationMs,
        });
      } catch (error) {
        console.error("Worker request failed:", error);
        results.push({
          success: false,
          duration: Math.round(performance.now() - startTime),
          payloadSizeKb: size,
          competitor,
        });
        completedRequests++;
      }
    }
  }

  // Report final completion with all data
  self.postMessage({ type: "COMPLETE", results });
};
