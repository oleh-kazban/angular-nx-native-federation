# Setup Guide

This guide rebuilds this repository in a new, empty folder: an Nx monorepo with an Angular shell (`:4200`) that loads two Angular remotes (`dashboard` on `:4201`, `reports` on `:4202`) at runtime through Native Federation, plus two shared libraries and the quality tooling.

Every step says **what** to run, **where** and **why**. Commands and generated output were checked against Nx 24.0.6, Angular 22.2 and `@angular-architects/native-federation` 22.2.5 on Windows (Git Bash) and apply unchanged on macOS and Linux.

For background on how the pieces work at runtime, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Contents

1. [Prerequisites](#1-prerequisites)
2. [Create the workspace](#2-create-the-workspace)
3. [Generate the applications](#3-generate-the-applications)
4. [Generate the shared libraries](#4-generate-the-shared-libraries)
5. [Align the generated configuration](#5-align-the-generated-configuration)
6. [Add Native Federation](#6-add-native-federation)
7. [Configure federation](#7-configure-federation)
8. [Implement the remotes](#8-implement-the-remotes)
9. [Implement the shell](#9-implement-the-shell)
10. [Module boundaries](#10-module-boundaries)
11. [Quality tooling](#11-quality-tooling)
12. [Scripts](#12-scripts)
13. [Run and verify](#13-run-and-verify)
14. [Deploy to GitHub Pages](#14-deploy-to-github-pages)
15. [Final layout](#15-final-layout)

## Versions

The exact versions live in [`package.json`](package.json). The ones that must match each other:

| Package                                 | Version                            | Constraint                                                |
| --------------------------------------- | ---------------------------------- | --------------------------------------------------------- |
| Node.js                                 | `^22.22.3 \|\| ^24.15.0 \|\| >=26` | Required by Angular 22; `.nvmrc` pins `24`                |
| pnpm                                    | `10.30.3`                          | Pinned through `packageManager`                           |
| `nx`, `@nx/*`                           | `24.0.6`                           | All Nx packages on one version                            |
| `@angular/*`                            | `22.2.0`                           | All Angular packages on one version                       |
| `@angular-architects/native-federation` | `22.2.5`                           | Major and minor follow Angular (`22.2.x` ↔ Angular 22.2) |
| `typescript`                            | `6.0.3`                            | Within Angular 22's supported range                       |

## 1. Prerequisites

Install Node.js (a version from the table), Git and pnpm:

```bash
node --version
git --version
npm install --global pnpm
pnpm --version
```

Any recent global pnpm works: the `packageManager` field you add in step 2 makes pnpm switch to `10.30.3` inside the project automatically.

## 2. Create the workspace

### Why not `create-nx-workspace`

In Nx 24, `create-nx-workspace --preset=angular-monorepo` downloads the `nrwl/angular-template` example and ignores the app name, bundler, test runner and other flags; you get a `shop` app, an `api` app, Vitest, Playwright and SSR. `--preset=apps` downloads an empty template that uses pnpm workspaces and TypeScript project references instead of the classic `tsconfig.base.json` path aliases this repo relies on (Native Federation's `sharedMappings` reads those aliases).

Starting from a bare `package.json` and running the Nx generators with explicit flags is deterministic and produces exactly this repo's layout.

### Create the folder

```bash
mkdir angular-nx-native-federation
cd angular-nx-native-federation
git init -b master
```

The repo's default branch is `master`; Nx's `defaultBase` and the CI workflow refer to it.

Create `package.json`:

```json
{
  "name": "@client-portal/source",
  "version": "0.0.0",
  "license": "MIT",
  "private": true,
  "packageManager": "pnpm@10.30.3",
  "engines": {
    "node": "^22.22.3 || ^24.15.0 || >=26.0.0"
  }
}
```

- `@client-portal/source`: the `@client-portal` scope matches the library import paths (`@client-portal/shared/ui`).
- `packageManager`: pins pnpm for everyone, including CI (`pnpm/action-setup` reads it).
- `engines`: the Node range Angular 22 supports.

Create `.nvmrc` with the single line `24`. CI reads it (`node-version-file: .nvmrc`), and `nvm use` picks it up locally.

Create `pnpm-workspace.yaml`. It holds pnpm settings only: this is an integrated workspace with one root `package.json` and one lockfile, so there is no `packages` list.

```yaml
autoInstallPeers: true
# Allowed: esbuild's install script checks it has the right platform binary.
onlyBuiltDependencies:
  - esbuild
  - nx
# Ignored on purpose: these only compile from source when their bundled prebuilt binary is missing.
ignoredBuiltDependencies:
  - '@parcel/watcher'
  - lmdb
  - msgpackr-extract
```

pnpm 10 skips dependency install scripts unless they are listed here.

Create `nx.json` with only the schema; the generators fill it in, and step 5 gives the final version:

```json
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json"
}
```

Create `.gitignore`:

```gitignore
# compiled output
dist
tmp
out-tsc

# dependencies
node_modules

# caches
/coverage
.angular
.nx/cache
.nx/workspace-data
.nx/migrate-runs

# editors and OS
/.idea
.vscode/*
!.vscode/settings.json
!.vscode/extensions.json
.DS_Store
Thumbs.db
```

### Install Nx

```bash
pnpm add -D nx@24.0.6 @nx/angular@24.0.6
```

`@nx/angular` provides the Angular generators and pulls in `@nx/js`, `@nx/eslint`, `@nx/jest` and `@nx/web` when the first generator needs them.

> [!TIP]
> If `pnpm nx g ...` writes all its files but the process never exits (seen on Windows), the Nx daemon is holding it open. Stop it with `pnpm nx daemon --stop` and run generators with the daemon off: `NX_DAEMON=false pnpm nx g ...` (in PowerShell: `$env:NX_DAEMON='false'`).

## 3. Generate the applications

Run from the workspace root:

```bash
pnpm nx g @nx/angular:application apps/shell \
  --prefix=shl --port=4200 --tags=type:app,scope:shell \
  --style=scss --bundler=esbuild --unitTestRunner=jest --e2eTestRunner=none \
  --linter=eslint --ssr=false --zoneless=true --no-interactive

pnpm nx g @nx/angular:application apps/dashboard \
  --prefix=dsh --port=4201 --tags=type:app,scope:dashboard \
  --style=scss --bundler=esbuild --unitTestRunner=jest --e2eTestRunner=none \
  --linter=eslint --ssr=false --zoneless=true --no-interactive

pnpm nx g @nx/angular:application apps/reports \
  --prefix=rpt --port=4202 --tags=type:app,scope:reports \
  --style=scss --bundler=esbuild --unitTestRunner=jest --e2eTestRunner=none \
  --linter=eslint --ssr=false --zoneless=true --no-interactive
```

| Flag                    | Why                                                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `apps/<name>`           | Project directory; the project name is the last segment.                                                                     |
| `--prefix`              | Component selector prefix per app (`shl-`, `dsh-`, `rpt-`), so selectors never collide once remotes render inside the shell. |
| `--port`                | Dev server port. Native Federation's `init` later reads it to fill in the shell's manifest.                                  |
| `--tags`                | `type:*` and `scope:*` tags for the module boundary rules in [step 10](#10-module-boundaries).                               |
| `--bundler=esbuild`     | Angular's application builder (esbuild + Vite). Native Federation wraps this builder.                                        |
| `--unitTestRunner=jest` | Jest with `jest-preset-angular`. The Nx 24 default for Angular is Vitest.                                                    |
| `--e2eTestRunner=none`  | No e2e project.                                                                                                              |
| `--ssr=false`           | Client-side rendering only. Remotes load at runtime and are not prerendered.                                                 |
| `--zoneless=true`       | No `zone.js`; change detection runs on signals.                                                                              |

The first generator also creates the root `tsconfig.base.json`, `eslint.config.mjs`, `jest.config.ts`, `jest.preset.js`, `.prettierrc`, `.prettierignore`, adds the ESLint and Jest plugins to `nx.json`, and installs Angular, ESLint, Jest and Prettier.

Check:

```bash
pnpm nx show projects
```

## 4. Generate the shared libraries

```bash
pnpm nx g @nx/angular:library libs/shared/demo-contracts \
  --importPath=@client-portal/shared/demo-contracts --tags=type:util,scope:shared \
  --unitTestRunner=jest --linter=eslint --no-interactive

pnpm nx g @nx/angular:library libs/shared/ui \
  --importPath=@client-portal/shared/ui --prefix=ui --style=scss --tags=type:ui,scope:shared \
  --unitTestRunner=jest --linter=eslint --no-interactive
```

- `--importPath` adds the alias to `tsconfig.base.json` `paths`. Apps import the library through it, and Native Federation's `sharedMappings` shares it at runtime under the same name.
- `demo-contracts` holds framework-free constants and types (`type:util`). `ui` holds presentational components (`type:ui`).
- Libraries are not buildable or publishable: apps compile them from source, and federation shares them without a registry.

Each generator adds a sample component. Delete `libs/shared/demo-contracts/src/lib/` and `libs/shared/ui/src/lib/ui/`.

`libs/shared/demo-contracts/src/index.ts`:

```typescript
export const DEMO_BRAND = 'Client Portal';
```

The `ui` library provides `Page`, `SectionHeading` and `DemoBadge` (see [its README](libs/shared/ui/README.md)). Copy `libs/shared/ui/src/` from this repository; the components are presentational and their structure does not affect the federation setup. They ship their own styles because a remote's global stylesheet is not loaded when the shell hosts it.

## 5. Align the generated configuration

The generators target a generic workspace. These edits bring the result in line with this repo.

### `tsconfig.base.json`

Without a workspace preset, the generated base is loose (`strict: false`, `target: es2015`). Replace it:

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "rootDir": ".",
    "sourceMap": true,
    "declaration": false,
    "moduleResolution": "bundler",
    "experimentalDecorators": true,
    "importHelpers": true,
    "target": "es2022",
    "module": "esnext",
    "lib": ["es2022", "dom"],
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "@client-portal/shared/ui": ["./libs/shared/ui/src/index.ts"],
      "@client-portal/shared/demo-contracts": ["./libs/shared/demo-contracts/src/index.ts"]
    }
  },
  "exclude": ["node_modules", "tmp"]
}
```

Strict mode and `es2022` now apply everywhere, so remove the options the generator repeated in each project's `tsconfig.json` (`strict`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `target`, `emitDecoratorMetadata`). An app's `tsconfig.json` keeps only:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "isolatedModules": true,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.spec.json" }]
}
```

### Jest: `.cts` → `.cjs`, spec tsconfig

The generators write `jest.config.cts`. Jest compiles TypeScript configs with ts-node, which fails under TypeScript 6. In every app and library, replace `jest.config.cts` with a plain CommonJS `jest.config.cjs` (adjust `displayName`, the preset path and the coverage path per project):

```javascript
// apps/dashboard/jest.config.cjs
module.exports = {
  displayName: 'dashboard',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/apps/dashboard',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
```

Libraries live one level deeper: `preset: '../../../jest.preset.js'`, `coverageDirectory: '../../../coverage/libs/shared/<name>'`. `demo-contracts` has no specs yet, so add `passWithNoTests: true` to its config.

In every `tsconfig.spec.json`, the generator sets `moduleResolution: node10` (TypeScript 6 reports it as deprecated, TS5107) and `target: es2016`. Set both to match the base, and drop `jest.config.ts` from `include`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "module": "commonjs",
    "target": "es2022",
    "types": ["jest", "node"],
    "moduleResolution": "bundler"
  },
  "files": ["src/test-setup.ts"],
  "include": ["src/**/*.test.ts", "src/**/*.spec.ts", "src/**/*.d.ts"]
}
```

Also remove `jest.config.ts` and `jest.config.cts` from the `exclude` list in each `tsconfig.app.json` / `tsconfig.lib.json`.

### `nx.json`

Replace the generated file:

```json
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "defaultBase": "master",
  "analytics": false,
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": [
      "default",
      "!{projectRoot}/eslint.config.mjs",
      "!{projectRoot}/**/?(*.)+(spec|test).[jt]s?(x)?(.snap)",
      "!{projectRoot}/tsconfig.spec.json",
      "!{projectRoot}/jest.config.{cjs,mjs,js,cts,mts,ts}",
      "!{projectRoot}/src/test-setup.[jt]s",
      "!{projectRoot}/test-setup.[jt]s"
    ],
    "sharedGlobals": ["{workspaceRoot}/tsconfig.base.json"]
  },
  "targetDefaults": {
    "build": {
      "cache": true,
      "dependsOn": ["^build"],
      "inputs": ["production", "^production", "{workspaceRoot}/package.json"],
      "outputs": ["{workspaceRoot}/dist/apps/{projectName}"]
    },
    "@angular/build:application": {
      "cache": true,
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"]
    }
  },
  "plugins": [
    { "plugin": "@nx/eslint/plugin", "options": { "targetName": "lint" } },
    { "plugin": "@nx/jest/plugin", "options": { "targetName": "test" } }
  ],
  "generators": {
    "@nx/angular:application": {
      "e2eTestRunner": "none",
      "linter": "eslint",
      "style": "scss",
      "unitTestRunner": "jest"
    },
    "@nx/angular:library": {
      "linter": "eslint",
      "unitTestRunner": "jest"
    },
    "@nx/angular:component": {
      "style": "scss"
    }
  },
  "workspaceLayout": {
    "appsDir": "apps",
    "libsDir": "libs"
  }
}
```

- `defaultBase: master`: `nx affected` compares against `master`.
- `sharedGlobals`: a change to `tsconfig.base.json` invalidates every cached task.
- `production` input: test files and lint config don't invalidate build caches.
- `targetDefaults.build`: caches the Native Federation `build` target (added in step 6) and rebuilds when `package.json` changes, because `fromPackageJson` reads it.
- `generators`: future `nx g` calls default to SCSS, Jest and no e2e.

### Dependencies

The generators add packages this repo does not use. Remove them, and move ESLint to version 10 (every ESLint 9 release is deprecated). `@nx/eslint-plugin` needs `@eslint/js`, which ESLint 10 no longer bundles:

```bash
pnpm remove @angular/forms @angular/platform-browser-dynamic @swc/helpers ts-node jest-util
pnpm add -D eslint@10.14.0 @eslint/js@10.0.1
```

To reproduce the exact versions, copy `dependencies` and `devDependencies` from this repo's `package.json` and run `pnpm install`.

### App components

Each generated app contains a demo page (`nx-welcome.ts`). Delete `apps/<app>/src/app/nx-welcome.ts` in all three apps, and `app.scss` in both remotes (they have no root styles).

## 6. Add Native Federation

Install the adapter that matches the installed Angular version (`pnpm list @angular/core`):

```bash
pnpm add -D @angular-architects/native-federation@22.2.5
```

The adapter's major and minor versions follow Angular's: `22.2.x` for Angular 22.2. Angular 20/21 use the separate `@angular-architects/native-federation-v4` package instead.

Initialize the remotes first, then the shell:

```bash
pnpm nx g @angular-architects/native-federation:init --project=dashboard --port=4201 --type=remote
pnpm nx g @angular-architects/native-federation:init --project=reports --port=4202 --type=remote
pnpm nx g @angular-architects/native-federation:init --project=shell --port=4200 --type=dynamic-host
```

What `init` changes in each project:

1. Creates `federation.config.mjs` and `tsconfig.federation.json`.
2. Moves the Angular `build` target to `esbuild` and the `serve` target to `serve-original`, and adds new `build` and `serve` targets that run `@angular-architects/native-federation:build` on top of them:

   ```text
   build           → @angular-architects/native-federation:build → esbuild
   serve           → @angular-architects/native-federation:build → serve-original
   esbuild         → @angular/build:application
   serve-original  → @angular/build:dev-server (port 4200/4201/4202)
   ```

3. Adds `es-module-shims` to the `polyfills` of the `esbuild` target and to `dependencies`.
4. Moves the old `main.ts` to `bootstrap.ts` and writes a new `main.ts` that calls `initFederation` before importing `./bootstrap`.
5. For `--type=dynamic-host` only: creates `apps/shell/public/federation.manifest.json` with an entry for every other app, using its dev server port:

   ```json
   {
     "dashboard": "http://localhost:4201/remoteEntry.json",
     "reports": "http://localhost:4202/remoteEntry.json"
   }
   ```

   The keys must equal the remotes' federation names. A dynamic host reads remote URLs from this file at runtime, so another environment needs only a different manifest, not a rebuild.

`init` also adds `@softarc/native-federation-orchestrator` to `devDependencies`. The adapter already depends on it, so remove the duplicate pin: `pnpm remove @softarc/native-federation-orchestrator`.

Don't recreate these targets by hand; the schematic sets builder options that are easy to get wrong.

## 7. Configure federation

The generated configs expose the remote's root component, leave `sharedMappings` commented out and share packages with defaults. Replace them.

`apps/dashboard/federation.config.mjs`:

```javascript
import {
  withNativeFederation,
  fromPackageJson,
  mappingsFromWorkspace,
} from '@angular-architects/native-federation/config';

export default withNativeFederation({
  name: 'dashboard',

  exposes: {
    './Routes': './apps/dashboard/src/app/remote-entry/entry.routes.ts',
  },

  shared: fromPackageJson({
    singleton: true,
    strictVersion: true,
    requiredVersion: 'auto',
  })
    .skip(['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'])
    .patch(['@angular/*'], {
      includeSecondaries: {
        keepAll: true,
      },
    }),

  sharedMappings: mappingsFromWorkspace({
    singleton: true,
    strictVersion: true,
  }).only(['@client-portal/shared/demo-contracts', '@client-portal/shared/ui']),

  // Please read our docs about configuring native federation:
  // https://native-federation.com/docs/v4/angular-adapter/configuration/

  features: {
    denseChunking: true,
    denseExternals: true,
    strictImports: false,
  },
});
```

`apps/reports/federation.config.mjs` is identical except `name: 'reports'` and the exposed path `./apps/reports/src/app/remote-entry/entry.routes.ts`. `apps/shell/federation.config.mjs` is identical except `name: 'shell'` and no `exposes` block: the shell consumes routes and exposes nothing.

| Option                                           | Why                                                                                                                                     |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                                           | Must be unique and must equal the remote's key in the shell's manifest.                                                                 |
| `exposes['./Routes']`                            | A remote exposes a route array, not a component, so it owns its own child routes. The shell asks for `'./Routes'` by this exact key.    |
| `fromPackageJson({ singleton, strictVersion })`  | Shares every dependency in `package.json` as one runtime instance, and fails on a version mismatch instead of loading a second Angular. |
| `.skip([...])`                                   | Leaves out RxJS entry points the apps never import.                                                                                     |
| `.patch(['@angular/*'], { includeSecondaries })` | Shares Angular's secondary entry points (`@angular/common/http`, ...) with their packages.                                              |
| `sharedMappings ... .only([...])`                | Shares the two workspace libraries through their `tsconfig.base.json` aliases. Keep the list explicit; don't share every library.       |
| `features`                                       | Kept as generated by `init`.                                                                                                            |

All three configs must share the same packages and mappings, so every app agrees on one copy.

## 8. Implement the remotes

The steps below use `dashboard`; `reports` is the same with its own names (`rpt-` prefix, `ReportsPage`, path `reports`).

### Startup: `main.ts` and `bootstrap.ts`

Replace the generated `apps/dashboard/src/main.ts`. The generated version imports `./bootstrap` even after `initFederation` fails; this one bootstraps only on success, because the app's Angular imports resolve through the import map that `initFederation` builds:

```typescript
import { initFederation } from '@angular-architects/native-federation';

// Bootstrap only once federation is initialised: the app's Angular imports
// resolve through the import map that initFederation sets up.
initFederation(
  {},
  {
    hostRemoteEntry: { url: './remoteEntry.json' },
  },
)
  .then(() => import('./bootstrap'))
  .catch((error) => console.error('Dashboard startup failed:', error));
```

`apps/dashboard/src/bootstrap.ts`:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
```

### Routes

Create the exposed routes, `apps/dashboard/src/app/remote-entry/entry.routes.ts`:

```typescript
import { Routes } from '@angular/router';
import { DashboardPage } from '../features/dashboard/dashboard-page';

export const REMOTE_ROUTES: Routes = [
  {
    path: '',
    component: DashboardPage,
  },
];
```

Replace `apps/dashboard/src/app/app.routes.ts`. Standalone, the remote mounts the same routes under the same path the shell uses, so URLs match in both modes:

```typescript
import { Routes } from '@angular/router';
import { REMOTE_ROUTES } from './remote-entry/entry.routes';

// Standalone, the remote serves its feature under the same path the shell uses.
export const appRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', children: REMOTE_ROUTES },
];
```

### Root component

`apps/dashboard/src/app/app.ts`:

```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'dsh-root',
  templateUrl: './app.html',
})
export class App {}
```

`apps/dashboard/src/app/app.html`:

```html
<router-outlet></router-outlet>
```

`app.config.ts` stays as generated: `provideBrowserGlobalErrorListeners()` and `provideRouter(appRoutes)`.

Set the page title in `apps/dashboard/src/index.html` to `Client Portal · Dashboard`.

### Feature page

`apps/dashboard/src/app/features/dashboard/dashboard-page.ts` renders the page with the shared `ui` components and `DEMO_BRAND`. Its structure:

```typescript
import { Component } from '@angular/core';
import { DemoBadge, Page, SectionHeading } from '@client-portal/shared/ui';
import { DEMO_BRAND } from '@client-portal/shared/demo-contracts';

@Component({
  imports: [Page, SectionHeading, DemoBadge],
  selector: 'dsh-dashboard-page',
  template: `
    <ui-page
      [eyebrow]="brand + ' / Dashboard'"
      heading="Dashboard Remote"
      headingId="dashboard-title"
      intro="A quick look at your platform, delivered by a federated module."
    >
      <ui-demo-badge pageBadge />
      <!-- page content -->
    </ui-page>
  `,
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage {
  protected readonly brand = DEMO_BRAND;
}
```

Copy the full template and `dashboard-page.scss` (and `reports-page.ts` / `reports-page.scss`) from this repository; they are presentation only.

### Tests and styles

Replace the generated `app.spec.ts`, which tests the deleted welcome page:

```typescript
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { appRoutes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(appRoutes)],
    }).compileComponents();
  });

  it('redirects the root to the dashboard feature', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(router.url).toBe('/dashboard');
    expect(compiled.querySelector('h1')?.textContent).toContain('Dashboard Remote');
  });
});
```

The Inter variable font is self-hosted. Install it once:

```bash
pnpm add @fontsource-variable/inter@5.3.0
```

`apps/dashboard/src/styles.scss` loads it for standalone runs (inside the shell, the shell's global styles load it):

```scss
// Self-hosted Inter for standalone runs; inside the shell, the shell's global styles load it.
@use '@fontsource-variable/inter';
```

## 9. Implement the shell

The shell reads the manifest itself and registers each remote **lazily**, on the first navigation to it. Startup fetches no remote code, so a remote that is down never blocks or slows the shell.

### `main.ts`

Replace the generated `apps/shell/src/main.ts`. The generated version passes the manifest path to `initFederation`, which registers every remote at startup:

```typescript
import {
  initFederation,
  type FederationManifest,
  type NativeFederationResult,
} from '@angular-architects/native-federation';

import { resolveManifestUrls } from './manifest-urls';

// The shell reads the manifest itself and registers each remote lazily, on the
// first navigation to it (see app.routes.ts), so startup fetches no remote entries.
// `no-cache` revalidates the manifest on every load, so a changed remote URL takes
// effect at once instead of after the host's cache lifetime (10 min on GitHub Pages).
fetch('federation.manifest.json', { cache: 'no-cache' })
  .then((response) => {
    if (!response.ok) {
      throw new Error(`federation.manifest.json returned ${response.status}`);
    }
    return response.json() as Promise<FederationManifest>;
  })
  .then(resolveManifestUrls)
  .then((manifest) =>
    initFederation(
      {},
      {
        hostRemoteEntry: {
          url: './remoteEntry.json',
        },
      },
    ).then((nf: NativeFederationResult) =>
      import('./bootstrap').then(({ bootstrap }) => bootstrap(nf, manifest)),
    ),
  )
  .catch((error) => {
    console.error('Shell startup failed:', error);
    showStartupError();
  });

// Without a working federation import map Angular itself cannot load, so the
// message is plain DOM (styled by the `startup-error` block in styles.scss).
function showStartupError(): void {
  const root = document.querySelector('shl-root') ?? document.body;
  root.innerHTML = `
    <main class="startup-error" role="alert">
      <h1 class="startup-error__title">Client Portal could not start</h1>
      <p class="startup-error__message">
        The application configuration could not be loaded. Please reload the page in a moment.
      </p>
    </main>
  `;
}
```

`apps/shell/src/manifest-urls.ts` resolves relative manifest entries against the page's base URL, so one manifest works on any origin. It is a separate module so it can be unit-tested; importing `main.ts` would start the fetch.

```typescript
import { type FederationManifest } from '@angular-architects/native-federation';

// Manifest entries may be relative (e.g. `remotes/dashboard/remoteEntry.json`), so
// one manifest works on any origin; resolve them against the page's base URL.
export function resolveManifestUrls(
  manifest: FederationManifest,
  base: string = document.baseURI,
): FederationManifest {
  const resolve = (url: string) => new URL(url, base).href;
  return Object.fromEntries(
    Object.entries(manifest).map(([name, entry]) => [
      name,
      typeof entry === 'string' ? resolve(entry) : { ...entry, url: resolve(entry.url) },
    ]),
  );
}
```

### `bootstrap.ts` and `app.config.ts`

`apps/shell/src/bootstrap.ts` passes the federation runtime and the manifest on to the app config:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import {
  type FederationManifest,
  type NativeFederationResult,
} from '@angular-architects/native-federation';

import { App } from './app/app';
import { appConfig } from './app/app.config';

export const bootstrap = (nf: NativeFederationResult, manifest: FederationManifest) =>
  bootstrapApplication(App, appConfig(nf, manifest));
```

`apps/shell/src/app/app.config.ts` becomes a function and registers a navigation error handler:

```typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withNavigationErrorHandler } from '@angular/router';
import {
  type FederationManifest,
  type NativeFederationResult,
} from '@angular-architects/native-federation';

import { appRoutes } from './app.routes';
import { redirectToRemoteUnavailable } from './remote-navigation-error';

export const appConfig = (
  nf: NativeFederationResult,
  manifest: FederationManifest,
): ApplicationConfig => ({
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes(nf, manifest), withNavigationErrorHandler(redirectToRemoteUnavailable)),
  ],
});
```

`apps/shell/src/app/remote-navigation-error.ts` sends a failed navigation to the fallback page and keeps the attempted URL for **Try again**:

```typescript
import { inject } from '@angular/core';
import { NavigationError, RedirectCommand, Router } from '@angular/router';

/**
 * Router navigation error handler: when a navigation fails (typically because a
 * remote's entry or module could not be loaded), log the error and redirect to
 * the fallback page, passing the attempted URL so the user can retry it.
 */
export const redirectToRemoteUnavailable = (error: NavigationError): RedirectCommand => {
  console.error(`Navigation to ${error.url} failed:`, error.error);

  const router = inject(Router);
  return new RedirectCommand(
    router.createUrlTree(['/remote-unavailable'], { queryParams: { from: error.url } }),
  );
};
```

### Remote registry and routes

`apps/shell/src/app/remotes.ts` is the one list of remotes. Routes, header links and home page cards are generated from it, so adding a remote means one entry here plus its manifest URL:

```typescript
/** The remotes the shell offers. Routes, nav links and home cards are generated from this list. */
export interface ShellRemote {
  /** Remote name in federation.manifest.json; also the route path. */
  name: string;
  label: string;
  description: string;
}

export const REMOTES: readonly ShellRemote[] = [
  {
    name: 'dashboard',
    label: 'Dashboard',
    description: 'Explore a snapshot of platform metrics from the dashboard remote.',
  },
  {
    name: 'reports',
    label: 'Reports',
    description: 'View sample reports provided by the reports remote.',
  },
];
```

`apps/shell/src/app/app.routes.ts`:

```typescript
import { Routes } from '@angular/router';
import {
  type FederationManifest,
  type NativeFederationResult,
} from '@angular-architects/native-federation';

import { HomePage } from './home-page';
import { RemoteUnavailablePage } from './remote-unavailable';
import { REMOTES } from './remotes';

// Page titles follow the standalone remotes: "Client Portal · <page>".
const APP_TITLE = 'Client Portal';

interface RemoteRoutesModule {
  REMOTE_ROUTES: Routes;
}

export const appRoutes = (
  nf: Pick<NativeFederationResult, 'as' | 'initRemoteEntry'>,
  manifest: FederationManifest,
): Routes => {
  const remoteLoader = nf.as<RemoteRoutesModule>();
  const loadRoutes = (remoteName: string) =>
    remoteLoader.loadRemoteModule(remoteName, './Routes').then((remote) => remote.REMOTE_ROUTES);

  // Remotes are registered lazily, on the first navigation to them, so the shell
  // never fetches a remote's entry until it is needed. A failed load is not
  // caught: the router caches only successful lazy loads, so the next navigation
  // registers and loads again, and the navigation error handler shows the
  // fallback page meanwhile. Registering an unreachable remote resolves without
  // registering it, so the load that follows fails with "not initialized".
  const loadRemoteRoutes = (remoteName: string) => async () => {
    const entry = manifest[remoteName];
    if (!entry) {
      throw new Error(`Remote '${remoteName}' is not listed in federation.manifest.json`);
    }
    await (typeof entry === 'string'
      ? nf.initRemoteEntry(entry, remoteName)
      : nf.initRemoteEntry(entry.url, { name: remoteName, integrity: entry.integrity }));
    return loadRoutes(remoteName);
  };

  return [
    {
      path: '',
      component: HomePage,
      pathMatch: 'full',
      title: APP_TITLE,
    },
    ...REMOTES.map((remote) => ({
      path: remote.name,
      title: `${APP_TITLE} · ${remote.label}`,
      loadChildren: loadRemoteRoutes(remote.name),
    })),
    {
      path: 'remote-unavailable',
      component: RemoteUnavailablePage,
      title: `${APP_TITLE} · Application unavailable`,
    },
    {
      path: '**',
      redirectTo: '',
    },
  ];
};
```

- `nf.as<RemoteRoutesModule>()` returns a typed loader; it replaces the deprecated module-level `loadRemoteModule` helper.
- The router applies the deepest route title, so the shell's title also covers the remote's untitled child routes.
- Unknown URLs go to the home page instead of loading a remote.

### Fallback page

`apps/shell/src/app/remote-unavailable.ts`. **Try again** re-navigates to the failed URL; only same-app absolute paths are accepted from the query parameter, so the page cannot redirect off-site:

```typescript
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'shl-remote-unavailable',
  imports: [RouterLink],
  template: `
    <section class="remote-unavailable" aria-labelledby="remote-unavailable-title">
      <h1 id="remote-unavailable-title" class="remote-unavailable__title">
        Remote application unavailable
      </h1>
      <p class="remote-unavailable__message">
        The requested application could not be loaded. It may be temporarily offline.
      </p>
      <div class="remote-unavailable__actions">
        @if (retryUrl) {
          <button type="button" class="remote-unavailable__retry-button" (click)="retry()">
            Try again
          </button>
        }
        <a class="remote-unavailable__home-link" routerLink="/">Back to home</a>
      </div>
    </section>
  `,
  styleUrl: './remote-unavailable.scss',
})
export class RemoteUnavailablePage {
  private readonly router = inject(Router);

  /** In-app URL whose navigation failed; only same-app absolute paths are accepted. */
  protected readonly retryUrl = this.parseRetryUrl(
    inject(ActivatedRoute).snapshot.queryParamMap.get('from'),
  );

  protected retry(): void {
    if (this.retryUrl) {
      void this.router.navigateByUrl(this.retryUrl);
    }
  }

  private parseRetryUrl(from: string | null): string | null {
    return from?.startsWith('/') && !from.startsWith('//') ? from : null;
  }
}
```

### Home page and layout

- `apps/shell/src/app/home-page.ts`: a card per entry in `REMOTES`, each linking to `/<name>`.
- `apps/shell/src/app/app.ts` and `app.html`: header with the brand and one `routerLink` per remote (`@for (remote of remotes; track remote.name)`), and `<main class="shell-content"><router-outlet /></main>`. After each in-app navigation, `App` moves focus to the new page's `h1` so keyboard and screen reader users land on the new page.
- `apps/shell/src/styles.scss`: loads `@fontsource-variable/inter` for the shell and the remotes it hosts, and styles the plain-DOM `.startup-error` message.

Copy these files, their `.scss` files and the shell specs (`app.spec.ts`, `remote-unavailable.spec.ts`, `manifest-urls.spec.ts`) from this repository. Set the title in `apps/shell/src/index.html` to `Client Portal`.

## 10. Module boundaries

The generators already tagged every project (`--tags`). Replace the root `eslint.config.mjs` so `@nx/enforce-module-boundaries` checks those tags:

```javascript
import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          // Type: dependencies only point down the layers (app → feature → ui → util).
          // Scope: an app's code is private to it; only scope:shared crosses apps, so the
          // shell can reach a remote only at runtime through federation.
          depConstraints: [
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: ['type:feature', 'type:ui', 'type:util'],
            },
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: ['type:ui', 'type:util'],
            },
            { sourceTag: 'type:ui', onlyDependOnLibsWithTags: ['type:ui', 'type:util'] },
            { sourceTag: 'type:util', onlyDependOnLibsWithTags: ['type:util'] },
            { sourceTag: 'scope:shell', onlyDependOnLibsWithTags: ['scope:shell', 'scope:shared'] },
            {
              sourceTag: 'scope:dashboard',
              onlyDependOnLibsWithTags: ['scope:dashboard', 'scope:shared'],
            },
            {
              sourceTag: 'scope:reports',
              onlyDependOnLibsWithTags: ['scope:reports', 'scope:shared'],
            },
            { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },
          ],
        },
      ],
    },
  },
];
```

Each project's own `eslint.config.mjs` (generated) adds the Angular rules and enforces its selector prefix. The rules are explained in [ARCHITECTURE.md](ARCHITECTURE.md#module-boundaries).

## 11. Quality tooling

### Prettier

The generator created `.prettierrc` and `.prettierignore`. Set the shared style in `.prettierrc`:

```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

Add `/node_modules` to `.prettierignore` (it already lists `dist`, `coverage`, the Nx caches, `pnpm-lock.yaml` and `.angular`), then format everything once: `pnpm nx format:write --all`.

`eslint-config-prettier` (installed by the generator) turns off ESLint rules that would fight Prettier.

### Madge

Madge finds circular imports between files. Nx module boundaries check imports between projects, not cycles inside them.

```bash
pnpm add -D madge@8.0.0
```

The script (step 12) runs `madge --circular --extensions ts --ts-config tsconfig.base.json apps libs`. `--ts-config` lets Madge follow the `@client-portal/*` aliases across projects.

### Husky and lint-staged

A pre-commit hook formats staged files and lints affected projects, so nothing unformatted or failing lint reaches a commit.

```bash
pnpm add -D husky@9.1.7 lint-staged@17.6.0
pnpm exec husky init
```

`husky init` creates `.husky/pre-commit` and adds `"prepare": "husky"` to `package.json`, so the hook installs itself on every `pnpm install`. Replace the contents of `.husky/pre-commit`:

```bash
pnpm exec lint-staged && pnpm lint:affected
```

Add the lint-staged config to `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx,cjs,mjs,html,scss,css,json,md,yml,yaml}": ["prettier --write"]
  }
}
```

lint-staged runs Prettier only on staged files and re-stages them. Linting runs through `nx affected -t lint` instead of `eslint --fix` in lint-staged: ESLint started from the root sees only the root `eslint.config.mjs` and would skip each project's Angular rules.

## 12. Scripts

Add to `package.json` (`prepare` is already there from `husky init`):

```json
{
  "scripts": {
    "start:all": "nx run-many -t serve -p shell dashboard reports --parallel=3",
    "start:shell": "nx serve shell",
    "start:dashboard": "nx serve dashboard",
    "start:reports": "nx serve reports",
    "build:all": "nx run-many -t build --parallel=3",
    "build:dashboard": "nx build dashboard",
    "build:reports": "nx build reports",
    "build:shell": "nx build shell",
    "test:all": "nx run-many -t test",
    "graph": "nx graph",
    "lint:all": "nx run-many -t lint",
    "lint:affected": "nx affected -t lint",
    "format": "nx format:write --all",
    "format:uncommitted": "nx format:write --uncommitted",
    "format:check": "nx format:check --all",
    "build:gh-pages": "node tools/scripts/build-gh-pages.mjs",
    "check:circular": "madge --circular --extensions ts --ts-config tsconfig.base.json apps libs",
    "check:all": "pnpm format:check && pnpm lint:all && pnpm test:all && pnpm check:circular && pnpm build:all",
    "prepare": "husky"
  }
}
```

Every task goes through Nx, so caching and the project graph apply. `check:all` is the same gate CI runs.

## 13. Run and verify

```bash
pnpm start:all
```

Open http://localhost:4200 and check, with the browser's network tab open:

1. The shell loads `federation.manifest.json` and no `remoteEntry.json` from ports 4201/4202.
2. Opening **Dashboard** fetches `http://localhost:4201/remoteEntry.json` and renders the dashboard inside the shell layout. The same goes for **Reports**.
3. Stop the reports dev server and open **Reports**: the shell shows "Remote application unavailable". Start it again and click **Try again**: the page loads without a reload.
4. http://localhost:4201 and http://localhost:4202 run each remote on its own.

Then run the full gate:

```bash
pnpm check:all
```

It must pass: formatting, lint (including module boundaries), tests, no circular imports, production builds. Each remote's build output in `dist/apps/<remote>/browser/` contains `remoteEntry.json`. The shell build logs `No shared mapping is reachable from the entry points`; this is expected, because the shell imports neither shared library.

Commit. The pre-commit hook runs on the first commit.

## 14. Deploy to GitHub Pages

### Build script

Copy [`tools/scripts/build-gh-pages.mjs`](tools/scripts/build-gh-pages.mjs) from this repository. `pnpm build:gh-pages` runs it and assembles `dist/gh-pages/`:

1. Builds each remote with `--base-href=<BASE_HREF>remotes/<name>/` and the shell with `--base-href=<BASE_HREF>`.
2. Copies the shell to the root and each remote to `remotes/<name>/`.
3. Writes a production `federation.manifest.json` with relative entries (`remotes/dashboard/remoteEntry.json`); the shell resolves them against its base URL.
4. Adds `.nojekyll`, so GitHub Pages serves files starting with `_` (`_angular_*.js`).
5. Copies `index.html` to `404.html`, so deep links like `/dashboard` load the app.

`BASE_HREF` defaults to `/angular-nx-native-federation/`, the repository name. Set it when your repository has another name: `BASE_HREF=/my-repo/ pnpm build:gh-pages`.

### Workflow

Copy [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). It runs a `verify` job (the same checks as `check:all`) on every push and pull request to `master`, and a `deploy` job that publishes `dist/gh-pages` to GitHub Pages only from `master`.

In the GitHub repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.

Optionally copy [`.github/dependabot.yml`](.github/dependabot.yml) for weekly grouped dependency updates.

## 15. Final layout

```text
angular-nx-native-federation/
├── .github/
│   ├── dependabot.yml
│   └── workflows/deploy.yml
├── .husky/pre-commit
├── apps/
│   ├── shell/
│   │   ├── public/federation.manifest.json
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── app.config.ts, app.routes.ts, app.ts, app.html, app.scss
│   │   │   │   ├── home-page.ts, home-page.scss
│   │   │   │   ├── remote-navigation-error.ts
│   │   │   │   ├── remote-unavailable.ts, remote-unavailable.scss
│   │   │   │   └── remotes.ts
│   │   │   ├── bootstrap.ts, main.ts, manifest-urls.ts
│   │   │   ├── index.html, styles.scss, test-setup.ts
│   │   ├── federation.config.mjs
│   │   ├── jest.config.cjs
│   │   ├── project.json
│   │   └── tsconfig.json, tsconfig.app.json, tsconfig.spec.json, tsconfig.federation.json
│   ├── dashboard/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── features/dashboard/dashboard-page.ts, dashboard-page.scss
│   │   │   │   ├── remote-entry/entry.routes.ts
│   │   │   │   └── app.config.ts, app.routes.ts, app.ts, app.html
│   │   │   ├── bootstrap.ts, main.ts
│   │   │   └── index.html, styles.scss, test-setup.ts
│   │   ├── federation.config.mjs
│   │   └── jest.config.cjs, project.json, tsconfig.*.json
│   └── reports/                   same structure as dashboard
├── libs/shared/
│   ├── demo-contracts/src/index.ts
│   └── ui/src/lib/{page,section-heading,demo-badge}/
├── tools/scripts/build-gh-pages.mjs
├── eslint.config.mjs
├── jest.config.ts, jest.preset.js
├── nx.json
├── package.json, pnpm-lock.yaml, pnpm-workspace.yaml
├── .nvmrc, .prettierrc, .prettierignore
└── tsconfig.base.json
```

## References

- [Nx: Angular](https://nx.dev/docs/technologies/angular/introduction), [create-nx-workspace](https://nx.dev/docs/reference/create-nx-workspace), [running tasks](https://nx.dev/docs/features/run-tasks), [affected](https://nx.dev/docs/features/ci-features/affected), [module boundaries](https://nx.dev/docs/features/enforce-module-boundaries)
- [Native Federation for Angular](https://native-federation.com/docs/v4/angular-adapter/): [getting started](https://native-federation.com/docs/v4/angular-adapter/getting-started/), [schematics](https://native-federation.com/docs/v4/angular-adapter/schematics/), [configuration](https://native-federation.com/docs/v4/angular-adapter/configuration/), [runtime](https://native-federation.com/docs/v4/angular-adapter/runtime/)
- [pnpm settings](https://pnpm.io/settings)
- [Husky: get started](https://typicode.github.io/husky/get-started.html), [lint-staged](https://github.com/lint-staged/lint-staged)
- [Madge](https://github.com/pahen/madge)
- [jest-preset-angular](https://thymikee.github.io/jest-preset-angular/)
- [GitHub Pages](https://docs.github.com/en/pages)
