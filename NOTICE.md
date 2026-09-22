ASI:Work
Copyright 2026 ASI:One

This product includes software developed as part of the goose project
(https://github.com/aaif-goose/goose), licensed under the Apache License,
Version 2.0 (see LICENSE).

This distribution, "ASI:Work", modifies goose as follows:
- Adds a bundled declarative provider for the ASI:One API
  (crates/goose-providers/src/declarative/definitions/asi_one.json and its
  registration in crates/goose-providers/src/declarative.rs)
- Replaces the agent identity in crates/goose/src/prompts/system.md
- Adds first-run provider/model defaults (init-config.yaml)
- Rebrands the desktop app (ui/desktop/package.json, ui/desktop/index.html,
  ui/desktop/forge.config.ts, ui/desktop/forge.deb.desktop,
  ui/desktop/forge.rpm.desktop)
- Bundles ASI:One defaults in the ui/desktop/src/main.ts env-macro block and
  restricts provider pickers to the bundled provider in
  ui/desktop/src/acp/providers.ts
- Points the auto-updater at this fork (ui/desktop/src/app-update.yml and
  ui/desktop/scripts/verify-mac-update-resources.js)

"ASI:Work" and "ASI:One" are not goose marks. This distribution is not
affiliated with, endorsed by, or sponsored by the goose project, the
Agentic AI Foundation, or the Linux Foundation.
