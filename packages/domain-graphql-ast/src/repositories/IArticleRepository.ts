export interface IArticleRepository {
  getArticlesLazy(): Promise<any[]>;
  getArticlesOptimized(wantsComments: boolean): Promise<any[]>;
}
