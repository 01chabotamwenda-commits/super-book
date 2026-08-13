# i-Buk Windows desktop app

This folder contains the Electron shell for the Windows 11 x64 build of i-Buk. It is intentionally separate from the pnpm workspace: the React renderer is built by the workspace first, then copied into this package before Electron packages it.

## Local Windows build

From the repository root:

```powershell
pnpm install --frozen-lockfile
$env:BASE_PATH="./"
$env:PORT="21211"
$env:NODE_ENV="production"
pnpm --filter @workspace/i-buk run build
Set-Location desktop
npm ci
npm run start
```

To create the Windows installer:

```powershell
npm run dist:win
```

The installer is written to `desktop/dist/` and targets Windows x64 with an NSIS installer, Start Menu shortcut, and optional desktop shortcut.

## GitHub Actions setup

Open **Repository → Settings → Secrets and variables → Actions**.

Create this repository variable:

- `VITE_SUPABASE_URL` — the Supabase project URL

Create this repository secret:

- `VITE_SUPABASE_ANON_KEY` — the Supabase anon/public client key

The anon key is compiled into the browser renderer because Supabase uses it as client configuration. Protect data with Supabase authentication and Row Level Security policies; do not treat the anon key as a database administrator credential.

If a server-side Gemini or Supabase CLI workflow is added later, keep these values as secrets and pass them only to the server or CLI step:

- `GEMINI_API_KEY`
- `SUPABASE_ACCESS_TOKEN`

Never put either value in a `VITE_` variable, the renderer, or the Electron preload bridge.

The workflow at `.github/workflows/build-desktop.yml` runs on `windows-latest`, builds the renderer with `BASE_PATH=./`, packages the x64 NSIS installer, and uploads the `.exe` as the `i-Buk-Windows-Installer` artifact. Run it from **Actions → Build Desktop App (Electron) → Run workflow**, or push to `main`/`master`.