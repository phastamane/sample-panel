import path from "path";
import { fileURLToPath } from "url";
import { note } from "@clack/prompts";
import { resetRouting } from "./lib/scaffold.js";

const __filename = fileURLToPath(import.meta.url);
const PROJECT_ROOT = path.resolve(path.dirname(__filename), "..");

async function run() {
  try {
    await resetRouting(PROJECT_ROOT);

    note(
      [
        "src/app/router.tsx",
        "src/shared/config/navigation.ts",
        "vite.config.ts",
        "",
        "Страницы и api-слои сгенерированных сущностей удалены.",
      ].join("\n"),
      "Роутинг сброшен к чистой заготовке",
    );
  } catch (err) {
    console.error("❌ Ошибка сброса роутинга:", err);
    process.exit(1);
  }
}

run();
