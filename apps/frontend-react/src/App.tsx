// apps/frontend-react/src/App.tsx
import { useState, useRef } from 'react';

const visitorId = 'ca743435-8e66-4370-b28b-50715945570e';

export default function App() {
  const [progress, setProgress] = useState(0);
  const [isRacing, setIsRacing] = useState(false);

  // Ref to hold our Web Worker instance
  const workerRef = useRef<Worker | null>(null);

  const startBenchmark = () => {
    setIsRacing(true);
    setProgress(0);

    // Initialize the Web Worker
    // Note: The instantiation syntax might vary slightly if you use Next.js
    workerRef.current = new Worker(
      new URL('./workers/benchmark.worker.ts', import.meta.url),
      { type: 'module' }
    );

    // Listen for messages coming BACK from the worker
    workerRef.current.onmessage = (event) => {
      const { type, progress, results } = event.data;

      if (type === 'PROGRESS') {
        setProgress(progress);
      } else if (type === 'COMPLETE') {
        setIsRacing(false);
        console.log("Race finished! Results:", results);
        // Terminate the worker to free up memory
        workerRef.current?.terminate();
      }
    };

    // Send the starting command TO the worker
    workerRef.current.postMessage({
      competitor: 'NODE_JS',
      visitorId,
      requestCount: 100, // Mulai dengan 100 request
      payloadSizeKb: 5,
    });
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Meta API Benchmarker 🏎️</h1>

      <div style={{ margin: '2rem 0' }}>
        <button
          onClick={startBenchmark}
          disabled={isRacing}
          style={{ padding: '1rem 2rem', fontSize: '1.2rem', cursor: isRacing ? 'wait' : 'pointer' }}
        >
          {isRacing ? 'Racing...' : 'Start Node.js Benchmark'}
        </button>
      </div>

      {isRacing && (
        <div>
          <p>Progress: {progress.toFixed(0)}%</p>
          <div style={{ width: '100%', backgroundColor: '#eee', height: '20px' }}>
            <div style={{ width: `${progress}%`, backgroundColor: '#0070f3', height: '100%' }} />
          </div>
        </div>
      )}
    </div>
  );
}
