---
name: Portable npm lockfiles
description: External CI portability constraints for npm lockfiles generated inside Replit.
---

npm lockfiles generated or refreshed inside Replit may contain tarball URLs on the private
`package-firewall.replit.local` host. External CI runners cannot resolve that hostname even
when the package versions and integrity hashes are valid.

**Why:** The Windows GitHub Actions runner failed during `npm ci` before Electron packaging;
the workspace pnpm install and frontend build had already succeeded.

**How to apply:** For a desktop package whose lockfile contains those URLs, normalize the
resolved host to `https://registry.npmjs.org/` in the external CI workflow immediately before
`npm ci`, and pass the public registry explicitly. Keep the package versions and integrity
hashes unchanged.