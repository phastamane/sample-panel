import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const CLI_DIR = path.resolve(path.dirname(__filename), "..");

const PROXY_START = "/* CLI_PROXY_START */";
const PROXY_END = "/* CLI_PROXY_END */";

// Сущности слоя entities, которые не создаются генератором и не должны
// удаляться при подготовке нового проекта.
const KEEP_ENTITIES = ["auth"];

const routerPath = (projectRoot) =>
  path.join(projectRoot, "src/app/router.tsx");
const navigationPath = (projectRoot) =>
  path.join(projectRoot, "src/shared/config/navigation.ts");
const vitePath = (projectRoot) => path.join(projectRoot, "vite.config.ts");

/**
 * Читает блок префиксов Vite Proxy между маркерами и отдаёт его границы,
 * чтобы правки не задевали базовые префиксы из спеки.
 */
function readProxyBlock(content) {
  const start = content.indexOf(PROXY_START);
  const end = content.indexOf(PROXY_END);
  if (start === -1 || end === -1) {
    throw new Error(
      `В vite.config.ts не найдены маркеры ${PROXY_START} / ${PROXY_END}`,
    );
  }
  const from = start + PROXY_START.length;
  return { from, end, block: content.slice(from, end) };
}

async function writeProxyBlock(projectRoot, updateBlock) {
  const file = vitePath(projectRoot);
  if (!(await fs.pathExists(file))) return;

  const content = await fs.readFile(file, "utf-8");
  const { from, end, block } = readProxyBlock(content);

  await fs.writeFile(
    file,
    content.slice(0, from) + updateBlock(block) + content.slice(end),
  );
}

export function addProxyPrefix(projectRoot, entityName) {
  return writeProxyBlock(
    projectRoot,
    (block) => `\n    "${entityName}",${block}`,
  );
}

export function removeProxyPrefix(projectRoot, entityName) {
  const prefixRegex = new RegExp(`\\s*"${entityName}",`, "g");
  return writeProxyBlock(projectRoot, (block) =>
    block.replace(prefixRegex, "").trimEnd().concat("\n    "),
  );
}

/**
 * Готовит новый проект к работе: раскладывает чистые заготовки роутера и
 * сайдбара, чистит префиксы Vite Proxy и удаляет сущности, сгенерированные
 * в эталонном репозитории.
 */
export async function resetRouting(projectRoot) {
  await fs.copy(
    path.join(CLI_DIR, "templates/router.tsx"),
    routerPath(projectRoot),
    { overwrite: true },
  );
  await fs.copy(
    path.join(CLI_DIR, "templates/navigation.ts"),
    navigationPath(projectRoot),
    { overwrite: true },
  );

  await writeProxyBlock(projectRoot, () => "\n    ");

  await removeGeneratedEntities(projectRoot);
}

async function removeGeneratedEntities(projectRoot) {
  const pagesDir = path.join(projectRoot, "src/pages");
  if (await fs.pathExists(pagesDir)) {
    const pages = await fs.readdir(pagesDir);
    for (const page of pages.filter((name) => name.endsWith("-page.tsx"))) {
      await fs.remove(path.join(pagesDir, page));
    }
  }

  const entitiesDir = path.join(projectRoot, "src/entities");
  if (await fs.pathExists(entitiesDir)) {
    const entries = await fs.readdir(entitiesDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || KEEP_ENTITIES.includes(entry.name)) continue;
      await fs.remove(path.join(entitiesDir, entry.name));
    }
  }
}
