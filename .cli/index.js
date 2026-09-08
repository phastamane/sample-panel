#!/usr/bin/env node
import {
  select,
  text,
  isCancel,
  intro,
  outro,
  spinner,
  note,
} from "@clack/prompts";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// PROJECT_ROOT — это корень твоего эталонного репозитория, который скачал pnpm
const PROJECT_ROOT = path.resolve(__dirname, "..");

async function main() {
  intro("🚀 CyberLiga Admin CLI");

  const action = await select({
    message: "Что ты хочешь сделать?",
    options: [
      { value: "init", label: "Развернуть новый проект" },
      { value: "generate", label: "Сгенерировать CRUD-сущность" },
    ],
  });

  if (isCancel(action)) {
    outro("Отменено");
    process.exit(0);
  }

  if (action === "init") {
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

      s.stop("✨ Проект успешно развернут!");

      note(
        [`cd ${projectName}`, `pnpm install`, `pnpm dev`].join("\n"),
        "Следующие шаги:",
      );

      outro("Удачного кодинга! 🖤");
    } catch (err) {
      s.stop("❌ Ошибка при копировании файлов");
      console.error(err);
      process.exit(1);
    }
  } else if (action === "generate") {
    // Запускаем наш уже готовый генератор сущностей
    const generateScript = path.join(__dirname, "generate.js");
    spawn("node", [generateScript], { stdio: "inherit" });
  }
}

main();
