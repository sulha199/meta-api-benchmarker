import {
  BenchmarkCreatePayload,
  BenchmarkEntity,
  BenchmarkUpdatePayload,
  Environment,
} from "@repo/domain-api-topology";
import { QueryCriteria } from "@repo/db-core";
import { benchmarks } from "../schema/topology";
import { PgColumn, PgDatabase, PgTable } from "drizzle-orm/pg-core";
import { AbstractDrizzlePgRepository } from "./AbstractDrizzleRepository";

export class DrizzleBenchmarkRepository extends AbstractDrizzlePgRepository<
  BenchmarkEntity,
  typeof benchmarks.$inferSelect,
  typeof benchmarks.$inferInsert,
  typeof benchmarks.$inferInsert,
  PgDatabase<any, any, any>,
  PgTable<any> & { id: PgColumn<any> },
  "id",
  BenchmarkCreatePayload,
  BenchmarkUpdatePayload
> {
  constructor(
    private db: PgDatabase<any, any, any>, // The raw Drizzle postgres client
  ) {
    super(db, benchmarks);
  }

  protected columnIdName: "id" = "id";

  protected toDomain(
    dbRecord: typeof benchmarks.$inferSelect,
  ): BenchmarkEntity {
    return {
      id: dbRecord.id,
      visitorId: dbRecord.visitorId,
      payloadSizeKb: dbRecord.payloadSizeKb,
      environment: dbRecord.environment === "Node.js" ? "NODE_JS" : "SUPABASE",
      totalRoundtripMs: dbRecord.totalRoundtripMs,
      backendParseMs: dbRecord.backendParseMs,
      backendDbInsertMs: dbRecord.backendDbInsertMs,
      createdAt: dbRecord.createdAt.toISOString(),
    };
  }

  protected toPersistence<T extends Partial<BenchmarkEntity>>(
    entityData: T,
  ): {
    visitorId: string;
    environment: "Node.js" | "Supabase";
    payloadSizeKb: number;
    id?: string | undefined;
    totalRoundtripMs?: number | null | undefined;
    backendParseMs?: number | null | undefined;
    backendDbInsertMs?: number | null | undefined;
    createdAt?: Date | undefined;
  } {
    return {
      ...entityData,
      payloadSizeKb: entityData.payloadSizeKb!,
      environment:
        entityData.environment === "NODE_JS" ? "Node.js" : "Supabase",
      visitorId: entityData.visitorId!,
      createdAt: entityData.createdAt
        ? new Date(entityData.createdAt)
        : undefined,
    };
  }

  protected toAdapterQuery(
    query: QueryCriteria<BenchmarkEntity>,
  ): QueryCriteria<typeof benchmarks.$inferSelect> {
    const { where, orderBy, ...rest } = query;

    const adapterWhere: any = { ...where };
    if (where?.createdAt) {
      adapterWhere.createdAt = new Date(where.createdAt);
    }

    const drizzleQuery: QueryCriteria<typeof benchmarks.$inferSelect> = {
      ...rest,
      where: Object.keys(adapterWhere).length > 0 ? adapterWhere : undefined,
      orderBy,
    };

    return drizzleQuery;
  }
}
