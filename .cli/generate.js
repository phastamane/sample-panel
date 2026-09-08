import fs from "fs-extra";
import path from "path";
import { text, select, confirm, isCancel, note } from "@clack/prompts";
import ejs from "ejs";
import { fileURLToPath } from "url";
import { outro } from "@clack/prompts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

async function run() {
  const envPath = path.join(PROJECT_ROOT, ".env");
  const envExists = await fs.pathExists(envPath);

  if (!envExists) {
    note("Это первый запуск необходимо указать адрес апи.");

    const apiUrl = await text({
      message: "Введи базовый адрес API (например, https://api.<path>.ru):",
      validate: (value) => {
        if (!value || value.trim() === "")
          return "Адрес API не может быть пустым";
        if (!value.startsWith("http"))
          return "Адрес должен начинаться с http:// или https://";
      },
    });

    if (isCancel(apiUrl)) process.exit(0);

    await fs.writeFile(envPath, `VITE_API_PROXY_TARGET=${apiUrl}\n`);
    note("✅ Файл .env успешно создан!", "Настройка завершена");
  }

  const entityName = await text({
    message: "Как назовем сущность?",
    placeholder:
      "Название сущности на английском (в camelCase, например: match, tournament)",
    validate: (input) => {
      input?.trim() !== "" || "Название не может быть пустым";
    },
  });
  if (isCancel(entityName)) process.exit(0);

  const entityLabel = await text({
    message: "Заголовок для UI на русском (например: Матчи, Турниры)",
  });
  const entityPascalCase =
    entityName.charAt(0).toUpperCase() + entityName.slice(1);

  const apiDirPath = path.join(PROJECT_ROOT, `src/entities/${entityName}/api`);
  const pagePath = path.join(PROJECT_ROOT, `src/pages/${entityName}-page.tsx`);

  const templateApi = path.join(__dirname, "templates/api.ts.ejs");
  const templatePage = path.join(__dirname, "templates/page.tsx.ejs");

  const outputApi = path.join(apiDirPath, `${entityName}-api.ts`);

  try {
    await fs.ensureDir(apiDirPath);

    const apiData = await ejs.renderFile(templateApi, {
      entityName,
      entityLabel,
      entityPascalCase,
    });
    await fs.writeFile(outputApi, apiData);

    const pageData = await ejs.renderFile(templatePage, {
      entityName,
      entityLabel,
      entityPascalCase,
    });
    await fs.writeFile(pagePath, pageData);
    // --- АВТОИНЖЕКЦИЯ КОДА ---
    const navPath = path.join(PROJECT_ROOT, "src/shared/config/navigation.ts");
    const routerPath = path.join(PROJECT_ROOT, "src/app/router.tsx");
    const vitePath = path.join(PROJECT_ROOT, "vite.config.ts");

    // 1. Обновляем Sidebar (navigation.ts)
    let navContent = await fs.readFile(navPath, "utf-8");
    const navInjection = `{ path: "/${entityName}s", label: "${entityLabel}" },\n  // CLI_INJECT_NAVIGATION`;
    await fs.writeFile(
      navPath,
      navContent.replace("// CLI_INJECT_NAVIGATION", navInjection),
    );

    // 2. Обновляем Router (router.tsx)
    let routerContent = await fs.readFile(routerPath, "utf-8");

    const importInjection = `import { ${entityPascalCase}Page } from "@/pages/${entityName}-page";\n// CLI_INJECT_IMPORT`;
    const routeInjection = `const ${entityName}sRoute = createRoute({\n  getParentRoute: () => protectedLayoutRoute,\n  path: "/${entityName}s",\n  component: ${entityPascalCase}Page,\n});\n// CLI_INJECT_ROUTE`;
    const treeInjection = `${entityName}sRoute,\n    // CLI_INJECT_TREE`;

    routerContent = routerContent
      .replace("// CLI_INJECT_IMPORT", importInjection)
      .replace("// CLI_INJECT_ROUTE", routeInjection)
      .replace("// CLI_INJECT_TREE", treeInjection);

    await fs.writeFile(routerPath, routerContent);

    // 3. Обновляем Proxy (vite.config.ts)
    let viteContent = await fs.readFile(vitePath, "utf-8");
    const proxyInjection = `"${entityName}",\n  /* CLI_INJECT_PROXY */`;
    await fs.writeFile(
      vitePath,
      viteContent.replace("/* CLI_INJECT_PROXY */", proxyInjection),
    );

    note(
      [
        `src/entities/${entityName}/api/${entityName}-api.ts`,
        `src/pages/${entityName}-page.tsx`,
        "",
        `🔗 Роутинг, сайдбар и Vite Proxy автоматически обновлены!`,
      ].join("\n"),
      `Сущность ${entityPascalCase} сгенерирована`,
    );

    outro("made by PHASTAMANE");
  } catch (err) {
    console.error("❌ Ошибка генерации:", err);
  }
}
run();
