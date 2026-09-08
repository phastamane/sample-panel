import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { router } from "./router";

const handleUnauthorized = () => {
  localStorage.removeItem("token");
  queryClient.clear();
  router.navigate({ to: "/login" });
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (err: any) => {
      if (err.status === 401 || err?.response?.status === 401) {
        handleUnauthorized();
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      if (error?.status === 401 || error?.response?.status === 401) {
        handleUnauthorized();
      }
    },
  }),
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});
