// apps/frontend-react/src/App.tsx
import { useState, useEffect } from 'react';
import { registerSupabaseVisitor, registerNodeJsVisitor } from './utils/visitor';
import { INITIAL_PROGRESS, type Competitor } from './config/constants';
import type { BenchmarkMessage } from './workers/benchmark.worker';
import { appStorage } from './utils/storage';

export default function App() {
  // UI State
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Data State
  const [visitorId, setVisitorId] = useState<string>('');
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  // Benchmark State
  const [activeCompetitor, setActiveCompetitor] = useState<Competitor | null>(null);
  const [progress, setProgress] = useState<Record<Competitor, number>>(INITIAL_PROGRESS);

  // 1. Asynchronously load or generate the visitor ID and registration status on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Fetch persistent registration status
        const storedRegStatus = await appStorage.get('meta_is_registered', false);
        setIsRegistered(storedRegStatus || false);

        // Fetch or create persistent Visitor ID
        let storedId = await appStorage.get('meta_visitor_id');

        if (!storedId) {
          storedId = crypto.randomUUID();
          await appStorage.set('meta_visitor_id', storedId);
        }

        setVisitorId(storedId);
      } catch (error) {
        console.error("Failed to initialize session data:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeSession();
  }, []);

  /**
    * Universal function to start the benchmark
  */
  const startBenchmark = async (competitor: 'Node.js' | 'Supabase') => {
    // 1. Check if there's already a race in progress for any competitor
    if (activeCompetitor) {
      console.warn("A benchmark is already running!");
      return;
    }

    // 2. Register visitor if not already done
    if (!isRegistered) {
      console.log(`Registering universal Visitor ID: ${visitorId}...`);
      try {
        // Run both registrations in parallel to save time
        await Promise.all([
          registerNodeJsVisitor(visitorId),
          registerSupabaseVisitor(visitorId)
        ]);
        setIsRegistered(true);// Persist the updated status asynchronously
        await appStorage.set('meta_is_registered', true);
        console.log('Successfully registered in both ecosystems!');
      } catch (error) {
        console.error('Failed to register visitor:', error);
        return; // Stop execution if registration fails
      }
    };

    // 3. Reset progress for the chosen competitor before starting and lock the UI
    setProgress(prev => ({ ...prev, [competitor]: 0 }));
    setActiveCompetitor(competitor);

    // 4. Initialize and start your Web Worker here
    const worker = new Worker(
      new URL('./workers/benchmark.worker.ts', import.meta.url),
      { type: 'module' }
    );

    // 5. Handle messages from Worker
    worker.onmessage = (event) => {
      const { type, progress: currentProgress, results } = event.data;

      if (type === 'PROGRESS') {
        setProgress(prev => ({
          ...prev,
          [competitor]: currentProgress
        }));
      }

      if (type === 'COMPLETE') {
        console.log(`Benchmark for ${competitor} finished!`, results);
        setActiveCompetitor(null);
        worker.terminate();
      }
    };

    // 6. Start the race
    console.log(`Starting benchmark for ${competitor}...`);
    worker.postMessage({
      competitor: competitor,
      visitorId,
      requestCount: 100,
      payloadSizeKb: 5,
    } satisfies BenchmarkMessage);
  };

  const handleResetSession = async () => {
    // Await the asynchronous removal of persistent data
    await appStorage.remove('meta_visitor_id');
    await appStorage.remove('meta_is_registered');
    window.location.reload();
  };

  // 2. Prevent rendering the interface until the async storage is resolved
  if (isInitializing) {
    return <div className="p-8">Loading session data...</div>;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Meta API Benchmarker 🏎️</h1>

      <div className="mb-6 bg-gray-100 p-4 rounded">
        <p>Session Visitor ID: <strong className="font-mono">{visitorId}</strong></p>
        <button
          onClick={handleResetSession}
          className="text-sm text-red-600 underline mt-2"
        >
          Reset Session & ID
        </button>
      </div>

      {/* Node.js Section */}
      <div className="mb-4">
        <button
          onClick={() => startBenchmark('Node.js')}
          disabled={activeCompetitor !== null}
        >
          {activeCompetitor === 'Node.js' ? 'Running Node.js...' : 'Start Node.js Race'}
        </button>
        <p>Progress: {progress['Node.js'].toFixed(0)}%</p>
      </div>

      {/* Supabase Section */}
      <div className="mb-4">
        <button
          onClick={() => startBenchmark('Supabase')}
          disabled={activeCompetitor !== null}
        >
          {activeCompetitor === 'Supabase' ? 'Running Supabase...' : 'Start Supabase Race'}
        </button>
        <p>Progress: {progress['Supabase'].toFixed(0)}%</p>
      </div>
    </div>
  );
}
