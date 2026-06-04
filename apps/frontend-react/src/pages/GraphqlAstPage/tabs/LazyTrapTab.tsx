import { useState } from "react";
import { Card, Button } from "@repo/ui";
import { NODE_GRAPHQL_URL, NODE_HEADERS } from "../../../config/constants";
import { useSession } from "../../../contexts/SessionContext";
import { GraphqlAstChart } from "../components/GraphqlAstChart";
import type {
  PropertyTarget,
  SweepResult,
  GraphqlBenchmarkResponse,
} from "../types";

const SWEEP_TARGETS: PropertyTarget[] = [
  {
    label: "Just Title (Scalar)",
    query: "title",
    fields: ["title"],
    relations: [],
  },
  {
    label: "Just Content Body (Heavy Scalar)",
    query: "contentBody",
    fields: ["contentBody"],
    relations: [],
  },
  {
    label: "Just ID (Indexed Scalar)",
    query: "id",
    fields: ["id"],
    relations: [],
  },
  {
    label: "Comments ID (Relation + Indexed)",
    query: "comments { id }",
    fields: [],
    relations: ["comments"],
  },
  {
    label: "Comment Text (Relation + Scalar)",
    query: "comments { commentText }",
    fields: [],
    relations: ["comments"],
  },
];

export function LazyTrapTab() {
  const { visitorId, isRegistered, registerVisitor, pingBackend } =
    useSession();
  const [selectedDbTypes, setSelectedDbTypes] = useState<
    ("POSTGRES" | "MONGO")[]
  >(["POSTGRES"]);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SweepResult[]>([]);

  const toggleDbType = (type: "POSTGRES" | "MONGO") => {
    setSelectedDbTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const runSweep = async () => {
    setIsRunning(true);
    setResults([]);

    // Wake up databases before the sweep
    await pingBackend();

    if (!isRegistered) {
      try {
        await registerVisitor();
      } catch (error) {
        console.error("Failed to register visitor before sweep:", error);
        setIsRunning(false);
        return;
      }
    }

    const endpoints = ["getArticlesOptimized", "getArticlesLazy"] as const;

    for (const dbType of selectedDbTypes) {
      for (const target of SWEEP_TARGETS) {
        for (const endpoint of endpoints) {
          const startTime = performance.now();
          try {
            const response = await fetch(NODE_GRAPHQL_URL, {
              method: "POST",
              headers: NODE_HEADERS,
              body: JSON.stringify({
                query: `
                query GetArticles($dbType: DatabaseType!) {
                  ${endpoint}(dbType: $dbType) {
                    latencyMs
                    payloadSizeKb
                    data {
                      ${target.query}
                    }
                  }
                }
              `,
                variables: { dbType },
              }),
            });

            const json = await response.json();
            const data = json.data[endpoint] as GraphqlBenchmarkResponse;
            const totalLatency = Math.round(performance.now() - startTime);

            const sweepResult: SweepResult = {
              ...target,
              dbType,
              endpoint,
              backendLatency: data.latencyMs,
              totalLatency,
              payloadSize: data.payloadSizeKb,
            };

            setResults((prev) => [...prev, sweepResult]);

            // Submit result to database
            await fetch(NODE_GRAPHQL_URL, {
              method: "POST",
              headers: NODE_HEADERS,
              body: JSON.stringify({
                query: `
                mutation SubmitAstResult($input: SubmitAstResultInput!) {
                  submitAstResult(input: $input) {
                    id
                  }
                }
              `,
                variables: {
                  input: {
                    visitorId,
                    scenario: "PROPERTY_SWEEP",
                    endpoint,
                    databaseType: dbType,
                    queriedFields: target.fields,
                    queriedRelations: target.relations,
                    requestCount: 1,
                    avgLatencyMs: totalLatency,
                    payloadSizeKb: data.payloadSizeKb,
                  },
                },
              }),
            });
          } catch (error) {
            console.error(
              `Sweep failed for target: ${target.label} (${endpoint})`,
              error,
            );
          }
        }
      }
    }
    setIsRunning(false);
  };

  return (
    <Card className="p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">
            Single-Property Benchmark Sweep
          </h3>
          <p className="text-zinc-500 text-sm">
            Isolates the cost of individual fields to establish a performance
            baseline.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={selectedDbTypes.includes("POSTGRES")}
                onChange={() => toggleDbType("POSTGRES")}
                disabled={isRunning}
                className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
              />
              PostgreSQL
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={selectedDbTypes.includes("MONGO")}
                onChange={() => toggleDbType("MONGO")}
                disabled={isRunning}
                className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
              />
              MongoDB
            </label>
          </div>
          <Button
            onClick={runSweep}
            disabled={isRunning || selectedDbTypes.length === 0}
          >
            {isRunning ? "Running Sweep..." : "Start Sweep"}
          </Button>
        </div>
      </div>

      {results.length > 0 && <GraphqlAstChart results={results} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((res, i) => (
          <div key={i} className="border rounded p-3 bg-zinc-50 space-y-1">
            <div className="flex justify-between items-start">
              <div className="font-medium text-sm">{res.label}</div>
              <div className="flex gap-1.5">
                <div className="text-[10px] uppercase font-bold text-zinc-400 bg-white border px-1.5 py-0.5 rounded">
                  {res.dbType}
                </div>
                <div className="text-[10px] uppercase font-bold text-zinc-400 bg-white border px-1.5 py-0.5 rounded">
                  {res.endpoint.replace("getArticles", "")}
                </div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Total Latency: {res.totalLatency}ms</span>
              <span>Backend Latency: {res.backendLatency}ms</span>
              <span>Size: {res.payloadSize}KB</span>
            </div>

            <div className="flex flex-wrap gap-1 mt-2">
              <span
                key={res.query}
                className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100"
              >
                query:{res.query}
              </span>
              {res.relations.map((r: string) => (
                <span
                  key={r}
                  className="text-[9px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-100"
                >
                  relation:{r}
                </span>
              ))}
            </div>

            <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full transition-all ${
                  res.endpoint.includes("Lazy") ? "bg-red-400" : "bg-green-500"
                }`}
                style={{
                  width: `${Math.min(100, (res.totalLatency / 500) * 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
