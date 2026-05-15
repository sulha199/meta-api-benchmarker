import { type DateIso } from "@repo/shared-common";

export type VisitLogEntity = {
  id: string;
  visitorId: string;
  locale: string;
  userAgent: string;
  visitedAt: DateIso;
};

type VisitorBasePayload = {
  rawEmail: string | null;
};

export type VisitorUpdatePayload = Partial<VisitorBasePayload>;

export type VisitorCreatePayload = VisitorBasePayload & {
  id: string;
};

export type VisitorEntity = VisitorCreatePayload & {
  logs: VisitLogEntity[];
  createdAt: DateIso;
};

export interface IVisitorRepository {
  findById(id: string): Promise<VisitorEntity | null>;
  registerVisitor(entity: VisitorCreatePayload): Promise<VisitorEntity | null>;
  update(
    id: string,
    entity: Partial<VisitorEntity>,
  ): Promise<VisitorEntity | null>;
  delete(id: string): Promise<boolean>;
}
