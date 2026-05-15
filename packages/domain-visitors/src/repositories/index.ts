import { IVisitorRepository } from "./IVisitorRepository";
import type { GenericGraphQLContext } from "@repo/shared-backend";

export * from "./IVisitorRepository";

export interface GraphQLContext extends GenericGraphQLContext<{
  visitors: {
    postgres: IVisitorRepository;
  };
}> {}
