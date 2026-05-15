import type { GraphQLContext as ArticleContext } from "@repo/domain-graphql-ast";
import type { GraphQLContext as VisitorContext } from "@repo/domain-visitors";
import type { GraphQLContext as TopologyContext } from "@repo/domain-api-topology";

/**
 * Master Context that merges all domain-specific context requirements.
 * Using a type intersection instead of an interface to allow merging of
 * the 'repositories' property from multiple sources.
 */
export type MasterGraphQLContext = ArticleContext &
  VisitorContext &
  TopologyContext;
