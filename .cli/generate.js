import path from "path";
import { fileURLToPath } from "url";
import { text, select, confirm, isCancel, note } from "@clack/prompts";
import { outro } from "@clack/prompts";
import ejs from "ejs";
import fs from "fs-extra";
import { addProxyPrefix } from "./lib/scaffold.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

async function run() {
  const entityName = await text({
    message: "Как назовем сущность?",
    placeholder: "Название сущности (в camelCase, например: match, tournament)",
    validate: (input) => {
      input?.trim() !== "" || "Название не может быть пустым";
    },
  });
  if (isCancel(entityName)) process.exit(0);

  const entityLabel = await text({
    message: "Заголовок для UI на русском (например: Матчи, Турниры)",
  });
  if (isCancel(entityLabel)) process.exit(0);

  const hasForm = await confirm({
    message: "Есть ли у этой сущности метод создания (create)?",
    initialValue: true,
  });
  if (isCancel(hasForm)) process.exit(0);

  const hasUpdate = await confirm({
    message: "Есть ли у этой сущности метод изменения (update)?",
    initialValue: true,
  });
  if (isCancel(hasUpdate)) process.exit(0);

  const hasDelete = await confirm({
    message:
      "Есть ли у этой сущности метод удаления (delete)? В текущей спеке DELETE-эндпоинтов нет.",
    initialValue: false,
  });
  if (isCancel(hasDelete)) process.exit(0);

  const entityPascalCase =
    entityName.charAt(0).toUpperCase() + entityName.slice(1);

  const petstoreImports = [
    ...(hasForm
      ? [`${entityName}ControllerHandle${entityPascalCase}Create`]
      : []),
    `${entityName}ControllerHandle${entityPascalCase}List`,
    ...(hasUpdate
      ? [`${entityName}ControllerHandle${entityPascalCase}IdUpdate`]
      : []),
    ...(hasDelete
      ? [`${entityName}ControllerHandle${entityPascalCase}IdDelete`]
      : []),
    `use${entityPascalCase}ControllerHandle${entityPascalCase}List`,
  ];

  const schemaImports = [
    ...(hasForm
      ? [`${entityPascalCase}CreateSchemaData${entityPascalCase}`]
      : []),
    ...(hasUpdate
      ? [`${entityPascalCase}IdUpdateSchemaData${entityPascalCase}`]
      : []),
  ];

  // Дженерики defineTableConfig позиционные, поэтому при update без create
  // слоты TFormValues/TMutationResponse нужно чем-то заполнить.
  const configGenerics = [
    `${entityPascalCase}ListResponse`,
    `${entityPascalCase}Row`,
    `${entityPascalCase}ListParams`,
  ];
  if (hasForm || hasUpdate) {
    configGenerics.push(
      hasForm ? `${entityPascalCase}FormValues` : "Record<string, unknown>",
      hasForm ? `${entityPascalCase}CreateResponse` : "unknown",
    );
  }
  if (hasUpdate) {
    configGenerics.push(`${entityPascalCase}UpdateValues`);
  }

  const templateData = {
    entityName,
    entityLabel,
    entityPascalCase,
    hasForm,
    hasUpdate,
    hasDelete,
    petstoreImports,
    schemaImports,
    configGenerics,
  };

  const apiDirPath = path.join(PROJECT_ROOT, `src/entities/${entityName}/api`);
  const pagePath = path.join(PROJECT_ROOT, `src/pages/${entityName}-page.tsx`);

  const templateApi = path.join(__dirname, "templates/api.ts.ejs");
  const templatePage = path.join(__dirname, "templates/page.tsx.ejs");

  const outputApi = path.join(apiDirPath, `${entityName}-api.ts`);

  try {
    await fs.ensureDir(apiDirPath);

    const apiData = await ejs.renderFile(templateApi, templateData);
    await fs.writeFile(outputApi, apiData);

    const pageData = await ejs.renderFile(templatePage, templateData);
    await fs.writeFile(pagePath, pageData);

    // --- АВТОИНЖЕКЦИЯ КОДА ---
    const navPath = path.join(PROJECT_ROOT, "src/shared/config/navigation.ts");
    const routerPath = path.join(PROJECT_ROOT, "src/app/router.tsx");

    // 1. Обновляем Sidebar (navigation.ts)
    const navContent = await fs.readFile(navPath, "utf-8");
    const navInjection = `{ path: "/${entityName}s", label: "${entityLabel}" },\n  // CLI_INJECT_NAVIGATION`;
    await fs.writeFile(
      navPath,
      navContent.replace("// CLI_INJECT_NAVIGATION", navInjection),
    );

    // 2. Обновляем Router (router.tsx)
    const routerContent = await fs.readFile(routerPath, "utf-8");

    const importInjection = `import { ${entityPascalCase}Page } from "@/pages/${entityName}-page";\n// CLI_INJECT_IMPORT`;
    const routeInjection = `const ${entityName}sRoute = createRoute({\n  getParentRoute: () => protectedLayoutRoute,\n  path: "/${entityName}s",\n  component: ${entityPascalCase}Page,\n});\n// CLI_INJECT_ROUTE`;
    const treeInjection = `${entityName}sRoute,\n    // CLI_INJECT_TREE`;

    await fs.writeFile(
      routerPath,
      routerContent
        .replace("// CLI_INJECT_IMPORT", importInjection)
        .replace("// CLI_INJECT_ROUTE", routeInjection)
        .replace("// CLI_INJECT_TREE", treeInjection),
    );

    // 3. Обновляем Proxy (vite.config.ts)
    await addProxyPrefix(PROJECT_ROOT, entityName);

    const methods = [
      hasForm && "create",
      hasUpdate && "update",
      hasDelete && "delete",
    ].filter(Boolean);

    note(
      [
        `src/entities/${entityName}/api/${entityName}-api.ts`,
        `src/pages/${entityName}-page.tsx`,
        "",
        `🔗 Роутинг, сайдбар и Vite Proxy автоматически обновлены!`,
        `⚙️  Методы: ${methods.length ? methods.join(", ") : "только list"}`,
        ...(hasUpdate || hasDelete
          ? ["📋 Колонка «Действия» появится в таблице автоматически."]
          : []),
      ].join("\n"),
      `Сущность ${entityPascalCase} сгенерирована`,
    );

    outro("made by PHASTAMANE");
  } catch (err) {
    console.error("❌ Ошибка генерации:", err);
  }
}
run();
