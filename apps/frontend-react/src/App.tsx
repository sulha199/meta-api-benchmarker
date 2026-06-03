import { HashRouter, Routes, Route } from "react-router-dom";
import { RootLayout } from "./components/layout/RootLayout";
import { lazy, Suspense } from "react";
import { SessionProvider } from "./contexts/SessionContext";

const ApiTopologyPage = lazy(() => import("./pages/ApiTopologyPage"));
const GraphqlAstPage = lazy(() => import("./pages/GraphqlAstPage"));

function App() {
  return (
    <SessionProvider>
      <HashRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<RootLayout />}>
              {/* Index route (default page) */}
              <Route index element={<ApiTopologyPage />} />
              {/* Sub-project route */}
              <Route path="graphql-ast" element={<GraphqlAstPage />} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </SessionProvider>
  );
}

export default App;
