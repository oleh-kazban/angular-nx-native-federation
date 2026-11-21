# Project Rules & Tech Stack

This repository is an enterprise microfrontend reference architecture demonstrating browser-native Module Federation (`@angular-architects/native-federation` + ESM + Import Maps) powered by Angular's esbuild/Vite application builder inside an Nx monorepo.

## Stack

- **Frontend:** Angular 22 (Zoneless, Standalone, Signals, RxJS 7.8), TypeScript 6 (strict mode), SCSS / CSS
- **Micro Frontends & Bundling:** `@angular-architects/native-federation` 22 (v4 orchestrator, `es-module-shims`), `@angular/build:application` (esbuild + Vite)
- **Workspace Topology:** Nx 24 integrated monorepo (`apps/`: `shell` dynamic host on `:4200`, `dashboard` remote on `:4201`, `reports` remote on `:4202`; `libs/shared/`: `demo-contracts` shared via `sharedMappings`, `ui`)
- **Testing:** Jest 30 (`@nx/jest`, `jest-preset-angular`) for apps and libs
- **Tooling:** pnpm 10, Nx, ESLint 10 (flat config + `angular-eslint` + `@nx/enforce-module-boundaries`), Prettier 3, Husky 9, lint-staged, Madge 8

## Non-Negotiable Rules

1. Never bypass Git hooks (`--no-verify` is strictly forbidden). Pre-commit enforces `lint-staged` and `pnpm lint:affected`.
2. Always use `pnpm` as the package manager (never `npm` or `yarn`) and execute workspace tasks through Nx (`pnpm nx ...` or root `package.json` scripts).
3. Before finishing any architectural or module change, verify zero circular dependencies with `pnpm check:circular` (or run the full verification gate `pnpm check:all`).
4. All multi-step features must follow the agent handoff pipeline in `.ai/tasks/<task-id>/` (see [Agent Handoff Pipeline](#agent-handoff-pipeline)).
5. Preserve Native Federation invariants: keep `@angular/*` configured as strict singletons, share internal workspace contracts through `sharedMappings` (e.g., `@client-portal/shared/demo-contracts`), keep every remote runnable standalone, and preserve fault-boundary fallbacks in `shell` for remote loading failures.

## Agent Handoff Pipeline

Every multi-step feature or fix gets a folder `.ai/tasks/<task-id>/`, where `<task-id>` is a short kebab-case slug (for example `route-titles`). The folder is local working state (git-ignored) that lets any agent or a later session pick the task up. It holds three files:

- `plan.md`: the goal, acceptance criteria, the steps, and the files or projects each step touches. Written before any code is changed; updated when the plan changes.
- `progress.md`: one entry per step with its status (`todo`, `in progress`, `awaiting approval`, `done`), what changed, how it was verified (commands and their results) and the commit hash.
- `handoff.md`: the current state for whoever continues: what is done, what comes next, open questions and anything not yet verified. Rewritten, not appended, whenever work stops.

Read all three before resuming a task. Update `progress.md` after every step and `handoff.md` before stopping. A step is `done` only after its verification passed and, when the user reviews changes, after they approved the commit.

---

# Angular & TypeScript Best Practices

You are an expert in TypeScript, Angular, and scalable microfrontend web application development. Write functional, maintainable, performant, and accessible code following modern Angular (v22+) and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking (`strict: true` in `tsconfig.base.json`).
- Prefer type inference when the type is obvious.
- Avoid the `any` type; use `unknown` when the type is uncertain.

## Angular Best Practices

- Always use standalone components over `NgModules`.
- Do NOT set `standalone: true` inside Angular decorators — it is the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly — `OnPush` is the default in Angular v22+.
- Use signals for state management; reserve RxJS for asynchronous event streams and interop where appropriate.
- Implement lazy loading for feature routes and remote federation entries.
- Do NOT use `@HostBinding` or `@HostListener` decorators; put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead.
- Use `NgOptimizedImage` for static images (note: `NgOptimizedImage` does not work for inline base64 images).

## Accessibility Requirements

- Must pass all AXE checks.
- Must follow WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

## Components

- Keep components small and focused on a single responsibility.
- Use `input()` and `output()` functions instead of `@Input()` / `@Output()` decorators.
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`.
- Use `computed()` for derived state and `linkedSignal()` for state derived from reactive sources that must stay synchronized.
- Prefer inline templates for small components; when using external templates/styles, use paths relative to the component `.ts` file.
- Prefer Signal Forms (`@angular/forms/signals`) for new forms (stable in Angular v22+); otherwise prefer Reactive Forms over Template-driven Forms.
- Do NOT use `ngClass` or `ngStyle`; use `[class]` and `[style]` bindings instead.
- Do NOT import `CommonModule`; import only the specific directives and pipes the template uses (e.g., `AsyncPipe`, `DatePipe`).

## State Management

- Use signals for local component state and `computed()` for derived state.
- Keep state transformations pure and predictable.
- Do NOT use `mutate` on signals; use `update` or `set` instead.

## Templates

- Keep templates simple and avoid complex logic.
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`.
- Use the `async` pipe to handle observables.
- Do not assume globals like `new Date()` are available in templates.

## Services & Dependency Injection

- Design services around a single responsibility.
- Use `providedIn: 'root'` for singleton services; prefer the `@Service` decorator over `@Injectable({ providedIn: 'root' })` for new singleton services (Angular v22+).
- Use the `inject()` function instead of constructor injection.

---

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
