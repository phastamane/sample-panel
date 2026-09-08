import {
  createRouter,
  createRoute,
  createRootRoute,
  redirect,
  Outlet,
} from "@tanstack/react-router";
import { getToken } from "@/shared/lib/token";
import LoginForm from "@/widgets/login-form/login-form";
import { NotFound } from "@/shared/ui/not-found";
import { GlobalError } from "@/shared/ui/global-error";
import { MainLayout } from "@/widgets/layouts/main-layout";
// CLI_INJECT_IMPORT

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Outlet />
    </div>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  beforeLoad: () => {
    if (getToken()) {
      throw redirect({ to: "/" });
    }
  },
  component: () => (
    <div className="flex h-screen w-full items-center justify-center">
      <LoginForm />
    </div>
  ),
});

const protectedLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "protected",
  beforeLoad: () => {
    if (!getToken()) {
      throw redirect({ to: "/login" });
    }
  },
  component: () => <MainLayout />,
});
const indexRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/",
});
// CLI_INJECT_ROUTE
const routeTree = rootRoute.addChildren([
  loginRoute,
  protectedLayoutRoute.addChildren([
    indexRoute,
    // CLI_INJECT_TREE
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultNotFoundComponent: NotFound,
  defaultErrorComponent: ({ error }) => <GlobalError error={error} />,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
