import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RootLayout } from "./components/layout/RootLayout";
import { lazy } from "react";


const ApiTopologyPage = lazy(() => import("./pages/ApiTopologyPage"));
const GraphqlAstPage = lazy(() => import("./pages/GraphqlAstPage")) ;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          {/* Index route (default page) */}
          <Route index element={<ApiTopologyPage />} />
          {/* Sub-project route */}
          <Route path="graphql-ast" element={<GraphqlAstPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
