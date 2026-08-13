---
name: Artifact preview routing
description: Replit artifact and workflow port alignment constraints for proxied previews
---

The managed workflow’s advertised port must match the artifact service’s `localPort` and environment port for the shared proxy to return the app instead of a 502. A freshly cloned repository may contain artifact manifests without any registered workflow entry; a validated no-op replacement of each manifest can re-register it.

**Why:** The development server can be healthy on its bound port while the artifact route points at a different port, producing a misleading “couldn’t reach this app” preview.

**How to apply:** When cloning or importing an artifact, compare `.replit` workflow `PORT`/`waitForPort` with the artifact service metadata. Keep only the artifact-owned workflow for a service; a legacy workflow on the same port causes the managed workflow to fail with “Port ... is already in use.” If the clone has no registered workflow, make a temporary identical copy of each `artifact.toml` and pass it through the platform’s validated artifact replacement flow, remove the temporary copy, then restart and verify the actual proxied URL.