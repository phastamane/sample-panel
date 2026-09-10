import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_API_PROXY_TARGET;

  const apiPrefixes = [
    "tournament",
    "terminal",
    "overlay",
    "health",
    "stream",
    "venue",
    "manager",
    "tournament",
    "event",
    "report",
    /* CLI_PROXY_START */
    "match",
    "boxer",
    "manager",
    "stream",
    "tournament",
    "report",
    /* CLI_PROXY_END */
  ];

  if (mode === "development" && !apiTarget) {
    throw new Error("VITE_API_PROXY_TARGET must be set in .env");
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: true,
      port: 5183,
      proxy: apiTarget
        ? {
            [`^/(${apiPrefixes.join("|")})(/|$)`]: {
              target: apiTarget,
              changeOrigin: true,
            },
          }
        : undefined,
    },
  };
});
