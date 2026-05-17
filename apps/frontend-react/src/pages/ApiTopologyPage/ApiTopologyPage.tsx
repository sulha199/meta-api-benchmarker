import { useState, useEffect, useMemo } from "react";
import {
  registerSupabaseVisitor,
  registerNodeJsVisitor,
} from "../../utils/visitor";
import { INITIAL_PROGRESS, type Competitor } from "../../config/constants";
import type {
  BenchmarkMessage,
  BenchmarkResult,
} from "../../workers/benchmark.worker";
import { appStorage } from "../../utils/storage";
import { Button, Card } from "@repo/ui";
import { ApiTopologyPageChart } from "./ApiTopologyPageChart";

const PAYLOAD_SIZES = [1, 5, 10, 25, 50, 100];
const STORAGE_KEY = "meta_topology_history";

export function ApiTopologyPage() {
  // UI State
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Data State
  const [visitorId, setVisitorId] = useState<string>("");
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  // Benchmark State
  const [activeCompetitor, setActiveCompetitor] = useState<Competitor | null>(
    null,
  );
  const [progress, setProgress] =
    useState<Record<Competitor, number>>(INITIAL_PROGRESS);

  // Results State
  const [nodeLatest, setNodeLatest] = useState<
    { payload: number; duration: number }[]
  >([]);
  const [supabaseLatest, setSupabaseLatest] = useState<
    { payload: number; duration: number }[]
  >([]);
  const [historicalData, setHistoricalData] = useState<BenchmarkResult[]>([]);

  // 1. Asynchronously load or generate the visitor ID and registration status on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const storedRegStatus = await appStorage.get(
          "meta_is_registered",
          false,
        );
        setIsRegistered(storedRegStatus || false);

        let storedId = await appStorage.get("meta_visitor_id");
        if (!storedId) {
          storedId = crypto.randomUUID();
          await appStorage.set("meta_visitor_id", storedId);
        }

        setVisitorId(storedId);

        // Load historical data
        const history = await appStorage.get(STORAGE_KEY, []);
        if (history) setHistoricalData(history);
      } catch (error) {
        console.error("Failed to initialize session data:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeSession();
  }, []);

  // Compute chart data for Latest Run
  const latestChartData = useMemo(() => {
    return PAYLOAD_SIZES.map((size) => ({
      payload: size,
      NodeJS: nodeLatest.find((d) => d.payload === size)?.duration,
      Supabase: supabaseLatest.find((d) => d.payload === size)?.duration,
    }));
  }, [nodeLatest, supabaseLatest]);

  /**
   * Universal function to start the benchmark
   */
  const startBenchmark = async (competitor: "Node.js" | "Supabase") => {
    if (activeCompetitor) {
      console.warn("A benchmark is already running!");
      return;
    }

    if (!isRegistered) {
      console.log(`Registering universal Visitor ID: ${visitorId}...`);
      try {
        await Promise.all([
          registerNodeJsVisitor(visitorId),
          registerSupabaseVisitor(visitorId),
        ]);
        setIsRegistered(true);
        await appStorage.set("meta_is_registered", true);
        console.log("Successfully registered in both ecosystems!");
      } catch (error) {
        console.error("Failed to register visitor:", error);
        return;
      }
    }

    setProgress((prev) => ({ ...prev, [competitor]: 0 }));
    setActiveCompetitor(competitor);

    const worker = new Worker(
      new URL("../../workers/benchmark.worker.ts", import.meta.url),
      { type: "module" },
    );

    worker.onmessage = (event) => {
      const {
        type,
        progress: currentProgress,
        results,
      } = event.data as {
        type: string;
        progress: number;
        results: BenchmarkResult[];
      };

      if (type === "PROGRESS") {
        setProgress((prev) => ({
          ...prev,
          [competitor]: currentProgress,
        }));
      }

      if (type === "COMPLETE") {
        console.log(`Benchmark for ${competitor} finished!`, results);

        // 1. Calculate Averages for latest run
        const averages = PAYLOAD_SIZES.map((size) => {
          const pointsForSize = results.filter(
            (r) => r.payloadSizeKb === size && r.success,
          );
          const avg = pointsForSize.length
            ? pointsForSize.reduce((acc, curr) => acc + curr.duration, 0) /
              pointsForSize.length
            : 0;
          return { payload: size, duration: Math.round(avg) };
        });

        if (competitor === "Node.js") setNodeLatest(averages);
        else setSupabaseLatest(averages);

        // 2. Update Historical Data
        setHistoricalData((prev) => {
          const updated = [...prev, ...results];
          // Keep it to a reasonable limit if needed, but for now just save
          appStorage.set(STORAGE_KEY, updated);
          return updated;
        });

        setActiveCompetitor(null);
        worker.terminate();
      }
    };

    console.log(`Starting sweep benchmark for ${competitor}...`);
    worker.postMessage({
      competitor: competitor,
      visitorId,
      requestCount: 10, // 10 requests per payload size for the sweep
      payloadSizesKb: PAYLOAD_SIZES,
    } satisfies BenchmarkMessage);
  };

  const handleResetSession = async () => {
    await appStorage.remove("meta_visitor_id");
    await appStorage.remove("meta_is_registered");
    await appStorage.remove(STORAGE_KEY);
    window.location.reload();
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-zinc-500 animate-pulse">Loading session data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          API Topology Benchmark
        </h2>
        <p className="text-zinc-500 mt-2">
          Vercel Serverless (Node.js) vs. Supabase Edge (PostgREST)
        </p>
      </div>

      {/* Session Manager Card */}
      <Card className="p-6 bg-zinc-50/50 dark:bg-zinc-900/50 border-dashed">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-sm text-zinc-500">
              Active Session ID
            </h3>
            <p className="font-mono text-sm mt-1 bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded inline-block">
              {visitorId}
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleResetSession}
            disabled={activeCompetitor !== null}
          >
            Reset Session & History
          </Button>
        </div>
      </Card>

      {/* Competitor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Node.js / Vercel Card */}
        <Card className="p-6 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-semibold">Node.js Express</h3>
              <p className="text-sm text-zinc-500 mt-1">
                Vercel + Neon DB (AWS US East 1)
              </p>
            </div>
            <span className="text-2xl font-bold text-zinc-300 dark:text-zinc-700">
              {progress["Node.js"].toFixed(0)}%
            </span>
          </div>

          <div className="mt-auto space-y-4">
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-zinc-900 dark:bg-zinc-100 h-full transition-all duration-300 ease-out"
                style={{ width: `${progress["Node.js"]}%` }}
              />
            </div>

            <Button
              className="w-full"
              onClick={() => startBenchmark("Node.js")}
              disabled={activeCompetitor !== null}
              variant={activeCompetitor === "Node.js" ? "secondary" : "default"}
            >
              {activeCompetitor === "Node.js"
                ? "Running Sweep..."
                : "Start Node.js Race"}
            </Button>
          </div>
        </Card>

        {/* Supabase / Vercel Card */}
        <Card className="p-6 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-semibold">Supabase Edge</h3>
              <p className="text-sm text-zinc-500 mt-1">
                Edge Network (South Asia Mumbai)
              </p>
            </div>
            <span className="text-2xl font-bold text-zinc-300 dark:text-zinc-700">
              {progress["Supabase"].toFixed(0)}%
            </span>
          </div>

          <div className="mt-auto space-y-4">
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-emerald-600 dark:bg-emerald-500 h-full transition-all duration-300 ease-out"
                style={{ width: `${progress["Supabase"]}%` }}
              />
            </div>

            <Button
              className="w-full"
              onClick={() => startBenchmark("Supabase")}
              disabled={activeCompetitor !== null}
              variant={
                activeCompetitor === "Supabase" ? "secondary" : "default"
              }
            >
              {activeCompetitor === "Supabase"
                ? "Running Sweep..."
                : "Start Supabase Race"}
            </Button>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <ApiTopologyPageChart
        latestChartData={latestChartData}
        historicalData={historicalData}
      />
    </div>
  );
}

export default ApiTopologyPage;
