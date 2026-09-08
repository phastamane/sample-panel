import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";

// Импорты из нашего нового слоя app/
import { queryClient } from "@/app/query-client";
import { router } from "@/app/router";

// Стили
import "./index.css";
import { initTheme } from "@/shared/lib/theme";

initTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Провайдер состояния и кэша */}
    <QueryClientProvider client={queryClient}>
      {/* Провайдер маршрутизации */}
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
