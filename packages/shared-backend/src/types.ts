export type DbType = "postgres" | "mongo";
/**
 * A generic contract for GraphQL contexts to enforce consistent dependency injection.
 * TRepositories maps a domain name (e.g., 'visitors') to its database adapters (e.g., 'postgres', 'mongo').
 */
export type GenericGraphQLContext<TRepositories = Record<string, any>> = {
  repositories: {
    [K in keyof TRepositories]: Partial<{
      [dbType in DbType]: TRepositories[K] extends Partial<
        Record<string, infer R>
      >
        ? R
        : any;
    }> &
      TRepositories[K];
  };
};
