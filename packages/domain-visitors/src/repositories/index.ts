import { IVisitorRepository } from './IVisitorRepository';

export * from './IVisitorRepository';

export interface GraphQLContext {
  repositories: IVisitorRepository;
}
