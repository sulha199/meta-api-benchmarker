import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RootLayout } from "./components/layout/RootLayout";
import { ApiTopologyPage } from "./pages/ApiTopologyPage";
import { GraphqlAstPage } from "./pages/GraphqlAstPage";

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
