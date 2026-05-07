// import type {
//   VisitorEntity,
//   VisitLogEntity,
//   IVisitorRepository
// } from '@repo/domain-visitors';

// // We import our specific database schemas
// import { visitors } from '../schema/shared';
// import { AbstractDrizzlePgRepository } from './AbstractDrizzleRepository';
// import { PgDatabase, PgTable, PgColumn } from 'drizzle-orm/pg-core';
// import { DataQueryPlan } from '@repo/db-core';

// // Drizzle type inference
// type DbVisitorSelect = typeof visitors.$inferSelect;
// type DbVisitorInsert = typeof visitors.$inferInsert;
// type DbVisitorUpdate = Partial<typeof visitors.$inferInsert>;

// export class DrizzleVisitorRepository
//   extends AbstractDrizzlePgRepository<
//     VisitorEntity,
//     DbVisitorSelect,
//     DbVisitorInsert,
//     DbVisitorUpdate,
//     PgDatabase<any, any, any>,
//     PgTable<any> & { id: PgColumn<any> },
//     'id'
//   >implements IVisitorRepository
// {
//   protected columnIdName: 'id' = 'id';

//   constructor(
//     private db: PgDatabase<any, any, any>, // The raw Drizzle postgres client
//   ) {
//     super(db, visitors);
//   }

//   // ==========================================
//   // 1. DOMAIN MAPPERS (The Data Mapper Pattern)
//   // ==========================================

//   protected toDomain(dbRecord: DbVisitorSelect & { logs: VisitLogEntity[] }): VisitorEntity {
//     return {
//       id: dbRecord.id,
//       rawEmail: dbRecord.rawEmail!,
//       createdAt: dbRecord.createdAt,
//       // Map nested relations safely
//       logs: dbRecord.logs ? dbRecord.logs.map(c => ({
//         id: c.id,
//         locale: c.locale,
//         visitorId: c.visitorId,
//         userAgent: c.userAgent,
//         visitedAt: c.visitedAt
//       })) : []
//     };
//   }

//   protected toPersistence(entityData: Partial<VisitorEntity>): DbVisitorInsert {
//     return {
//       rawEmail: entityData.rawEmail!,
//     };
//   }
// }
