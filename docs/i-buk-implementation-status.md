# i-Buk Implementation Status

**Canonical status document:** this Markdown file supersedes the older Word gap-analysis documents.  
**Compared against:** `attached_assets/i-Buk_Replit_Development_Playbook_1786609486467.docx`  
**Assessment date:** August 13, 2026

## Executive summary

i-Buk has completed the browser-first local study-planning milestone and now has the foundation for a Windows Electron build. The current product already supports the core organization and planning loop: courses, recursive topics, folders, local-file and web references as metadata, notes, exams, study events, availability, deterministic recommendations, generated study blocks, statistics, import/export, optional Supabase snapshot sync, domain tests, and a Windows packaging workflow.

The largest remaining gap is not the React experience itself. It is the desktop boundary around it:

1. Finish the Electron filesystem features: choose, inspect, relink, and preview local references.
2. Add restart-safe Windows notifications for note reminders.
3. Decide whether desktop persistence should remain renderer-local or move to a main-process-owned store.
4. Add renderer/Electron reliability coverage and manually verify the uploaded Windows installer on Windows 11.
5. Implement the optional Gemini server route and UI only if the AI explanation feature is still wanted.
6. Complete Supabase authentication, migration execution, and multi-device conflict behavior if cloud sync is required.

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
| Stage 3: project foundation | Implemented / Partial | pnpm workspace, TypeScript, Replit artifacts, managed preview, domain tests, GitHub checks, `desktop/main.cjs`, `desktop/preload.cjs`, Electron packaging config, and a Windows workflow exist. | Add linting and Electron/renderer test harnesses. |
| Stage 4: library hierarchy | Implemented / Partial | Courses, recursive topics, folders, parent-cycle protection, delete cleanup, sibling reorder controls, and course/topic/folder relationships exist. | Add one unified tree experience, move/reorder behavior at every supported level, keyboard navigation, and optionally drag-and-drop. |
| Stage 5: local material integration | Partial | File paths and URLs are stored as metadata only; web links open externally; the Electron bridge can open a local path through the OS. | Add file selection, existence/type metadata, missing-file states, relinking, and intentional image/video preview behavior. |
| Stage 6: notes and reminders | Partial | Lightweight notes support title, body, pinning, reminders, and course/topic/folder relationships. | Schedule, persist, restore, cancel, and deliver Windows notifications across restarts. |
| Stage 7: exam timetable | Implemented | Exam CRUD, course, date, optional time, completion state, and validation exist. Completed exams are excluded from recommendations and covered by tests. | Add broader time-zone/date regression coverage. |
| Stage 8: study logging | Implemented for the browser milestone | Individual repeated sessions retain course, topic, date, minutes, duration, start time, optional end time, source, and note. Manual historical logging is supported. | Add an even faster one-click “log now” flow and verify the behavior in packaged Electron. |
| Stage 9: statistics | Implemented for the browser milestone | Total time, weekly activity, sessions, course totals, topic totals, event counts, coverage, recent sessions, and neglected/untouched topics are displayed. | Add renderer tests and decide whether a richer visual history is worthwhile. |
| Stages 10–11: scheduler and availability | Implemented / Partial | Deterministic recommendations and bounded study blocks use exams, completed status, freshness, recent course activity, topic importance, availability, and daily capacity. Today, tomorrow, and next seven days are available. | Support arbitrary `next X days`, use historical session patterns as a gentle preference, and add natural-language scheduling only through optional Gemini. |
| Stage 12: Gemini | Deferred / Partial | OpenAPI schemas and generated client hooks define a Gemini explanation contract; the database includes an AI audit-log table. The basic app does not depend on AI. | Implement the server route, secure provider call, strict output validation, timeout/fallback behavior, and a subtle “why this was suggested” UI if approved. |
| Stages 13–14: Supabase and sync | Partial | `@supabase/supabase-js`, a local-to-cloud workspace snapshot sync seam, a migration, user-scoped RLS policies, and graceful local fallback exist. Only structured JSON metadata is synchronized. | Apply/verify migrations, add authentication/session UX, define offline conflict rules, and test multi-device reconciliation. |
| Stage 15: desktop experience | Partial | Windows Electron shell has context isolation, `nodeIntegration=false`, sandboxing, external-link handling, OS path opening, local renderer packaging, NSIS configuration, and shortcuts. | Complete desktop-only reference states, media handling, notifications, and durable desktop persistence decisions. |
| Stage 16: testing and reliability | Partial | Store/planner domain tests pass; typecheck, production build, and Replit preview checks pass. | Add renderer/component tests, Electron IPC tests, restart/offline/malformed-data scenarios, missing-file tests, and failure-mode coverage. |
| Stage 17: GitHub/release automation | Implemented / Partial | `.github/workflows/i-buk.yml` runs workspace checks; `.github/workflows/build-desktop.yml` now passes on GitHub’s Windows runner, builds a Windows x64 NSIS installer, and uploads the `.exe`; `desktop/README.md` documents GitHub variables/secrets. | Manually verify the uploaded `.exe` on Windows 11; optionally add signing, GitHub Release publishing, and release promotion notes. |
| Stage 18: final audit | In progress | This document is the current requirements audit and release backlog. | Re-run the audit after the desktop filesystem and notification milestones. |

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
- `desktop/preload.cjs` exposes only the `ibukDesktop.openPath` bridge method.
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

### Priority 1 — Complete the Windows desktop boundary

1. **Choose a local file**
   - Add a narrow preload/main `chooseFile` operation.
   - Return path and safe metadata, not file contents.
   - Preserve the existing material association flow.

2. **Check and relink references**
   - Add `checkPath` in the main process using filesystem metadata only.
   - Show missing references clearly in the library.
   - Add a `Locate / Relink` action that preserves material ID and relationships.

3. **Handle media intentionally**
   - Add a safe image preview path.
   - Add a safe local video player path.
   - Continue opening normal documents with the Windows default application.
   - Keep external websites in the system browser.

4. **Add Windows reminders**
   - Schedule note reminders through Electron/Windows notifications.
   - Persist notification identifiers and restore schedules after restart.
   - Support cancellation and stale-reminder cleanup.

5. **Choose desktop persistence**
   - Current localStorage persistence should work for the packaged renderer, but it is not main-process-owned.
   - Decide between a versioned JSON store and a small local database.
   - Preserve migrations, JSON export/import, and offline recovery either way.

### Priority 2 — Reliability and release validation

1. Add renderer/component tests for navigation, CRUD dialogs, empty states, error states, and note/material associations.
2. Add Electron tests for IPC argument validation, path opening, file selection, missing files, relinking, notification scheduling, and restart persistence.
3. Add malformed-data, offline, missing-configuration, completed-exam, repeated-session, and Supabase/Gemini-unavailable scenarios.
4. Add a lint/format check to CI.
5. Run `Build Desktop App (Electron)` on GitHub and verify the uploaded `.exe` on Windows 11.
6. Decide whether installer signing and GitHub Release publishing are needed for distribution.

### Priority 3 — Optional integrations

#### Gemini

Implement only if the optional AI experience is still wanted:

- Add the `/api/gemini/explain` server handler described by `lib/api-spec/openapi.yaml`.
- Keep `GEMINI_API_KEY` server-side; never use a `VITE_` variable for it.
- Send structured schedule metadata only, never study-file contents.
- Validate model output against the generated schema.
- Return a deterministic explanation/fallback when Gemini is unavailable.
- Keep the UI to explanations or “why this was suggested,” not a chatbot.

#### Supabase

The first sync slice exists, but a complete cloud product still needs:

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
- `cd desktop && npm run prepare:renderer` — passed.
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
- [ ] Local file choose/check/relink flow works in packaged Windows app.
- [ ] Missing-file and media preview states work in packaged Windows app.
- [ ] Reminder notifications survive application restart.
- [ ] Desktop persistence strategy is finalized and tested.
- [ ] Renderer and Electron reliability tests are added.
- [x] Windows workflow has produced the NSIS installer.
- [ ] Uploaded Windows installer is manually verified on Windows 11.
- [ ] Gemini route/UI is implemented, or explicitly deferred for the release.
- [ ] Supabase auth/sync/conflict behavior is implemented, or explicitly deferred for the release.
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