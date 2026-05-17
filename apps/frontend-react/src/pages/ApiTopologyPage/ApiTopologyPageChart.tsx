import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import { Card } from "@repo/ui";
import type { BenchmarkResult } from "../../workers/benchmark.worker";

const COMPETITOR_COLORS = {
  NodeJS: "#2563eb", // Tailwind Blue 600
  Supabase: "#059669", // Tailwind Emerald 600
} as const;

interface ApiTopologyPageChartProps {
  latestChartData: {
    payload: number;
    NodeJS: number | undefined;
    Supabase: number | undefined;
  }[];
  historicalData: BenchmarkResult[];
}

export function ApiTopologyPageChart({
  latestChartData,
  historicalData,
}: ApiTopologyPageChartProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Latest Run: Line Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">
          Latest Sweep: Latency Scaling
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={latestChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="payload"
                label={{
                  value: "Payload (KB)",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis
                label={{
                  value: "Duration (ms)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Legend verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey="NodeJS"
                name="Node.js"
                stroke={COMPETITOR_COLORS.NodeJS}
                strokeWidth={2}
                dot={{ r: 4, fill: COMPETITOR_COLORS.NodeJS }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Supabase"
                stroke={COMPETITOR_COLORS.Supabase}
                strokeWidth={2}
                dot={{ r: 4, fill: COMPETITOR_COLORS.Supabase }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Historical Data: Scatter Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">
          Local History: All Data Points
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                type="number"
                dataKey="payloadSizeKb"
                name="Payload"
                unit="KB"
                label={{
                  value: "Payload (KB)",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis
                type="number"
                dataKey="duration"
                name="Duration"
                unit="ms"
                label={{
                  value: "Duration (ms)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <ZAxis type="number" range={[64]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Legend verticalAlign="top" height={36} />
              <Scatter
                name="Node.js"
                data={historicalData.filter((d) => d.competitor === "Node.js")}
                fill={COMPETITOR_COLORS.NodeJS}
                opacity={0.6}
              />
              <Scatter
                name="Supabase"
                data={historicalData.filter((d) => d.competitor === "Supabase")}
                fill={COMPETITOR_COLORS.Supabase}
                opacity={0.6}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
