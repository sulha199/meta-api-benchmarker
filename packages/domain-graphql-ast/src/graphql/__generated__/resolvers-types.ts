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

export type Article = {
  __typename?: 'Article';
  comments: Array<Comment>;
  contentBody: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

export type AstResult = {
  __typename?: 'AstResult';
  avgLatencyMs: Scalars['Int']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  databaseType: DatabaseType;
  endpoint: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  payloadSizeKb: Scalars['Float']['output'];
  queriedFields: Array<Scalars['String']['output']>;
  queriedRelations: Array<Scalars['String']['output']>;
  requestCount: Scalars['Int']['output'];
  scenario: Scalars['String']['output'];
  visitorId?: Maybe<Scalars['ID']['output']>;
};

export type BenchmarkResult = {
  __typename?: 'BenchmarkResult';
  data: Array<Article>;
  latencyMs: Scalars['Int']['output'];
  payloadSizeKb: Scalars['Float']['output'];
};

export type Comment = {
  __typename?: 'Comment';
  authorId: Scalars['String']['output'];
  commentText: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
};

export enum DatabaseType {
  Mongo = 'MONGO',
  Postgres = 'POSTGRES'
}

export type Mutation = {
  __typename?: 'Mutation';
  submitAstResult: AstResult;
};


export type MutationSubmitAstResultArgs = {
  input: SubmitAstResultInput;
};

export type Query = {
  __typename?: 'Query';
  getArticlesLazy: BenchmarkResult;
  getArticlesOptimized: BenchmarkResult;
};


export type QueryGetArticlesLazyArgs = {
  dbType: DatabaseType;
};


export type QueryGetArticlesOptimizedArgs = {
  dbType: DatabaseType;
};

export type SubmitAstResultInput = {
  avgLatencyMs: Scalars['Int']['input'];
  databaseType: DatabaseType;
  endpoint: Scalars['String']['input'];
  payloadSizeKb: Scalars['Float']['input'];
  queriedFields: Array<Scalars['String']['input']>;
  queriedRelations: Array<Scalars['String']['input']>;
  requestCount: Scalars['Int']['input'];
  scenario: Scalars['String']['input'];
  visitorId?: InputMaybe<Scalars['ID']['input']>;
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
  Article: ResolverTypeWrapper<Article>;
  AstResult: ResolverTypeWrapper<AstResult>;
  BenchmarkResult: ResolverTypeWrapper<BenchmarkResult>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Comment: ResolverTypeWrapper<Comment>;
  DatabaseType: DatabaseType;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  SubmitAstResultInput: SubmitAstResultInput;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Article: Article;
  AstResult: AstResult;
  BenchmarkResult: BenchmarkResult;
  Boolean: Scalars['Boolean']['output'];
  Comment: Comment;
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Mutation: Record<PropertyKey, never>;
  Query: Record<PropertyKey, never>;
  String: Scalars['String']['output'];
  SubmitAstResultInput: SubmitAstResultInput;
}>;

export type ArticleResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Article'] = ResolversParentTypes['Article']> = ResolversObject<{
  comments?: Resolver<Array<ResolversTypes['Comment']>, ParentType, ContextType>;
  contentBody?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type AstResultResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AstResult'] = ResolversParentTypes['AstResult']> = ResolversObject<{
  avgLatencyMs?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  databaseType?: Resolver<ResolversTypes['DatabaseType'], ParentType, ContextType>;
  endpoint?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  payloadSizeKb?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  queriedFields?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  queriedRelations?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  requestCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  scenario?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  visitorId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
}>;

export type BenchmarkResultResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['BenchmarkResult'] = ResolversParentTypes['BenchmarkResult']> = ResolversObject<{
  data?: Resolver<Array<ResolversTypes['Article']>, ParentType, ContextType>;
  latencyMs?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  payloadSizeKb?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
}>;

export type CommentResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Comment'] = ResolversParentTypes['Comment']> = ResolversObject<{
  authorId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  commentText?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  submitAstResult?: Resolver<ResolversTypes['AstResult'], ParentType, ContextType, RequireFields<MutationSubmitAstResultArgs, 'input'>>;
}>;

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  getArticlesLazy?: Resolver<ResolversTypes['BenchmarkResult'], ParentType, ContextType, RequireFields<QueryGetArticlesLazyArgs, 'dbType'>>;
  getArticlesOptimized?: Resolver<ResolversTypes['BenchmarkResult'], ParentType, ContextType, RequireFields<QueryGetArticlesOptimizedArgs, 'dbType'>>;
}>;

export type Resolvers<ContextType = GraphQLContext> = ResolversObject<{
  Article?: ArticleResolvers<ContextType>;
  AstResult?: AstResultResolvers<ContextType>;
  BenchmarkResult?: BenchmarkResultResolvers<ContextType>;
  Comment?: CommentResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
}>;

