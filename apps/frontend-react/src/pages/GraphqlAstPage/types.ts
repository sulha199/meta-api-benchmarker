export type PropertyTarget = {
  label: string;
  query: string;
  fields: string[];
  relations: string[];
};

export type SweepResult = PropertyTarget & {
  endpoint: "getArticlesOptimized" | "getArticlesLazy";
  backendLatency: number;
  totalLatency: number;
  payloadSize: number;
};

export type GraphqlBenchmarkResponse = {
  latencyMs: number;
  payloadSizeKb: number;
  data: any[];
};
