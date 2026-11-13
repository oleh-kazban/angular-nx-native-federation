# Angular + Nx + Native Federation

## End-to-End Monorepo Setup Guide

A practical guide for bootstrapping a production-oriented Angular monorepo with one Shell application and two independently built Micro Frontends.

**Target architecture**

| Application | Role                     | Local port |
| ----------- | ------------------------ | ---------: |
| `shell`     | Host / Application Shell |       4200 |
| `dashboard` | Dashboard Micro Frontend |       4201 |
| `reports`   | Reports Micro Frontend   |       4202 |

**Technology stack**

| Area                | Technology                              |
| ------------------- | --------------------------------------- |
| Framework           | Angular                                 |
| Language            | TypeScript                              |
| Monorepo            | Nx 24                                   |
| Package manager     | pnpm                                    |
| Bundler             | esbuild                                 |
| Dev server          | Vite through Angular tooling            |
| Federation          | `@angular-architects/native-federation` |
| Runtime             | Native Federation Orchestrator          |
| Linting             | ESLint                                  |
| Formatting          | Prettier                                |
| Dependency analysis | Madge                                   |
| Git hooks           | Husky + lint-staged                     |
| Unit testing        | Vitest                                  |

The guide uses the Angular 22+ Native Federation v4 package naming. The federation adapter must match the installed Angular version.

---

# Part 1. Workspace Foundation

## 1. Prerequisites

Install and verify:

- Node.js LTS compatible with the selected Angular release.
- Git.
- pnpm.
- Visual Studio Code.

```bash
node --version
npm --version
git --version
pnpm --version
```

Install pnpm if necessary:

```bash
npm install --global pnpm
```

## 2. Create the Nx Workspace

Create an integrated Angular workspace:

```bash
pnpm dlx create-nx-workspace@latest client-portal
```

Select the following options in the interactive setup:

| Setting          | Value                         |
| ---------------- | ----------------------------- |
| Stack            | Angular                       |
| Workspace type   | Integrated Monorepo           |
| Application name | shell                         |
| Bundler          | esbuild                       |
| Stylesheet       | SCSS                          |
| Linter           | ESLint                        |
| Unit test runner | Vitest                        |
| Package manager  | pnpm                          |
| SSR              | Disabled for the initial demo |

Enter the workspace:

```bash
cd client-portal
```

Verify:

```bash
pnpm nx --version
pnpm nx show projects
pnpm nx graph
```

Start the initial application:

```bash
pnpm nx serve shell
```

## 3. Configure pnpm

Verify the root `package.json` contains the package manager declaration:

```json
{
  "packageManager": "pnpm@<installed-version>"
}
```

Verify `pnpm-workspace.yaml`:

```yaml
packages:
  - 'apps/*'
  - 'libs/*'
```

Install dependencies:

```bash
pnpm install
```

Commit `pnpm-lock.yaml`.

Use pnpm exclusively throughout the workspace.

---

# Part 2. Create the Applications

## 4. Generate Two Remote Applications

The workspace initially contains the Shell application.

Generate the Dashboard remote:

```bash
pnpm nx g @nx/angular:application apps/dashboard
```

Generate the Reports remote:

```bash
pnpm nx g @nx/angular:application apps/reports
```

Use the generated Angular application defaults and keep both applications standalone.

Verify the projects:

```bash
pnpm nx show projects
```

Expected project structure:

```text
apps/
├── shell/
├── dashboard/
└── reports/
```

Check that each application has its own:

- Angular bootstrap.
- Application configuration.
- Routing configuration.
- Build target.
- Serve target.
- Unit test configuration.

Verify that the applications build independently:

```bash
pnpm nx build shell
pnpm nx build dashboard
pnpm nx build reports
```

At this stage, all three applications are ordinary Angular applications.

We will introduce federation in the next steps.

---

# Part 3. Shared Workspace Libraries

## 5. Create a Shared Library

To demonstrate sharing between independently built applications, create a small workspace library.

```bash
pnpm nx g @nx/angular:library libs/shared/demo-contracts --importPath=@client-portal/shared/demo-contracts
```

Expected location:

```text
libs/
└── shared/
    └── demo-contracts/
        └── src/
            └── index.ts
```

Create a small shared API in `libs/shared/demo-contracts/src/index.ts`:

```typescript
export const DEMO_BRAND = 'Client Portal';

export interface RemoteInfo {
  id: string;
  name: string;
  description: string;
}
```

Verify the import path in the root TypeScript configuration.

Expected alias:

```json
{
  "compilerOptions": {
    "paths": {
      "@client-portal/shared/demo-contracts": ["libs/shared/demo-contracts/src/index.ts"]
    }
  }
}
```

Preserve all existing Nx-generated paths.

The library will be imported by both remotes and will also be registered as a shared workspace mapping in Native Federation.

This demonstrates the difference between:

- Sharing npm dependencies.
- Sharing libraries through Nx workspace TypeScript paths.

---

# Part 4. Install Native Federation

## 6. Install the Angular Adapter

First, inspect the installed Angular version:

```bash
pnpm list @angular/core @angular/cli @nx/angular nx
```

For Angular 22+, install the matching Native Federation adapter.

Example for Angular 22.2.x:

```bash
pnpm add -D @angular-architects/native-federation@~22.2.5
```

For Angular 20/21, use the corresponding `@angular-architects/native-federation-v4` package instead, matching the installed Angular release.

Do not mix adapter package generations or majors.

Verify installation:

```bash
pnpm list @angular-architects/native-federation
```

## 7. Initialize the Remote Applications

Initialize the Dashboard remote:

```bash
pnpm nx g @angular-architects/native-federation:init \
  --project=dashboard \
  --port=4201 \
  --type=remote
```

Initialize the Reports remote:

```bash
pnpm nx g @angular-architects/native-federation:init \
  --project=reports \
  --port=4202 \
  --type=remote
```

The schematic performs several important changes:

1. Creates `federation.config.mjs`.
2. Creates `tsconfig.federation.json`.
3. Adds `es-module-shims`.
4. Renames the original build target to `esbuild`.
5. Renames the original serve target to `serve-original`.
6. Introduces the Native Federation build and serve targets.
7. Splits the Angular bootstrap into `main.ts` and `bootstrap.ts`.

Inspect the generated configuration.

The important target structure should resemble:

```text
dashboard:
  build           -> Native Federation builder
  serve           -> Native Federation builder
  esbuild         -> Angular Application Builder
  serve-original  -> Angular dev-server
```

The same applies to `reports`.

**Important:** Do not manually recreate these targets. Let the official schematic generate them.

## 8. Initialize the Shell as a Dynamic Host

Initialize the Shell after creating and initializing both remotes:

```bash
pnpm nx g @angular-architects/native-federation:init \
  --project=shell \
  --port=4200 \
  --type=dynamic-host
```

We explicitly choose `dynamic-host`.

This creates:

```text
apps/shell/public/federation.manifest.json
```

The manifest is the runtime configuration that tells the Shell where its remotes are located.

Inspect the generated manifest.

Replace its contents with:

```json
{
  "dashboard": "http://localhost:4201/remoteEntry.json",
  "reports": "http://localhost:4202/remoteEntry.json"
}
```

The keys must match the corresponding remote names in their federation configurations.

**Why dynamic host?**

The Shell can load remotes from URLs supplied at runtime.

Changing the manifest does not require rebuilding the Shell.

For example, development and production can use different remote URLs while sharing the same Shell build.

---

# Part 5. Configure Federation

## 9. Configure Shared Dependencies

Native Federation has two different sharing mechanisms:

| Mechanism        | Purpose                                                 |
| ---------------- | ------------------------------------------------------- |
| `shared`         | npm dependencies from package.json                      |
| `sharedMappings` | Workspace libraries referenced through TypeScript paths |

We will configure both.

Use the same baseline sharing configuration in all three applications.

### 9.1 Shared npm dependencies

In each application's `federation.config.mjs`, import:

```javascript
import {
  withNativeFederation,
  fromPackageJson,
  mappingsFromWorkspace,
} from '@angular-architects/native-federation/config';
```

Configure shared dependencies:

```javascript
shared: fromPackageJson({
  singleton: true,
  strictVersion: true,
  requiredVersion: 'auto',
}).skip([
  'rxjs/ajax',
  'rxjs/fetch',
  'rxjs/testing',
  'rxjs/webSocket',
]).patch(['@angular/*'], {
  includeSecondaries: {
    keepAll: true,
  },
}),
```

This configuration:

- Shares dependencies declared in package.json.
- Enforces singleton instances.
- Checks version compatibility.
- Keeps Angular secondary entry points together.
- Excludes unnecessary RxJS entry points.

### 9.2 Shared workspace libraries

Add:

```javascript
sharedMappings: mappingsFromWorkspace({
  singleton: true,
  strictVersion: true,
}).only([
  '@client-portal/shared/demo-contracts',
]),
```

This explicitly shares our demo library between the Shell and both remotes.

Do not automatically share every workspace library without a reason. Keep the shared runtime surface intentional.

## 10. Configure the Shell

File:

```text
apps/shell/federation.config.mjs
```

Complete example:

```javascript
import {
  withNativeFederation,
  fromPackageJson,
  mappingsFromWorkspace,
} from '@angular-architects/native-federation/config';

export default withNativeFederation({
  name: 'shell',

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
  }).only(['@client-portal/shared/demo-contracts']),
});
```

The Shell does not expose application routes in this demo.

It consumes the routes exposed by the remote applications.

## 11. Configure the Dashboard Remote

File:

```text
apps/dashboard/federation.config.mjs
```

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
  }).only(['@client-portal/shared/demo-contracts']),
});
```

## 12. Configure the Reports Remote

File:

```text
apps/reports/federation.config.mjs
```

Use the same shared dependency configuration, but change the remote name and exposed route:

```javascript
import {
  withNativeFederation,
  fromPackageJson,
  mappingsFromWorkspace,
} from '@angular-architects/native-federation/config';

export default withNativeFederation({
  name: 'reports',

  exposes: {
    './Routes': './apps/reports/src/app/remote-entry/entry.routes.ts',
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
  }).only(['@client-portal/shared/demo-contracts']),
});
```

**Configuration rules:**

- Federation names must be unique.
- Manifest keys must match federation names.
- Exposed module paths must exist.
- Shared dependency configuration should be consistent across participating applications.
- Do not expose internal implementation details unnecessarily.

---

# Part 6. Implement the Remote Applications

## 13. Dashboard Remote

Create the following structure:

```text
apps/dashboard/src/app/
├── remote-entry/
│   └── entry.routes.ts
├── features/
│   └── dashboard/
│       └── dashboard-page.ts
├── app.routes.ts
└── app.ts
```

### 13.1 Create the Dashboard Page

File:

`apps/dashboard/src/app/features/dashboard/dashboard-page.ts`

```typescript
import { Component } from '@angular/core';
import { DEMO_BRAND } from '@client-portal/shared/demo-contracts';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  template: `
    <section>
      <h1>Dashboard Remote</h1>

      <p>Loaded dynamically by the Shell.</p>

      <p>Platform: {{ brand }}</p>

      <div class="dashboard-grid">
        <article>
          <h2>Active users</h2>
          <strong>1,284</strong>
        </article>

        <article>
          <h2>Requests</h2>
          <strong>24,590</strong>
        </article>

        <article>
          <h2>Availability</h2>
          <strong>99.9%</strong>
        </article>
      </div>
    </section>
  `,
})
export class DashboardPage {
  protected readonly brand = DEMO_BRAND;
}
```

### 13.2 Expose the Routes

File:

`apps/dashboard/src/app/remote-entry/entry.routes.ts`

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

### 13.3 Configure Local Remote Routing

File:

`apps/dashboard/src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { REMOTE_ROUTES } from './remote-entry/entry.routes';

export const appRoutes: Routes = REMOTE_ROUTES;
```

The remote can now run independently and also expose its routes to the Shell.

Ensure its root application component contains a router outlet.

---

## 14. Reports Remote

Create:

```text
apps/reports/src/app/
├── remote-entry/
│   └── entry.routes.ts
├── features/
│   └── reports/
│       └── reports-page.ts
├── app.routes.ts
└── app.ts
```

### 14.1 Create the Reports Page

File:

`apps/reports/src/app/features/reports/reports-page.ts`

```typescript
import { Component } from '@angular/core';
import { DEMO_BRAND } from '@client-portal/shared/demo-contracts';

@Component({
  selector: 'app-remote-reports-page',
  standalone: true,
  template: `
    <section>
      <h1>Reports Remote</h1>

      <p>This application is loaded independently.</p>

      <p>Platform: {{ brand }}</p>

      <table>
        <thead>
          <tr>
            <th>Report</th>
            <th>Status</th>
            <th>Updated</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Monthly overview</td>
            <td>Ready</td>
            <td>Today</td>
          </tr>

          <tr>
            <td>Performance report</td>
            <td>Processing</td>
            <td>Today</td>
          </tr>

          <tr>
            <td>Annual summary</td>
            <td>Ready</td>
            <td>Yesterday</td>
          </tr>
        </tbody>
      </table>
    </section>
  `,
})
export class ReportsPage {
  protected readonly brand = DEMO_BRAND;
}
```

### 14.2 Expose the Routes

File:

`apps/reports/src/app/remote-entry/entry.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { ReportsPage } from '../features/reports/reports-page';

export const REMOTE_ROUTES: Routes = [
  {
    path: '',
    component: ReportsPage,
  },
];
```

### 14.3 Configure Local Routing

File:

`apps/reports/src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { REMOTE_ROUTES } from './remote-entry/entry.routes';

export const appRoutes: Routes = REMOTE_ROUTES;
```

Both remote applications should now have independent functionality.

---

# Part 7. Implement the Shell

## 15. Create a Remote Loader Contract

The Shell should consume remote routes through Native Federation.

Use the `NativeFederationResult` returned by `initFederation`.

We will pass it into Angular's dependency injection and use its typed loader.

This avoids relying on the deprecated module-scoped `loadRemoteModule` helper.

## 16. Update Shell Bootstrap

The Native Federation schematic creates:

```text
apps/shell/src/main.ts
apps/shell/src/bootstrap.ts
```

Replace the Shell's generated `main.ts` with:

```typescript
import { initFederation, type NativeFederationResult } from '@angular-architects/native-federation';

initFederation('federation.manifest.json', {
  hostRemoteEntry: {
    url: './remoteEntry.json',
  },
})
  .then((nf: NativeFederationResult) =>
    import('./bootstrap').then(({ bootstrap }) => bootstrap(nf)),
  )
  .catch((error) => {
    console.error('Native Federation initialization failed:', error);
  });
```

This ensures federation is initialized before Angular bootstraps.

The manifest is loaded at runtime.

## 17. Update Shell Bootstrap Function

File:

`apps/shell/src/bootstrap.ts`

Preserve the generated Angular bootstrap and its existing providers.

The important change is passing the federation runtime to the application configuration:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { type NativeFederationResult } from '@angular-architects/native-federation';

import { App } from './app/app';
import { appConfig } from './app/app.config';

export const bootstrap = (nf: NativeFederationResult) => bootstrapApplication(App, appConfig(nf));
```

If the generated root component is named `AppComponent` or has a different filename, use its actual generated name.

## 18. Configure Shell Application Providers

File:

`apps/shell/src/app/app.config.ts`

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { type NativeFederationResult } from '@angular-architects/native-federation';

import { appRoutes } from './app.routes';

export const appConfig = (nf: NativeFederationResult): ApplicationConfig => ({
  providers: [provideRouter(appRoutes(nf))],
});
```

Merge this with any existing application providers rather than removing them.

## 19. Configure Shell Routes

Create a fallback component:

`apps/shell/src/app/remote-unavailable.ts`

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-remote-unavailable',
  standalone: true,
  template: `
    <section>
      <h2>Remote application unavailable</h2>
      <p>The requested application could not be loaded.</p>
      <p>Please try again later.</p>
    </section>
  `,
})
export class RemoteUnavailableComponent {}
```

File:

`apps/shell/src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { type NativeFederationResult } from '@angular-architects/native-federation';

import { RemoteUnavailableComponent } from './remote-unavailable';

export const appRoutes = (nf: NativeFederationResult): Routes => {
  const dashboardLoader = nf.as<{
    REMOTE_ROUTES: Routes;
  }>();

  const reportsLoader = nf.as<{
    REMOTE_ROUTES: Routes;
  }>();

  return [
    {
      path: '',
      component: HomePage,
      pathMatch: 'full',
    },
    {
      path: 'dashboard',
      loadChildren: () =>
        dashboardLoader
          .loadRemoteModule('dashboard', './Routes')
          .then((remote) => remote.REMOTE_ROUTES)
          .catch((error) => {
            console.error('Dashboard remote failed to load:', error);

            return [
              {
                path: '',
                component: RemoteUnavailableComponent,
              },
            ];
          }),
    },
    {
      path: 'reports',
      loadChildren: () =>
        reportsLoader
          .loadRemoteModule('reports', './Routes')
          .then((remote) => remote.REMOTE_ROUTES)
          .catch((error) => {
            console.error('Reports remote failed to load:', error);

            return [
              {
                path: '',
                component: RemoteUnavailableComponent,
              },
            ];
          }),
    },
    {
      path: '**',
      redirectTo: 'dashboard',
    },
  ];
};
```

The fallback handles route-level loading failures. It does not replace the need to validate remote availability during federation initialization.

## 20. Create the Shell Navigation

The root Shell component should provide the shared layout and router outlet.

Example template:

```html
<header class="shell-header">
  <div class="brand">Client Portal</div>

  <nav>
    <a routerLink="/dashboard">Dashboard</a>
    <a routerLink="/reports">Reports</a>
  </nav>
</header>

<main class="shell-content">
  <router-outlet />
</main>
```

Make sure the standalone root component imports:

```typescript
import { RouterLink, RouterOutlet } from '@angular/router';
```

And declares them in its component metadata:

```typescript
imports: [RouterLink, RouterOutlet];
```

The Shell owns navigation and layout.

The remotes own their respective domain features.

---

# Part 8. Verify Federation Configuration

## 21. Check the Runtime Manifest

File:

`apps/shell/public/federation.manifest.json`

Expected contents:

```json
{
  "dashboard": "http://localhost:4201/remoteEntry.json",
  "reports": "http://localhost:4202/remoteEntry.json"
}
```

Verify that:

- Both remote URLs are correct.
- Remote names match `federation.config.mjs`.
- The manifest is located in the Shell's public assets.
- The file is included in the Shell's generated build output.

## 22. Check the Exposed Modules

Dashboard:

```text
dashboard
  └── ./Routes
      └── entry.routes.ts
```

Reports:

```text
reports
  └── ./Routes
      └── entry.routes.ts
```

The exposed key must match the key used by the Shell:

```typescript
loadRemoteModule('dashboard', './Routes');
```

The remote name must also match the manifest key.

## 23. Check Shared Dependencies

All three applications should have matching federation sharing configuration.

Verify:

- `@angular/core` is shared as a singleton.
- Angular secondary entry points are included.
- Strict version checking is enabled.
- The workspace library is included in `sharedMappings`.
- The workspace library alias is identical in every application.

---

# Part 9. Run the Complete Demo

## 24. Start All Applications

You can start all three applications simultaneously using the parallel workspace task:

```bash
pnpm start:all
```

Alternatively, open three separate terminals:

**Terminal 1 — Dashboard:**

```bash
pnpm nx serve dashboard
```

**Terminal 2 — Reports:**

```bash
pnpm nx serve reports
```

**Terminal 3 — Shell:**

```bash
pnpm nx serve shell
```

Open:

```text
http://localhost:4200
```

Expected behavior:

1. Shell initializes Native Federation.
2. Shell reads `federation.manifest.json`.
3. Native Federation resolves the remote entries and shared dependencies.
4. Angular bootstraps the Shell.
5. Navigation to Dashboard loads the Dashboard remote.
6. Navigation to Reports loads the Reports remote.
7. Both remotes render inside the Shell's router outlet.

You can also access the remote applications independently:

```text
http://localhost:4201
http://localhost:4202
```

This confirms that each remote remains a runnable Angular application in its own right.

---

# Part 10. Production Builds

## 25. Build Applications Independently

Build all applications together:

```bash
pnpm build:all
```

Or build each application independently:

Build Dashboard:

```bash
pnpm nx build dashboard --configuration=production
```

Build Reports:

```bash
pnpm nx build reports --configuration=production
```

Build Shell:

```bash
pnpm nx build shell --configuration=production
```

Inspect the generated output.

The expected structure is approximately:

```text
dist/
└── apps/
    ├── shell/
    │   └── browser/
    ├── dashboard/
    │   └── browser/
    │       ├── remoteEntry.json
    │       └── ...
    └── reports/
        └── browser/
            ├── remoteEntry.json
            └── ...
```

The exact output directory depends on the generated Angular `outputPath` configuration.

Each remote must produce its own `remoteEntry.json`.

The Shell must produce its own application build and runtime manifest.

## 26. Understand the Deployment Model

Each application is independently buildable.

The expected deployment arrangement:

```text
Production Environment

https://portal.example.com/
    └── Shell

https://dashboard.example.com/
    └── Dashboard Remote
        └── remoteEntry.json

https://reports.example.com/
    └── Reports Remote
        └── remoteEntry.json
```

The Shell manifest would then contain:

```json
{
  "dashboard": "https://dashboard.example.com/remoteEntry.json",
  "reports": "https://reports.example.com/remoteEntry.json"
}
```

This demonstrates independent remote deployment and runtime URL configuration.

### 26.1 Single-Origin / GitHub Pages Subpath Deployment

When deploying all applications to a single origin (such as GitHub Pages or a reverse proxy subpath):

```text
GitHub Pages Environment

https://oleh-kazban.github.io/angular-nx-native-federation/
    ├── Shell (Root Base Href)
    ├── federation.manifest.json
    ├── .nojekyll
    ├── 404.html (SPA Fallback)
    └── remotes/
        ├── dashboard/
        │   └── remoteEntry.json
        └── reports/
            └── remoteEntry.json
```

The production manifest maps the remote URLs accordingly:

```json
{
  "dashboard": "https://oleh-kazban.github.io/angular-nx-native-federation/remotes/dashboard/remoteEntry.json",
  "reports": "https://oleh-kazban.github.io/angular-nx-native-federation/remotes/reports/remoteEntry.json"
}
```

Critical GitHub Pages deployment invariants:

- `.nojekyll`: Disables Jekyll processing so files starting with underscores (e.g. `_angular_*.js`) are served instead of returning 404.
- `404.html`: A duplicate of `index.html` allowing Angular's client-side router to handle deep links and browser refreshes on routes like `/dashboard` and `/reports`.

For a real production deployment, also configure:

- CORS for cross-origin remote assets.
- Correct asset base paths.
- SPA fallback routing.
- Cache policies for remote entries and hashed assets.
- HTTPS.
- Version compatibility between shared dependencies.

The development federation server handles the local federation artifacts and cross-origin development requests. Production hosting must provide the corresponding behavior.

---

# Part 11. Nx Integration and Quality Gates

## 27. Verify the Nx Project Graph

```bash
pnpm nx show projects
pnpm nx graph
```

Inspect the application and library dependencies.

The graph should contain:

- Shell.
- Dashboard remote.
- Reports remote.
- Shared contracts library.

Remember that Nx project dependencies and runtime federation relationships are different architectural concepts.

## 28. Verify Builds and Tests

```bash
pnpm nx run-many -t build
pnpm nx run-many -t test
pnpm nx run-many -t lint
```

Check formatting:

```bash
pnpm nx format:check
```

Check circular dependencies:

```bash
pnpm check:circular
```

## 29. Test Affected Execution

```bash
pnpm nx affected -t lint test build
```

Configure the appropriate base branch and Git comparison range in CI.

Nx should be responsible for deciding which projects are affected by a change.

## 30. Git Hooks

Ensure Husky and lint-staged are configured at the workspace root.

Example `package.json` configuration:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix"],
    "*.{html,scss,css,json,md,yml,yaml}": ["prettier --write"]
  }
}
```

Example `.husky/pre-commit`:

```bash
pnpm exec lint-staged
```

Run a test commit:

```bash
git add .
git commit -m "feat: add native federation demo"
```

---

# Part 12. Final Architecture

The completed workspace should resemble:

```text
client-portal/
│
├── apps/
│   │
│   ├── shell/
│   │   ├── public/
│   │   │   └── federation.manifest.json
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── app.config.ts
│   │   │   │   ├── app.routes.ts
│   │   │   │   ├── app.ts
│   │   │   │   └── remote-unavailable.ts
│   │   │   ├── main.ts
│   │   │   └── bootstrap.ts
│   │   └── federation.config.mjs
│   │
│   ├── dashboard/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── features/
│   │   │   │   │   └── dashboard/
│   │   │   │   ├── remote-entry/
│   │   │   │   │   └── entry.routes.ts
│   │   │   │   └── app.routes.ts
│   │   │   ├── main.ts
│   │   │   └── bootstrap.ts
│   │   ├── federation.config.mjs
│   │   └── tsconfig.federation.json
│   │
│   └── reports/
│       ├── src/
│       │   ├── app/
│       │   │   ├── features/
│       │   │   │   └── reports/
│       │   │   ├── remote-entry/
│       │   │   │   └── entry.routes.ts
│       │   │   └── app.routes.ts
│       │   ├── main.ts
│       │   └── bootstrap.ts
│       ├── federation.config.mjs
│       └── tsconfig.federation.json
│
├── libs/
│   └── shared/
│       └── demo-contracts/
│
├── tools/
│
├── .husky/
├── nx.json
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── eslint.config.mjs
```

---

# Part 13. Acceptance Criteria

The demo is complete when all of the following conditions are satisfied.

### Workspace

- [ ] Nx integrated workspace.
- [ ] pnpm lockfile.
- [ ] Angular applications generated through Nx.
- [ ] TypeScript strict mode.
- [ ] ESLint and Prettier.
- [ ] Husky and lint-staged.
- [ ] Madge circular dependency check.
- [ ] Nx project graph.

### Federation

- [ ] Shell configured as a dynamic host.
- [ ] Dashboard configured as a remote.
- [ ] Reports configured as a remote.
- [ ] Each application has its own `federation.config.mjs`.
- [ ] Shell has a runtime federation manifest.
- [ ] Each remote exposes `./Routes`.
- [ ] Shell loads remote routes lazily.
- [ ] Shared npm dependencies configured.
- [ ] Angular singleton and version constraints configured.
- [ ] Shared workspace library configured through `sharedMappings`.

### Runtime

- [ ] Shell starts successfully.
- [ ] Dashboard loads inside Shell.
- [ ] Reports loads inside Shell.
- [ ] Both remotes work independently.
- [ ] Browser network requests show remote entry loading.
- [ ] Route-level remote loading errors have a fallback.

### Production

- [ ] Shell builds independently.
- [ ] Dashboard builds independently.
- [ ] Reports builds independently.
- [ ] Each remote produces `remoteEntry.json`.
- [ ] Shell manifest can be changed without rebuilding Shell.
- [ ] Production hosting requirements are documented.

---

# Official Documentation

- Nx: https://nx.dev/docs
- Nx Angular: https://nx.dev/docs/technologies/angular/introduction
- Nx migration from Module Federation: https://nx.dev/docs/kb/migrate-angular-module-federation
- Native Federation Angular Adapter: https://native-federation.com/docs/v4/angular-adapter/
- Native Federation Getting Started: https://native-federation.com/docs/v4/angular-adapter/getting-started/
- Native Federation Builder: https://native-federation.com/docs/v4/angular-adapter/builder/
- Native Federation Schematics: https://native-federation.com/docs/v4/angular-adapter/schematics/
- Native Federation Runtime: https://native-federation.com/docs/v4/angular-adapter/runtime/
- Native Federation Tutorial: https://native-federation.com/docs/v4/tutorial/

**Architectural objective:** Establish a working reference implementation of an Angular microfrontend platform, with Nx handling monorepo orchestration and Native Federation handling runtime composition. The demo should validate the integration before introducing production-specific concerns such as authentication, deployment pipelines, remote versioning and cross-application communication.
