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
        // Send request directly to Supabase GraphQL API
        const response = await fetch('https://tkdptyyohhgouonivfau.supabase.co/graphql/v1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrZHB0eXlvaGhnb3Vvbml2ZmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MTczNjYsImV4cCI6MjA5MjQ5MzM2Nn0.Ceieg7zLYuKt26sVoNAgT0q6QuB5CQ1gh0boW_Uylss',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrZHB0eXlvaGhnb3Vvbml2ZmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MTczNjYsImV4cCI6MjA5MjQ5MzM2Nn0.Ceieg7zLYuKt26sVoNAgT0q6QuB5CQ1gh0boW_Uylss'
          },
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
              payloadSizeKb: payloadSizeKb,
              totalRoundtripMs: 0
            }
          })
        });

        await response.json();
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
