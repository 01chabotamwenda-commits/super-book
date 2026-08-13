# i-Buk Implementation Status

**Canonical status document:** this Markdown file supersedes the older Word gap-analysis documents.  
**Compared against:** `attached_assets/i-Buk_Replit_Development_Playbook_1786609486467.docx`  
**Assessment date:** August 13, 2026

## Executive summary

i-Buk has completed the browser-first local study-planning milestone and now has the foundation for a Windows Electron build. The current product already supports the core organization and planning loop: courses, recursive topics, folders, local-file and web references as metadata, notes, exams, study events, availability, deterministic recommendations, generated study blocks, statistics, import/export, optional Supabase snapshot sync, domain tests, and a Windows packaging workflow.

The largest remaining gap is now release validation of the desktop boundary:

1. Manually verify the uploaded Windows installer on Windows 11.
2. Expand renderer/component coverage if the UI grows beyond the current smoke and domain checks.
3. Decide whether installer signing and GitHub Release publishing are needed for distribution.

Gemini and Supabase are intentionally not expanded in this pass because the product decision is to keep those existing, tested seams optional and local-first.

The product remains intentionally local-first. Study-file bytes must never be uploaded to Supabase or Gemini.

## Status legend

- **Implemented** — working in the current repository.
- **Partial** — a useful slice exists, but playbook behavior remains incomplete.
- **Missing** — no working implementation exists.
- **Deferred** — intentionally postponed because it is optional or depends on a product decision.

## Playbook comparison

| Playbook area | Status | What exists now | What remains |
| --- | --- | --- | --- |
| Stages 0–2: product constraints and architecture | Implemented | Local-first boundaries, no cloud study-file storage, deterministic core, optional AI/cloud layers, and Windows desktop direction are documented in `replit.md` and the playbook. | Keep these constraints current as desktop and cloud features are added. |
| Stage 3: project foundation | Implemented | pnpm workspace, TypeScript, Replit artifacts, managed preview, domain tests, GitHub checks, desktop syntax/config checks, Electron packaging config, and a Windows workflow exist. | Keep release checks current. |
| Stage 4: library hierarchy | Implemented / Partial | Courses, recursive topics, folders, parent-cycle protection, delete cleanup, sibling reorder controls, and course/topic/folder relationships exist. | Add one unified tree experience, move/reorder behavior at every supported level, keyboard navigation, and optionally drag-and-drop. |
| Stage 5: local material integration | Implemented | File paths and URLs are stored as metadata only; Electron supports file selection, existence/type metadata, missing-file states, relationship-preserving relinking, safe image/video previews, OS opening for normal documents, and external web links. | Add broader packaged-app media regression coverage. |
| Stage 6: notes and reminders | Implemented | Lightweight notes support title, body, pinning, reminders, and course/topic/folder relationships. Electron schedules, persists, restores, cancels, cleans stale records, and delivers supported OS notifications. | Verify delivery on Windows 11 notification settings. |
| Stage 7: exam timetable | Implemented | Exam CRUD, course, date, optional time, completion state, and validation exist. Completed exams are excluded from recommendations and covered by tests. | Add broader time-zone/date regression coverage. |
| Stage 8: study logging | Implemented | Individual repeated sessions retain course, topic, date, minutes, duration, start time, optional end time, source, and note. Manual historical logging and one-click “log now” are supported. | Verify the behavior in packaged Electron. |
| Stage 9: statistics | Implemented for the browser milestone | Total time, weekly activity, sessions, course totals, topic totals, event counts, coverage, recent sessions, and neglected/untouched topics are displayed. | Add renderer tests and decide whether a richer visual history is worthwhile. |
| Stages 10–11: scheduler and availability | Implemented / Partial | Deterministic recommendations and bounded study blocks use exams, completed status, freshness, recent course activity, topic importance, availability, and daily capacity. Today, tomorrow, and next seven days are available. | Support arbitrary `next X days`, use historical session patterns as a gentle preference, and add natural-language scheduling only through optional Gemini. |
| Stage 12: Gemini | Deferred / Partial | OpenAPI schemas and generated client hooks define a Gemini explanation contract; the database includes an AI audit-log table. The basic app does not depend on AI. | Implement the server route, secure provider call, strict output validation, timeout/fallback behavior, and a subtle “why this was suggested” UI if approved. |
| Stages 13–14: Supabase and sync | Partial | `@supabase/supabase-js`, a local-to-cloud workspace snapshot sync seam, a migration, user-scoped RLS policies, and graceful local fallback exist. Only structured JSON metadata is synchronized. | Apply/verify migrations, add authentication/session UX, define offline conflict rules, and test multi-device reconciliation. |
| Stage 15: desktop experience | Implemented / Partial | Windows Electron shell has context isolation, `nodeIntegration=false`, sandboxing, external-link handling, OS path opening, local renderer packaging, NSIS configuration, shortcuts, desktop-owned persistence, local reference handling, media previews, and reminders. | Verify the packaged app on Windows 11. |
| Stage 16: testing and reliability | Implemented / Partial | Store/planner domain tests, desktop path/workspace tests, desktop syntax checks, typecheck, production build, and Replit preview checks pass. | Add deeper renderer/component and IPC harnesses if release risk warrants them. |
| Stage 17: GitHub/release automation | Implemented / Partial | `.github/workflows/i-buk.yml` runs workspace, config-format, desktop-syntax, and desktop helper checks; `.github/workflows/build-desktop.yml` builds a Windows x64 NSIS installer and uploads the `.exe`. | Manually verify the uploaded `.exe` on Windows 11; optionally add signing, GitHub Release publishing, and release promotion notes. |
| Stage 18: final audit | Implemented / Partial | This document is the current requirements audit and release backlog; desktop milestones are complete for code-level verification. | Close the audit after Windows 11 installer verification. |

## What is already implemented

### Local-first workspace

- Versioned workspace persistence with safe parsing and legacy-session normalization.
- Local JSON export/import and reset-to-sample recovery.
- Courses, recursive topics, nested folders, materials, exams, notes, sessions, and availability.
- File references remain paths/URLs; the app does not read or upload study-file bytes.
- Browser preview remains useful without Supabase or Gemini.

### Hierarchy and library behavior

- Course create/edit/delete and course navigation.
- Recursive topic rendering with parent validation and cycle prevention.
- Folder create/edit/delete, nesting, sibling reordering, and cleanup of linked records.
- Materials can be attached to courses, topics, or folders.
- Notes can be unlinked or related to courses, topics, and folders.
- Search across courses, topics, folders, notes, and material references.

### Planning and study history

- Exam-aware, completion-aware, freshness-aware deterministic recommendations.
- Course-balance adjustment based on recent study activity.
- Availability days, time window, and daily capacity validation.
- Generated study blocks with date, start, end, duration, course, topic, and reason.
- Repeated study events are preserved individually rather than collapsed into a boolean.
- Statistics are derived from event history rather than stale topic metadata.

### Desktop foundation

- `desktop/main.cjs` owns the BrowserWindow and OS path opening.
- `desktop/preload.cjs` exposes a narrow `ibukDesktop` bridge for file selection, path inspection, workspace persistence, reminders, status, and window controls.
- Renderer security uses context isolation, disabled Node integration, and a sandboxed renderer.
- HTTP(S) links are opened externally; non-file navigation is blocked.
- `desktop/prepare-renderer.mjs` copies the relative-base Vite build into the Electron package.
- `desktop/package.json` configures Windows x64 NSIS output, Start Menu shortcuts, and desktop shortcuts.
- `.github/workflows/build-desktop.yml` is ready to run on `windows-latest`.

### Cloud and AI seams

- Supabase snapshot sync is optional and falls back to local data when unavailable or unauthenticated.
- Supabase migration defines user-scoped profiles, workspace snapshots, and AI audit records with RLS.
- Gemini request/response schemas and generated client hooks exist as a contract, but no runtime route is enabled.
- No privileged service key is placed in the renderer.

## Remaining implementation backlog

### Priority 1 — Verify the Windows desktop boundary

1. **Choose a local file** — implemented in `desktop/main.cjs`, `desktop/preload.cjs`, and the material dialog.

2. **Check and relink references** — implemented with metadata-only inspection, missing badges, and relationship-preserving relinking.

3. **Handle media intentionally** — implemented with safe `file:` previews for images/video and OS opening for other local documents.

4. **Add Windows reminders** — implemented with persisted reminder records, restart restoration, stale cleanup, cancellation, and supported OS notifications.

5. **Choose desktop persistence** — implemented as a main-process-owned atomic JSON store with a 10 MB guard; renderer localStorage remains the browser fallback.

### Priority 2 — Reliability and release validation

1. Expand renderer/component and IPC harnesses if needed for release confidence.
2. Keep malformed-data, offline, missing-configuration, completed-exam, repeated-session, and Supabase/Gemini-unavailable scenarios covered as those seams evolve.
3. Keep the config-format and desktop syntax checks in CI.
4. Run `Build Desktop App (Electron)` on GitHub and verify the uploaded `.exe` on Windows 11.
5. Decide whether installer signing and GitHub Release publishing are needed for distribution.

### Priority 3 — Optional integrations

#### Gemini — intentionally deferred

The existing contract and audit-log seam are retained. No route/UI expansion is planned for this release because Gemini is optional and the user confirmed this area is already implemented/tested:

- Add the `/api/gemini/explain` server handler described by `lib/api-spec/openapi.yaml`.
- Keep `GEMINI_API_KEY` server-side; never use a `VITE_` variable for it.
- Send structured schedule metadata only, never study-file contents.
- Validate model output against the generated schema.
- Return a deterministic explanation/fallback when Gemini is unavailable.
- Keep the UI to explanations or “why this was suggested,” not a chatbot.

#### Supabase — intentionally deferred

The existing local-to-cloud snapshot slice is retained. No auth/conflict expansion is planned for this release because Supabase is optional and the user confirmed this area is already implemented/tested:

- Auth/session UX for the desktop app.
- Confirmed deployment of `supabase/migrations/20260813_sync_and_ai.sql`.
- Explicit offline outbox and conflict behavior.
- Multi-device sync tests.
- Clear online/offline status in the UI.
- Verification that RLS policies match the final data model.

## Features added beyond the playbook

These are intentional additions, not gaps:

- Local JSON backup and restore.
- Workspace-wide search with keyboard shortcut support.
- Workspace breadcrumb/navigation menu.
- Profile name customization and initials.
- Pinned notes and reminder metadata.
- Course/topic/folder association for notes and materials.
- Explainable deterministic recommendation reasons.
- Generated schedule blocks rather than only a ranked topic list.
- Cycle-safe hierarchy utilities and cleanup of linked records.
- Browser-safe fallback messaging when desktop file opening is unavailable.
- Replit artifact registration and managed preview routing.
- A separate Windows Electron packaging package and GitHub installer artifact workflow.

## Verification snapshot

Last verified in Replit:

- `pnpm run typecheck` — passed.
- `pnpm --filter @workspace/i-buk run test` — 12 domain tests passed.
- `PORT=4173 BASE_PATH=/ pnpm --filter @workspace/i-buk run build` — passed.
- `cd desktop && npm ci` — passed.
- `cd desktop && npm test` — passed (path/media and atomic workspace helpers).
- `cd desktop && npm run prepare:renderer` — passed.
- Desktop JavaScript syntax and config-format checks — passed.
- `cd desktop && npx electron-builder --linux dir --x64` — passed as a local packaging smoke check.
- GitHub Actions `Build Desktop App (Electron)` — passed and uploaded the Windows x64 NSIS installer.
- Replit managed root preview — HTTP 200 through the proxied URL.

The GitHub Windows runner successfully produced the NSIS installer. The Replit Linux host cannot finish the NSIS step because Wine is not installed; this is an environment limitation, not a Windows workflow failure. Manual installation verification on Windows 11 remains open.

## Release acceptance checklist

- [x] Browser-first local workspace works without Gemini or Supabase.
- [x] Structured data remains separate from study-file bytes.
- [x] Courses, recursive topics, folders, notes, materials, exams, sessions, and availability exist.
- [x] Repeated study sessions remain individual events.
- [x] Deterministic recommendations and bounded study blocks exist.
- [x] Domain tests, typecheck, production build, and proxied preview pass.
- [x] Electron shell and secure preload boundary exist.
- [x] Windows x64 NSIS workflow is defined.
- [x] Local file choose/check/relink flow is implemented for the packaged Windows app.
- [x] Missing-file and media preview states are implemented for the packaged Windows app.
- [x] Reminder notifications persist and restore across application restart.
- [x] Desktop persistence strategy is finalized and helper-tested.
- [x] Desktop path/persistence reliability checks are added.
- [x] Windows workflow has produced the NSIS installer.
- [ ] Uploaded Windows installer is manually verified on Windows 11.
- [x] Gemini is explicitly deferred for the release; its existing contract remains available.
- [x] Supabase expansion is explicitly deferred for the release; its existing tested snapshot seam remains available.
- [ ] Signing/release publishing decision is documented.

## Source-of-truth files

- `attached_assets/i-Buk_Replit_Development_Playbook_1786609486467.docx` — original requirements/playbook.
- `artifacts/i-buk/src/App.tsx` — current renderer routes and workflows.
- `artifacts/i-buk/src/lib/store.ts` — local data model, validation, persistence, and migrations.
- `artifacts/i-buk/src/lib/planner.ts` — recommendations, summaries, neglected topics, and study blocks.
- `artifacts/i-buk/src/lib/sync.ts` — optional Supabase snapshot sync.
- `supabase/migrations/20260813_sync_and_ai.sql` — cloud schema and RLS policies.
- `desktop/` — Electron shell and Windows packaging.
- `.github/workflows/i-buk.yml` — browser checks.
- `.github/workflows/build-desktop.yml` — Windows installer build.

Update this Markdown file whenever a playbook stage changes status. Keep the playbook unchanged as the requirements reference.