import { defineConfig } from "orval";
import { loadEnv } from "vite";

const env = loadEnv("development", process.cwd(), "");
const apiTarget = env.VITE_API_PROXY_TARGET;

if (!apiTarget) {
  throw new Error("VITE_API_PROXY_TARGET must be set in .env");
}

const openApiUrl = `${apiTarget.replace(/\/$/, "")}/documentation-json`;

export default defineConfig({
  petstore: {
    output: {
      mode: "single",
      target: "./src/shared/model/petstore.ts",
      schemas: { path: "./src/shared/model/schemas", type: "zod" },
      client: "react-query",
      mock: true,
      formatter: "prettier",
      override: {
        mutator: {
          path: "./src/shared/api/fetcher.ts",
          name: "customFetch",
        },

        query: {
          useQuery: true,
          useMutation: false,
          useSuspenseQuery: true,
          useSuspenseInfiniteQuery: true,
          useInfinite: true,
          useInfiniteQueryParam: "skip",
          useInvalidate: true,
        },
      },
    },
    input: {
      target: openApiUrl,
    },
  },
});
