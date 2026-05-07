export type VisitLogEntity = {
  id: string;
  visitorId: string;
  locale: string;
  userAgent: string;
  visitedAt: Date;
};

export type VisitorEntity = {
  id: string;
  rawEmail: string;
  logs: VisitLogEntity[];
  createdAt: Date;
};

export interface IVisitorRepository {
  findById(id: string): Promise<VisitorEntity | null>;
  create(entity: VisitorEntity): Promise<VisitorEntity | null>;
  update(id: string, entity: Partial<VisitorEntity>): Promise<VisitorEntity | null>;
  delete(id: string): Promise<boolean>;
}
