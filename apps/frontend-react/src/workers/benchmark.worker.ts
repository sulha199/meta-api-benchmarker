// apps/frontend-react/src/workers/benchmark.worker.ts

/**
 * Web Worker for handling intense API requests.
 * Runs on a separate thread to prevent React UI from freezing during the benchmark.
 */
self.onmessage = async (event: MessageEvent) => {
  const { competitor, visitorId, requestCount, payloadSizeKb } = event.data;

  // Create a dummy string payload based on the requested size
  const dummyPayload = "A".repeat(payloadSizeKb * 1024);
  const results = [];

  for (let i = 0; i < requestCount; i++) {
    const startTime = performance.now();

    try {
      if (competitor === 'NODE_JS') {
        // Ping our Vercel Node.js GraphQL API
        await fetch('http://localhost:3000/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              mutation SubmitBenchmark($visitorId: ID!, $environment: String!, $payloadSizeKb: Int!) {
                submitBenchmark(
                  visitorId: $visitorId,
                  environment: $environment,
                  payloadSizeKb: $payloadSizeKb
                ) {
                  id
                }
              }
            `,
            variables: {
              visitorId: visitorId,
              environment: "Node.js",
              payloadSizeKb: payloadSizeKb,
              // We will add the generated dummy string here later to test bandwidth
            }
          })
        });
      } else if (competitor === 'SUPABASE') {
        // Supabase target logic will be added here later
      }

      const endTime = performance.now();
      results.push({ success: true, duration: endTime - startTime });

      // Report progress back to the React UI after each request
      self.postMessage({
        type: 'PROGRESS',
        progress: ((i + 1) / requestCount) * 100
      });

    } catch (error) {
      results.push({ success: false, duration: performance.now() - startTime });
    }
  }

  // Report final completion
  self.postMessage({ type: 'COMPLETE', results });
};
