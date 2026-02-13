import { createBrowserRouter } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { Calculator } from "./pages/calculator";
import { Budgets } from "./pages/budgets";
import { Production } from "./pages/production";
import { Approvals } from "./pages/approvals";
import { Analytics } from "./pages/analytics";
import { Settings } from "./pages/settings";
import { Layout } from "./components/layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "calculator", Component: Calculator },
      { path: "products", Component: Budgets },
      { path: "production", Component: Production },
      { path: "approvals", Component: Approvals },
      { path: "analytics", Component: Analytics },
      { path: "settings", Component: Settings },
    ],
  },
]);
