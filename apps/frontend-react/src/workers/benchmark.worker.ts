/**
 * Web Worker for generating load and measuring API performance.
 */
self.onmessage = async (event: MessageEvent) => {
  const { competitor, visitorId, requestCount, payloadSizeKb } = event.data;

  // 1. Generate the dummy payload
  // In JavaScript, a standard ASCII character takes 1 byte.
  // 1 KB = 1024 bytes. We repeat the character 'A' to reach the desired KB size.
  const dummyPayload = "A".repeat(payloadSizeKb * 1024);
  const results = [];

  for (let i = 0; i < requestCount; i++) {
    const startTime = performance.now();

    try {
      if (competitor === 'NODE_JS') {
        // Send request to Vercel Serverless
        const response = await fetch('http://localhost:3000/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              mutation SubmitBenchmark(
                $visitorId: ID!,
                $environment: String!,
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
              environment: 'Node.js',
              payloadSizeKb: payloadSizeKb,
              dummyPayload: dummyPayload,
              // We calculate a preliminary roundtrip time here (though actual is calculated after)
              // For a true benchmark, we will track the time after the await
              totalRoundtripMs: 0
            }
          })
        });

        // Wait for the JSON response to ensure the request is completely finished
        await response.json();
      } else if (competitor === 'SUPABASE') {
        // Placeholder for Supabase target
      }

      // Calculate the total time taken from request start to response parsing
      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime);

      results.push({ success: true, duration: durationMs });

      // Report progress back to the main React thread
      self.postMessage({
        type: 'PROGRESS',
        progress: ((i + 1) / requestCount) * 100,
        currentRoundtrip: durationMs
      });

    } catch (error) {
      console.error("Worker request failed:", error);
      results.push({ success: false, duration: Math.round(performance.now() - startTime) });
    }
  }

  // Report final completion with all data
  self.postMessage({ type: 'COMPLETE', results });
};
