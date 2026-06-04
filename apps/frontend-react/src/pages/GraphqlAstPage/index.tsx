import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui";
import { LazyTrapTab } from "./tabs/LazyTrapTab";
import { IndexedSearchTab } from "./tabs/IndexedSearchTab";
import { DeepIndexTab } from "./tabs/DeepIndexTab";

export function GraphqlAstPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          GraphQL AST Optimization
        </h2>
        <p className="text-zinc-500 mt-2">
          PostgreSQL TOAST vs. MongoDB Embedded Documents
        </p>
      </div>

      <Tabs defaultValue="lazy" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="lazy">1. The Lazy Trap</TabsTrigger>
          <TabsTrigger value="indexed">2. Indexed Search</TabsTrigger>
          <TabsTrigger value="premium" className="gap-2">
            3. Deep Index Projection 🔒
          </TabsTrigger>
        </TabsList>

        <TabsContent forceMount value="lazy">
          <LazyTrapTab />
        </TabsContent>

        <TabsContent forceMount value="indexed">
          <IndexedSearchTab />
        </TabsContent>

        <TabsContent forceMount value="premium">
          <DeepIndexTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default GraphqlAstPage;
