---
name: Artifact preview routing
description: Replit artifact and workflow port alignment constraints for proxied previews
---

The managed workflow’s advertised port must match the artifact service’s `localPort` and environment port for the shared proxy to return the app instead of a 502.

**Why:** The development server can be healthy on its bound port while the artifact route points at a different port, producing a misleading “couldn’t reach this app” preview.

**How to apply:** When cloning or importing an artifact, compare `.replit` workflow `PORT`/`waitForPort` with the artifact service metadata. Update `.replit` only through the platform’s validated replacement flow, then restart and verify the actual proxied URL.