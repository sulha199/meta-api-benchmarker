import { GraphQLResolveInfo } from 'graphql';
import { GraphQLContext } from '../../repositories';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Benchmark = {
  __typename?: 'Benchmark';
  backendDbInsertMs?: Maybe<Scalars['Int']['output']>;
  backendParseMs?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['String']['output'];
  environment: Environment;
  id: Scalars['ID']['output'];
  payloadSizeKb: Scalars['Int']['output'];
  totalRoundtripMs?: Maybe<Scalars['Int']['output']>;
  visitorId: Scalars['ID']['output'];
};

export enum Environment {
  NodeJs = 'Node.js',
  Supabase = 'Supabase'
}

export type Mutation = {
  __typename?: 'Mutation';
  submitBenchmark: Benchmark;
};


export type MutationSubmitBenchmarkArgs = {
  backendDbInsertMs?: InputMaybe<Scalars['Int']['input']>;
  backendParseMs?: InputMaybe<Scalars['Int']['input']>;
  dummyPayload?: InputMaybe<Scalars['String']['input']>;
  environment: Environment;
  payloadSizeKb: Scalars['Int']['input'];
  totalRoundtripMs?: InputMaybe<Scalars['Int']['input']>;
  visitorId: Scalars['ID']['input'];
};

export type Query = {
  __typename?: 'Query';
  getBenchmarks: Array<Benchmark>;
};


export type QueryGetBenchmarksArgs = {
  visitorId: Scalars['ID']['input'];
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Benchmark: ResolverTypeWrapper<Benchmark>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Environment: null;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Benchmark: Benchmark;
  Boolean: Scalars['Boolean']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Mutation: Record<PropertyKey, never>;
  Query: Record<PropertyKey, never>;
  String: Scalars['String']['output'];
}>;

export type BenchmarkResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Benchmark'] = ResolversParentTypes['Benchmark']> = ResolversObject<{
  backendDbInsertMs?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  backendParseMs?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  environment?: Resolver<ResolversTypes['Environment'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  payloadSizeKb?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalRoundtripMs?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  visitorId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
}>;

export type EnvironmentResolvers = { NODE_JS: 'Node.js', SUPABASE: 'Supabase' };

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  submitBenchmark?: Resolver<ResolversTypes['Benchmark'], ParentType, ContextType, RequireFields<MutationSubmitBenchmarkArgs, 'environment' | 'payloadSizeKb' | 'visitorId'>>;
}>;

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  getBenchmarks?: Resolver<Array<ResolversTypes['Benchmark']>, ParentType, ContextType, RequireFields<QueryGetBenchmarksArgs, 'visitorId'>>;
}>;

export type Resolvers<ContextType = GraphQLContext> = ResolversObject<{
  Benchmark?: BenchmarkResolvers<ContextType>;
  Environment?: EnvironmentResolvers;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
}>;

