import path from "path";
import { fileURLToPath } from "url";
import { text, isCancel, note } from "@clack/prompts";
import fs from "fs-extra";
import { removeProxyPrefix } from "./lib/scaffold.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

async function run() {
  const entityName = await text({
    message: "Какую сущность удалить?",
    placeholder: "Введите название (в camelCase, например: match)",
    validate: (value) => {
      if (!value || value.trim() === "") return "Название не может быть пустым";
    },
  });
  if (isCancel(entityName)) process.exit(0);

  const entityPascalCase =
    entityName.charAt(0).toUpperCase() + entityName.slice(1);

  // Пути к файлам
  const apiDirPath = path.join(PROJECT_ROOT, `src/entities/${entityName}`);
  const pagePath = path.join(PROJECT_ROOT, `src/pages/${entityName}-page.tsx`);
  const navPath = path.join(PROJECT_ROOT, "src/shared/config/navigation.ts");
  const routerPath = path.join(PROJECT_ROOT, "src/app/router.tsx");

  try {
    // 1. Удаляем физические файлы
    await fs.remove(apiDirPath);
    await fs.remove(pagePath);

    // 2. Очищаем Sidebar (navigation.ts)
    if (await fs.pathExists(navPath)) {
      const navContent = await fs.readFile(navPath, "utf-8");
      // Ищем строку вида: { path: "/matchs", label: "Матчи" },
      const navRegex = new RegExp(
        `\\s*\\{ path: "/${entityName}s", label: "[^"]+" \\},`,
        "g",
      );
      await fs.writeFile(navPath, navContent.replace(navRegex, ""));
    }

    // 3. Очищаем Router (router.tsx)
    if (await fs.pathExists(routerPath)) {
      const routerContent = await fs.readFile(routerPath, "utf-8");

      const importRegex = new RegExp(
        `import \\{ ${entityPascalCase}Page \\} from "@/pages/${entityName}-page";\\n`,
        "g",
      );
      const routeRegex = new RegExp(
        `const ${entityName}sRoute = createRoute\\(\\{[\\s\\S]*?\\}\\);\\n`,
        "g",
      );
      const treeRegex = new RegExp(`\\s*${entityName}sRoute,`, "g");

      await fs.writeFile(
        routerPath,
        routerContent
          .replace(importRegex, "")
          .replace(routeRegex, "")
          .replace(treeRegex, ""),
      );
    }

    // 4. Очищаем Proxy (vite.config.ts)
    await removeProxyPrefix(PROJECT_ROOT, entityName);

    note(
      `Файлы и роуты для ${entityPascalCase} успешно удалены.`,
      "Очистка завершена",
    );
  } catch (err) {
    console.error("❌ Ошибка при удалении:", err);
  }
}

run();
