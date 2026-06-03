import {
  AstResultCreatePayload,
  AstResultEntity,
  IAstResultRepository,
} from "@repo/domain-graphql-ast";
import { astResults } from "../schema/ast";
import { PgColumn, PgDatabase, PgTable } from "drizzle-orm/pg-core";
import { AbstractDrizzlePgRepository } from "./AbstractDrizzleRepository";
import { QueryCriteria } from "@repo/db-core";

export class DrizzleAstResultRepository
  extends AbstractDrizzlePgRepository<
    AstResultEntity,
    typeof astResults.$inferSelect,
    typeof astResults.$inferInsert,
    typeof astResults.$inferInsert,
    PgDatabase<any, any, any>,
    PgTable<any> & { id: PgColumn<any> },
    "id",
    AstResultCreatePayload,
    Partial<AstResultCreatePayload>
  >
  implements IAstResultRepository
{
  constructor(private db: PgDatabase<any, any, any>) {
    super(db, astResults);
  }

  protected columnIdName: "id" = "id";

  protected toDomain(
    dbRecord: typeof astResults.$inferSelect,
  ): AstResultEntity {
    return {
      id: dbRecord.id,
      visitorId: dbRecord.visitorId,
      scenario: dbRecord.scenario,
      endpoint: dbRecord.endpoint,
      databaseType: dbRecord.databaseType as "POSTGRES" | "MONGO",
      queriedFields: dbRecord.queriedFields,
      queriedRelations: dbRecord.queriedRelations,
      requestCount: dbRecord.requestCount,
      avgLatencyMs: dbRecord.avgLatencyMs,
      payloadSizeKb: Number(dbRecord.payloadSizeKb),
      createdAt: dbRecord.createdAt ? dbRecord.createdAt.toISOString() : null,
    };
  }

  protected toPersistence(
    entityData: Partial<AstResultEntity>,
  ): typeof astResults.$inferInsert {
    return {
      visitorId:
        entityData.visitorId === "anonymous" || !entityData.visitorId
          ? null
          : entityData.visitorId,
      scenario: entityData.scenario!,
      endpoint: entityData.endpoint!,
      databaseType: entityData.databaseType!,
      queriedFields: entityData.queriedFields,
      queriedRelations: entityData.queriedRelations,
      requestCount: entityData.requestCount!,
      avgLatencyMs: entityData.avgLatencyMs!,
      payloadSizeKb: Math.round(entityData.payloadSizeKb!),
      createdAt: entityData.createdAt
        ? new Date(entityData.createdAt)
        : undefined,
    };
  }

  protected toAdapterQuery(
    query: QueryCriteria<AstResultEntity>,
  ): QueryCriteria<typeof astResults.$inferSelect> {
    return query as any;
  }

  async create(data: AstResultCreatePayload): Promise<AstResultEntity> {
    const [record] = await this.db
      .insert(astResults)
      .values(this.toPersistence(data))
      .returning();
    return this.toDomain(record);
  }
}
