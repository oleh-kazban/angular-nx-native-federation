# ui

Shared Angular UI components for the shell and the remotes, imported as `@client-portal/shared/ui`.

| Component        | Selector             | Purpose                                                                                  |
| ---------------- | -------------------- | ---------------------------------------------------------------------------------------- |
| `Page`           | `ui-page`            | Page frame: eyebrow, heading, intro, an optional `[pageBadge]` slot and the page content |
| `SectionHeading` | `ui-section-heading` | Section heading and description, with optional projected content on the right            |
| `DemoBadge`      | `ui-demo-badge`      | "Demo data" pill                                                                         |

Components ship their own (SCSS, BEM) styles, so they look the same whether a remote runs standalone or inside the shell. The library is listed in `sharedMappings` in every `federation.config.mjs`, so one copy is shared at runtime.

## Running unit tests

Run `pnpm nx test ui` to execute the unit tests.
