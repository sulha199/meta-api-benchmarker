import { Card } from "@repo/ui";
import { Zap, Star } from "lucide-react";
import type { SweepResult } from "../types";

interface BenchmarkTableProps {
  results: SweepResult[];
}

export function GraphqlAstTable({ results }: BenchmarkTableProps) {
  const queries = Array.from(new Set(results.map((r) => r.query)));

  const getMetric = (
    query: string,
    dbType: "POSTGRES" | "MONGO",
    endpoint: "getArticlesLazy" | "getArticlesOptimized",
    metric: "backendLatency" | "payloadSize",
  ) => {
    const result = results.find(
      (r) =>
        r.query === query && r.dbType === dbType && r.endpoint === endpoint,
    );
    return result ? result[metric] : "-";
  };

  const isSuperior = (
    query: string,
    val: number | string,
    metric: "backendLatency" | "payloadSize",
  ) => {
    if (typeof val !== "number") return false;
    const rowResults = results.filter((r) => r.query === query);
    const minVal = Math.min(
      ...rowResults.map((r) => r[metric]).filter((v) => typeof v === "number"),
    );
    return val === minVal;
  };

  const isGroupSuperior = (
    query: string,
    dbType: "POSTGRES" | "MONGO",
    val: number | string,
    metric: "backendLatency" | "payloadSize",
  ) => {
    if (typeof val !== "number") return false;
    const groupResults = results.filter(
      (r) => r.query === query && r.dbType === dbType,
    );
    const minVal = Math.min(
      ...groupResults
        .map((r) => r[metric])
        .filter((v) => typeof v === "number"),
    );
    return val === minVal;
  };

  const renderCell = (
    q: string,
    dbType: "POSTGRES" | "MONGO",
    endpoint: "getArticlesLazy" | "getArticlesOptimized",
    metric: "backendLatency" | "payloadSize",
    unit: string,
  ) => {
    const val = getMetric(q, dbType, endpoint, metric);
    const superior = isSuperior(q, val, metric);
    const groupSuperior = isGroupSuperior(q, dbType, val, metric);
    const isOptimized = endpoint === "getArticlesOptimized";

    return (
      <div className="flex items-center justify-center gap-1">
        {superior ? (
          <Zap className="w-2.5 h-2.5 fill-amber-400 text-amber-500 animate-pulse" />
        ) : (
          groupSuperior && (
            <Star className="w-2.5 h-2.5 fill-zinc-300 text-zinc-400" />
          )
        )}
        <span
          className={`font-mono text-xs ${
            isOptimized ? "text-green-600 font-bold" : ""
          }`}
        >
          {val}
          <span
            className={`text-[10px] ml-0.5 ${
              isOptimized ? "opacity-60" : "text-zinc-400"
            }`}
          >
            {unit}
          </span>
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-6 items-center px-2 py-1 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800 w-fit">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          <Zap className="w-3 h-3 fill-amber-400 text-amber-500" />
          <span>Global Best</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          <Star className="w-3 h-3 fill-zinc-300 text-zinc-400" />
          <span>Engine Best</span>
        </div>
      </div>
      <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <th
                  rowSpan={2}
                  className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-r border-zinc-100 dark:border-zinc-800"
                >
                  GraphQL Query
                </th>
                <th
                  colSpan={4}
                  className="p-2 text-center text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 border-r border-zinc-100 dark:border-zinc-800"
                >
                  PostgreSQL Engine
                </th>
                <th
                  colSpan={4}
                  className="p-2 text-center text-[10px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400"
                >
                  MongoDB Engine
                </th>
              </tr>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                {/* Postgres Columns */}
                <th
                  colSpan={2}
                  className="p-2 text-center text-[9px] font-bold text-zinc-400 border-r border-zinc-100 dark:border-zinc-800"
                >
                  Lazy Trap
                </th>
                <th
                  colSpan={2}
                  className="p-2 text-center text-[9px] font-bold text-green-600 border-r border-zinc-100 dark:border-zinc-800"
                >
                  Optimized
                </th>
                {/* Mongo Columns */}
                <th
                  colSpan={2}
                  className="p-2 text-center text-[9px] font-bold text-zinc-400 border-r border-zinc-100 dark:border-zinc-800"
                >
                  Lazy Trap
                </th>
                <th
                  colSpan={2}
                  className="p-2 text-center text-[9px] font-bold text-green-600"
                >
                  Optimized
                </th>
              </tr>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30 text-[9px] uppercase font-medium text-zinc-400">
                <th className="p-2 border-r border-zinc-100 dark:border-zinc-800"></th>
                {/* PG Lazy */}
                <th className="p-2 text-center border-r border-zinc-100 dark:border-zinc-800">
                  Lat
                </th>
                <th className="p-2 text-center border-r border-zinc-100 dark:border-zinc-800">
                  Size
                </th>
                {/* PG Opt */}
                <th className="p-2 text-center border-r border-zinc-100 dark:border-zinc-800">
                  Lat
                </th>
                <th className="p-2 text-center border-r border-zinc-100 dark:border-zinc-800">
                  Size
                </th>
                {/* Mongo Lazy */}
                <th className="p-2 text-center border-r border-zinc-100 dark:border-zinc-800">
                  Lat
                </th>
                <th className="p-2 text-center border-r border-zinc-100 dark:border-zinc-800">
                  Size
                </th>
                {/* Mongo Opt */}
                <th className="p-2 text-center border-r border-zinc-100 dark:border-zinc-800">
                  Lat
                </th>
                <th className="p-2 text-center">Size</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {queries.map((q) => (
                <tr
                  key={q}
                  className="border-b border-zinc-50 dark:border-zinc-900 last:border-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
                >
                  <td className="p-4 font-mono text-[11px] text-blue-600 dark:text-blue-400 border-r border-zinc-100 dark:border-zinc-800">
                    {q}
                  </td>
                  {/* Postgres Metrics */}
                  <td className="p-2 text-center border-r border-zinc-50 dark:border-zinc-900">
                    {renderCell(
                      q,
                      "POSTGRES",
                      "getArticlesLazy",
                      "backendLatency",
                      "ms",
                    )}
                  </td>
                  <td className="p-2 text-center border-r border-zinc-100 dark:border-zinc-800">
                    {renderCell(
                      q,
                      "POSTGRES",
                      "getArticlesLazy",
                      "payloadSize",
                      "kb",
                    )}
                  </td>
                  <td className="p-2 text-center border-r border-zinc-50 dark:border-zinc-900">
                    {renderCell(
                      q,
                      "POSTGRES",
                      "getArticlesOptimized",
                      "backendLatency",
                      "ms",
                    )}
                  </td>
                  <td className="p-2 text-center border-r border-zinc-100 dark:border-zinc-800">
                    {renderCell(
                      q,
                      "POSTGRES",
                      "getArticlesOptimized",
                      "payloadSize",
                      "kb",
                    )}
                  </td>

                  {/* Mongo Metrics */}
                  <td className="p-2 text-center border-r border-zinc-50 dark:border-zinc-900">
                    {renderCell(
                      q,
                      "MONGO",
                      "getArticlesLazy",
                      "backendLatency",
                      "ms",
                    )}
                  </td>
                  <td className="p-2 text-center border-r border-zinc-100 dark:border-zinc-800">
                    {renderCell(
                      q,
                      "MONGO",
                      "getArticlesLazy",
                      "payloadSize",
                      "kb",
                    )}
                  </td>
                  <td className="p-2 text-center border-r border-zinc-50 dark:border-zinc-900">
                    {renderCell(
                      q,
                      "MONGO",
                      "getArticlesOptimized",
                      "backendLatency",
                      "ms",
                    )}
                  </td>
                  <td className="p-2 text-center">
                    {renderCell(
                      q,
                      "MONGO",
                      "getArticlesOptimized",
                      "payloadSize",
                      "kb",
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
