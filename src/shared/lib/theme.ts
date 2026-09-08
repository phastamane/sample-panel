const THEME_KEY = "theme";

export type Theme = "light" | "dark";

export function getTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function initTheme() {
  applyTheme(getTheme());
}

export function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  localStorage.setItem(
    THEME_KEY,
    document.documentElement.classList.contains("dark") ? "dark" : "light",
  );
}
