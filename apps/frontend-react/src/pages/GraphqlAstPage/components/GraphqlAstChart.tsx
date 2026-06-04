import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";
import { Card } from "@repo/ui";
import type { SweepResult } from "../types";

const QUERY_COLORS = [
  "#3b82f6", // Blue 500
  "#a855f7", // Purple 500
  "#ec4899", // Pink 500
  "#f97316", // Orange 500
  "#eab308", // Yellow 500
  "#06b6d4", // Cyan 500
];

interface GraphqlAstChartProps {
  results: SweepResult[];
}

export function GraphqlAstChart({ results }: GraphqlAstChartProps) {
  const queryDbPairs = Array.from(
    new Set(results.map((r) => `${r.query}|${r.dbType}`)),
  );
  const queries = Array.from(new Set(results.map((r) => r.query)));

  return (
    <Card className="p-6 shadow-sm border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Field-Level Impact Analysis
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Comparing <strong>Optimized</strong> vs <strong>Lazy</strong> (The
            Trap) per field.
          </p>
        </div>
        <div className="flex gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <div className="w-3 h-3 rounded-full bg-green-500" /> Optimized
          </span>
          <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <div className="w-3 h-3 rounded-full bg-red-500" /> Lazy (Trap)
          </span>
        </div>
      </div>

      <div className="h-[450px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 80, bottom: 20, left: 20 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              className="text-zinc-200 dark:text-zinc-800"
            />
            <XAxis
              type="number"
              dataKey="payloadSize"
              name="Payload"
              unit="KB"
              stroke="currentColor"
              className="text-zinc-400"
              fontSize={11}
              label={{
                value: "Payload Size (KB)",
                position: "insideBottom",
                offset: -10,
                fontSize: 11,
                fill: "currentColor",
              }}
            />
            <YAxis
              type="number"
              dataKey="backendLatency"
              name="Latency"
              unit="ms"
              stroke="currentColor"
              className="text-zinc-400"
              fontSize={11}
              label={{
                value: "Latency (ms)",
                angle: -90,
                position: "insideLeft",
                fontSize: 11,
                fill: "currentColor",
              }}
            />
            <ZAxis type="number" range={[100, 100]} />

            <Tooltip
              cursor={{ strokeDasharray: "3 3", stroke: "#71717a" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as SweepResult;
                return (
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 shadow-md rounded text-[10px]">
                    <div className="font-bold text-zinc-400 dark:text-zinc-500 uppercase mb-1">
                      {d.endpoint.replace("getArticles", "")} ({d.dbType})
                    </div>
                    <div className="font-mono text-blue-600 dark:text-blue-400 mb-1">
                      {d.query}
                    </div>
                    <div className="flex justify-between gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-1 text-zinc-900 dark:text-zinc-100">
                      <span>{d.payloadSize} KB</span>
                      <span>{d.backendLatency} ms</span>
                    </div>
                  </div>
                );
              }}
            />

            <Legend verticalAlign="top" height={36} />

            {queryDbPairs.map((pair) => {
              const [q, db] = pair.split("|");
              const queryData = results
                .filter((r) => r.query === q && r.dbType === db)
                .sort((a, b) => a.payloadSize - b.payloadSize);

              const colorIdx = queries.indexOf(q);
              const color = QUERY_COLORS[colorIdx % QUERY_COLORS.length];

              return (
                <Scatter
                  key={pair}
                  name={`${q} (${db})`}
                  data={queryData}
                  line={{
                    stroke: color,
                    strokeWidth: db === "MONGO" ? 2 : 1,
                    strokeDasharray: db === "MONGO" ? "5 5" : undefined,
                    strokeOpacity: 0.9,
                  }}
                  lineType="joint"
                  lineJointType="monotone"
                  fill={color}
                  fillOpacity={0.6}
                >
                  {queryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.endpoint === "getArticlesOptimized"
                          ? "#22c55e"
                          : "#ef4444"
                      }
                    />
                  ))}
                  <LabelList
                    dataKey="query"
                    position="right"
                    offset={10}
                    fontSize={10}
                    className="fill-zinc-400 dark:fill-zinc-500 font-mono"
                    content={(props) => {
                      const { x, y, value, index } = props;
                      const data =
                        typeof index === "number" ? queryData[index] : null;

                      if (!data || data.endpoint !== "getArticlesOptimized")
                        return null;

                      return (
                        <text
                          x={x}
                          y={y}
                          dx={12}
                          dy={4}
                          fontSize={10}
                          className="fill-zinc-500 dark:fill-zinc-400 font-mono"
                        >
                          {value} ({data.dbType})
                        </text>
                      );
                    }}
                  />
                </Scatter>
              );
            })}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        </div>
        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <strong>Interpretation:</strong> The lines represent the{" "}
          <strong>Optimization Vector</strong>. A longer line indicates a higher
          "Bloat Penalty" being removed by the AST compiler for that specific
          field.
        </p>
      </div>
    </Card>
  );
}
