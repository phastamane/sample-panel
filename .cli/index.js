#!/usr/bin/env node
import { text, isCancel, intro, outro, spinner, note } from "@clack/prompts";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// PROJECT_ROOT — это корень твоего эталонного репозитория, который скачал pnpm
const PROJECT_ROOT = path.resolve(__dirname, "..");

async function main() {
  intro("sample-admin CLI");

  const projectName = await text({
    message: "Как назовем папку с новым проектом?",
    placeholder: "my-admin-panel",
    validate: (value) => {
      if (!value || value.trim() === "")
        return "Имя проекта не может быть пустым";
    },
  });

  if (isCancel(projectName)) {
    outro("Отменено");
    process.exit(0);
  }

  // Рабочая папка пользователя, откуда он вызвал команду
  const targetDir = path.join(process.cwd(), projectName);
  const envPath = path.join(targetDir, ".env");
  const s = spinner();
  s.start(`Клонируем FSD-шаблон в папку ${projectName}...`);

  try {
    // 1. Копируем все файлы проекта
    await fs.copy(PROJECT_ROOT, targetDir, {
      filter: (src) => {
        const name = path.basename(src);
        // Исключаем системные папки, чтобы не тащить чужую историю и зависимости
        return !["node_modules", ".git", "dist", ".DS_Store"].includes(name);
      },
    });
    await fs.move(
      path.join(targetDir, ".cli", "orval.config.js"),
      path.join(targetDir, "orval.config.ts"),
      { overwrite: true },
    );

    // 2. Адаптируем package.json под новый проект
    const pkgPath = path.join(targetDir, "package.json");
    if (await fs.pathExists(pkgPath)) {
      const pkg = await fs.readJson(pkgPath);
      pkg.name = projectName;
      pkg.version = "0.1.0";
      // Пользователю в его конечном проекте глобальный бинарник не нужен
      delete pkg.bin;
      await fs.writeJson(pkgPath, pkg, { spaces: 2 });
    }

    s.stop("Проект успешно развернут!");

    note("Это первый запуск, необходимо указать адрес API.");

    const apiUrl = await text({
      message: "Введи базовый адрес API (например, https://api.<path>.ru):",
      validate: (value) => {
        if (!value || value.trim() === "")
          return "Адрес API не может быть пустым";
        if (!value.startsWith("http"))
          return "Адрес должен начинаться с http:// или https://";
      },
    });

    if (isCancel(apiUrl)) {
      outro("Отменено");
      process.exit(0);
    }

    await fs.writeFile(envPath, `VITE_API_PROXY_TARGET=${apiUrl}\n`);
    note("✅ Файл .env успешно создан!", "Настройка завершена");

    note(
      [
        `cd ${projectName}`,
        `pnpm install`,
        `pnpm generate:api`,
        `pnpm dev`,
      ].join("\n"),
      "Следующие шаги:",
    );

    outro("made by phastamane");
  } catch (err) {
    s.stop("Ошибка при создании проекта");
    console.error(err);
    process.exit(1);
  }
}

main();
