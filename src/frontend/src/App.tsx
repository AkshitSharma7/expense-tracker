import { Layout } from "@/components/Layout";
import { useActor } from "@/hooks/useBackendActor";
import { useExpenses } from "@/hooks/useExpenses";
import { callSeedSampleData } from "@/lib/backend";
import AddExpense from "@/pages/AddExpense";
import Budget from "@/pages/Budget";
import Dashboard from "@/pages/Dashboard";
import History from "@/pages/History";
import Reports from "@/pages/Reports";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "sonner";

function SeedInitializer() {
  const { actor, isFetching } = useActor();
  const { data: expenses } = useExpenses();

  useEffect(() => {
    if (!actor || isFetching) return;
    if (expenses && expenses.length === 0) {
      callSeedSampleData(actor).catch(console.error);
    }
  }, [actor, isFetching, expenses]);

  return null;
}

function RootComponent() {
  return (
    <>
      <SeedInitializer />
      <Outlet />
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}

const rootRoute = createRootRoute({ component: RootComponent });

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: Dashboard,
});

const addRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/add",
  component: AddExpense,
});

const historyRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/history",
  component: History,
});

const budgetRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/budget",
  component: Budget,
});

const reportsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/reports",
  component: Reports,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    indexRoute,
    addRoute,
    historyRoute,
    budgetRoute,
    reportsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
