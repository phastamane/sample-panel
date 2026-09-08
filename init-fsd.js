import fs from 'fs'
import path from 'path';

// Папка по умолчанию — src, но можно передать аргументом
const rootDir = process.argv[2] || 'src';

// Основные слои FSD и базовая структура для shared
const directories = [
  'app',
  'pages',
  'widgets',
  'features',
  'entities',
  'shared',
  'shared/ui',
  'shared/lib',
  'shared/api',
  'shared/config',
  'shared/assets',
];

console.log(`🚀 Создаем FSD архитектуру в директории "${rootDir}"...`);

// Функция для создания папок
directories.forEach((dir) => {
  const dirPath = path.join(rootDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Создана папка: ${dirPath}`);
  }
});

// Слои, которым нужен глобальный Public API (index.ts)
const layersWithIndex = ['app', 'pages', 'widgets', 'features', 'entities'];

layersWithIndex.forEach((layer) => {
  const indexPath = path.join(rootDir, layer, 'index.ts');
  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, '// Public API\nexport {};\n');
    console.log(`📄 Создан файл: ${indexPath}`);
  }
});

console.log('✅ Структура Feature-Sliced Design успешно создана!');