export interface NavigationItem {
  path: string;
  label: string;
  icon?: string;
}

export const ENTITY_NAVIGATION: NavigationItem[] = [
  { path: "/streams", label: "Стримы" },
  { path: "/matches", label: "Матчи" },
  { path: "/rounds", label: "Раунды" },
  { path: "/venues", label: "Площадки" },
  { path: "/tournaments", label: "Турниры" },
  { path: "/events", label: "События" },
  { path: "/reports", label: "Протоколы" },
  { path: "/boxers", label: "Участники" },
  // CLI_INJECT_NAVIGATION
];
