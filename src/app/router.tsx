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
import { StreamsPage } from "@/pages/stream-page";
import { MatchPage } from "@/pages/match-page";
import { RoundPage } from "@/pages/round-page";
import { VenuePage } from "@/pages/venue-page";
import { TournamentPage } from "@/pages/tournament-page";
import { EventPage } from "@/pages/event-page";
import { ReportPage } from "@/pages/report-page";
import { BoxerPage } from "@/pages/boxer-page";
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
  beforeLoad: () => {
    throw redirect({ to: "/boxers" });
  },
});

const streamsRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/streams",
  component: StreamsPage,
});

const matchesRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/matches",
  component: MatchPage,
});
const roundsRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/rounds",
  component: RoundPage,
});

const venueRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/venues",
  component: VenuePage,
});
const tournamentsRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/tournaments",
  component: TournamentPage,
});
const eventsRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/events",
  component: EventPage,
});
const reportsRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/reports",
  component: ReportPage,
});
const boxersRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/boxers",
  component: BoxerPage,
});
// CLI_INJECT_ROUTE
const routeTree = rootRoute.addChildren([
  loginRoute,
  protectedLayoutRoute.addChildren([
    indexRoute,
    streamsRoute,
    matchesRoute,
    roundsRoute,
    venueRoute,
    tournamentsRoute,
    eventsRoute,
    reportsRoute,
    boxersRoute,
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
