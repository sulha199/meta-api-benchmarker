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

export type Mutation = {
  __typename?: 'Mutation';
  deleteVisitor: Scalars['Boolean']['output'];
  registerVisitor: Visitor;
  updateVisitor?: Maybe<Visitor>;
};


export type MutationDeleteVisitorArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRegisterVisitorArgs = {
  id: Scalars['ID']['input'];
  rawEmail?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateVisitorArgs = {
  id: Scalars['ID']['input'];
  rawEmail?: InputMaybe<Scalars['String']['input']>;
};

export type Query = {
  __typename?: 'Query';
  getVisitor?: Maybe<Visitor>;
  ping: Scalars['String']['output'];
};


export type QueryGetVisitorArgs = {
  id: Scalars['ID']['input'];
};

export type VisitLog = {
  __typename?: 'VisitLog';
  id: Scalars['ID']['output'];
  locale: Scalars['String']['output'];
  userAgent?: Maybe<Scalars['String']['output']>;
  visitedAt: Scalars['String']['output'];
  visitorId: Scalars['ID']['output'];
};

export type Visitor = {
  __typename?: 'Visitor';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  logs: Array<VisitLog>;
  rawEmail?: Maybe<Scalars['String']['output']>;
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
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  VisitLog: ResolverTypeWrapper<VisitLog>;
  Visitor: ResolverTypeWrapper<Visitor>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars['Boolean']['output'];
  ID: Scalars['ID']['output'];
  Mutation: Record<PropertyKey, never>;
  Query: Record<PropertyKey, never>;
  String: Scalars['String']['output'];
  VisitLog: VisitLog;
  Visitor: Visitor;
}>;

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  deleteVisitor?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteVisitorArgs, 'id'>>;
  registerVisitor?: Resolver<ResolversTypes['Visitor'], ParentType, ContextType, RequireFields<MutationRegisterVisitorArgs, 'id'>>;
  updateVisitor?: Resolver<Maybe<ResolversTypes['Visitor']>, ParentType, ContextType, RequireFields<MutationUpdateVisitorArgs, 'id'>>;
}>;

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  getVisitor?: Resolver<Maybe<ResolversTypes['Visitor']>, ParentType, ContextType, RequireFields<QueryGetVisitorArgs, 'id'>>;
  ping?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type VisitLogResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['VisitLog'] = ResolversParentTypes['VisitLog']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  locale?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userAgent?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  visitedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  visitorId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
}>;

export type VisitorResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Visitor'] = ResolversParentTypes['Visitor']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  logs?: Resolver<Array<ResolversTypes['VisitLog']>, ParentType, ContextType>;
  rawEmail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type Resolvers<ContextType = GraphQLContext> = ResolversObject<{
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  VisitLog?: VisitLogResolvers<ContextType>;
  Visitor?: VisitorResolvers<ContextType>;
}>;

