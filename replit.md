# i-Buk Study Planner

i-Buk is a local-first study workspace for organizing courses and local material references, logging study time, tracking exams, and receiving understandable study recommendations.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/i-buk run dev` — run the i-Buk preview
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- The i-Buk preview workflow supplies `PORT` and `BASE_PATH`; a manual build can use `PORT=4173 BASE_PATH=/ pnpm --filter @workspace/i-buk run build`.
- The current i-Buk build is local-first and does not require `DATABASE_URL`, Supabase, or Gemini to provide its basic functionality.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/i-buk/src/App.tsx` — routes, screens, deterministic scheduler, and local CRUD interactions.
- `artifacts/i-buk/src/lib/store.ts` — local workspace types, starter data, and localStorage persistence.
- `artifacts/i-buk/src/lib/desktop.ts` — narrow desktop bridge seam for opening local references without putting filesystem access in the UI.
- `artifacts/i-buk/src/index.css` — i-Buk visual language and responsive shell styling.
- `desktop/` — Windows Electron shell, secure preload bridge, renderer packaging, and installer configuration.
- `.github/workflows/i-buk.yml` — GitHub Actions install, typecheck, and preview build checks.
- `.github/workflows/build-desktop.yml` — Windows x64 Electron installer workflow.
- `docs/i-buk-implementation-status.md` — canonical playbook comparison and remaining-work backlog.

## Architecture decisions

- Core study data stays on-device so the app remains useful offline and does not upload study material bytes.
- Local files are represented as metadata/reference paths only; a future Electron preload bridge can safely provide OS file opening.
- Recommendations are deterministic and explainable. Exam timing and topic freshness lead; study frequency is retained as history, not importance.
- Cloud sync and AI are optional seams, not prerequisites for basic study workflows.

## Product

- Today dashboard with next focus and daily study intention.
- Course library with nested topics, local file references, web links, and quick study logging.
- Exam timetable with completion status, optional times, and availability settings.
- Lightweight notes/reminders, local JSON import/export, statistics, and simple recommendations for today, tomorrow, or the next seven days.

## User preferences

- Keep the product simple, local-first, and professional.
- Do not upload or store the contents of PDFs, Word files, spreadsheets, slides, videos, images, audio, or other study files.
- Do not add social features, gamification, flashcards, quizzes, collaboration, or an AI chatbot.

## Gotchas

- Use the managed `artifacts/i-buk: web` workflow for preview; it supplies `PORT` and `BASE_PATH`.
- Use `pnpm --filter @workspace/i-buk run typecheck` for the normal leaf-package check.
- Browser preview can store local paths but cannot open arbitrary OS files; packaged Electron should implement the `ibukDesktop.openPath` bridge from `src/lib/desktop.ts`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
