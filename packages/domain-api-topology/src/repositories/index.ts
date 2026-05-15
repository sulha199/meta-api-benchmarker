import type { IApiTopologiRepository } from "./IApiTolologyRepository";
import type { GenericGraphQLContext } from "@repo/shared-backend";

export interface GraphQLContext extends GenericGraphQLContext<{
  apiTopology: {
    postgres: IApiTopologiRepository;
  };
}> {}
