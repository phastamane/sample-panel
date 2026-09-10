export interface NavigationItem {
  path: string;
  label: string;
  icon?: string;
}

export const ENTITY_NAVIGATION: NavigationItem[] = [
  { path: "/matchs", label: "matches" },
  { path: "/boxers", label: "boxers" },
  { path: "/managers", label: "managers" },
  { path: "/streams", label: "streams" },
  { path: "/tournaments", label: "tournaments" },
  { path: "/reports", label: "reports" },
  // CLI_INJECT_NAVIGATION
];
