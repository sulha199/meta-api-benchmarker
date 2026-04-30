import { Tabs, TabsContent, TabsList, TabsTrigger, Card } from "@repo/ui";

export function GraphqlAstPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">GraphQL AST Optimization</h2>
        <p className="text-zinc-500 mt-2">PostgreSQL TOAST vs. MongoDB Embedded Documents</p>
      </div>

      <Tabs defaultValue="lazy" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="lazy">1. The Lazy Trap</TabsTrigger>
          <TabsTrigger value="indexed">2. Indexed Search</TabsTrigger>
          <TabsTrigger value="premium" className="gap-2">
            3. Deep Index Projection 🔒
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lazy">
          <Card className="p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Lazy Query vs AST Parsed</h3>
            <p className="text-zinc-500">Test UI dropping here shortly...</p>
          </Card>
        </TabsContent>

        <TabsContent value="indexed">
          <Card className="p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Full Table Scan vs Indexed</h3>
            <p className="text-zinc-500">Test UI dropping here shortly...</p>
          </Card>
        </TabsContent>

        <TabsContent value="premium">
          <Card className="p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Advanced Architecture Test</h3>
            <p className="text-zinc-500">Requires GitHub Auth to unlock.</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default GraphqlAstPage;
