# IWA 360 - Личный кабинет

Современный личный кабинет на базе Nuxt 4 с архитектурой Feature-Sliced Design.

## Технологический стек

- **Framework**: Nuxt 4.4.5, Vue 3.5.34
- **Language**: TypeScript 6.0.3
- **Styling**: Tailwind CSS 4.3.0
- **UI Components**: shadcn-nuxt, Reka UI, Lucide Icons
- **Forms**: Vee-validate + Zod
- **Tables**: TanStack Vue Table
- **Testing**: Vitest (unit, nuxt, e2e)
- **Linting**: ESLint

## Архитектура

Проект использует Feature-Sliced Design (FSD):

```
src/
├── app/          # Слой приложения (routes, layouts, plugins, assets)
├── entities/     # Бизнес-сущности
├── features/     # Фичи
├── pages/        # Страницы
├── shared/       # Общий код (ui, lib)
└── widgets/      # Виджеты
```

## Установка

```bash
# Установить зависимости
pnpm install

# Создать .env файл на основе .env.example
cp .env.example .env
```

## Разработка

```bash
# Запустить dev сервер
pnpm dev

# Типизация
pnpm typecheck

# Линтинг
pnpm lint

# Тесты
pnpm test              # все тесты
pnpm test:unit         # unit тесты
pnpm test:nuxt         # nuxt тесты
pnpm test:e2e          # e2e тесты
pnpm test:coverage     # с покрытием
```

## Сборка

```bash
# Production build
pnpm build

# Preview production build
pnpm preview
```

## Скрипты

- `pnpm verify` - полная проверка (lint, typecheck, build, test)
- `pnpm verify:quick` - быстрая проверка без билда
- `pnpm lint:fix` - исправить ошибки линтинга
- `pnpm format` - форматировать код с Prettier
- `pnpm format:check` - проверить форматирование

## Git Hooks

Проект использует Husky для Git hooks:
- **pre-commit**: запускает lint-staged для проверки и форматирования измененных файлов
- **commit-msg**: проверяет сообщения коммитов с помощью Commitlint

## CI/CD

GitHub Actions настроен для автоматической проверки:
- Линтинг и форматирование
- Типизация
- Тесты с покрытием
- Сборка проекта
