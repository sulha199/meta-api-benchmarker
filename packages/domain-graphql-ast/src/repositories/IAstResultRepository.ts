import { DateIso } from "@repo/shared-common";

export type AstResultCreatePayload = {
  visitorId?: string | null;
  scenario: string;
  endpoint: string;
  databaseType: "POSTGRES" | "MONGO";
  queriedFields: string[];
  queriedRelations: string[];
  requestCount: number;
  avgLatencyMs: number;
  payloadSizeKb: number;
};

export type AstResultEntity = AstResultCreatePayload & {
  id: string;
  createdAt: DateIso | null;
};

export interface IAstResultRepository {
  create(data: AstResultCreatePayload): Promise<AstResultEntity>;
}
