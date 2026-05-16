import { type DateIso } from "@repo/shared-common";
import { AbstractRepository } from "@repo/db-core";

export type Environment = "Node.js" | "Supabase";

export type BenchmarkCreatePayload = {
  visitorId: string;
  payloadSizeKb: number;
  environment: Environment;
  totalRoundtripMs: number | null;
  backendParseMs: number | null;
  backendDbInsertMs: number | null;
};

export type BenchmarkEntity = BenchmarkCreatePayload & {
  id: string;
  createdAt: DateIso;
};

export type BenchmarkUpdatePayload = Partial<BenchmarkCreatePayload>;

export interface IApiTopologiRepository {
  getBenchmarks(visitorId: string): Promise<BenchmarkEntity[]>;

  submitBenchmark(
    createPayload: Omit<BenchmarkEntity, "id" | "createdAt">,
  ): Promise<BenchmarkEntity | null>;
}

export class ApiTopologiRepositoryImpl implements IApiTopologiRepository {
  constructor(
    protected readonly benchmarkRepo: AbstractRepository<
      BenchmarkEntity,
      any,
      any,
      any,
      any,
      any,
      BenchmarkCreatePayload,
      BenchmarkUpdatePayload
    >,
  ) {}
  /** should order by `createdAt` descending */
  async getBenchmarks(visitorId: string): Promise<BenchmarkEntity[]> {
    return this.benchmarkRepo.findMany({
      where: { visitorId },
      orderBy: { field: "createdAt", direction: "desc" },
    });
  }
  submitBenchmark(
    createPayload: BenchmarkCreatePayload,
  ): Promise<BenchmarkEntity | null> {
    return this.benchmarkRepo.create({
      ...createPayload,
    });
  }
}
