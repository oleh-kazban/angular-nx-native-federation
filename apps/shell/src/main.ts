import {
  initFederation,
  type FederationManifest,
  type NativeFederationResult,
} from '@angular-architects/native-federation';

// The shell reads the manifest itself and registers each remote lazily, on the
// first navigation to it (see app.routes.ts), so startup fetches no remote entries.
fetch('federation.manifest.json')
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

// Manifest entries may be relative (e.g. `remotes/dashboard/remoteEntry.json`), so
// one manifest works on any origin; resolve them against the page's base URL.
function resolveManifestUrls(manifest: FederationManifest): FederationManifest {
  const resolve = (url: string) => new URL(url, document.baseURI).href;
  return Object.fromEntries(
    Object.entries(manifest).map(([name, entry]) => [
      name,
      typeof entry === 'string' ? resolve(entry) : { ...entry, url: resolve(entry.url) },
    ]),
  );
}

// Without a working federation import map Angular itself cannot load, so the
// message is plain DOM (styled by the `startup-error` block in styles.scss).
function showStartupError(): void {
  const root = document.querySelector('app-root') ?? document.body;
  root.innerHTML = `
    <main class="startup-error" role="alert">
      <h1 class="startup-error__title">Client Portal could not start</h1>
      <p class="startup-error__message">
        The application configuration could not be loaded. Please reload the page in a moment.
      </p>
    </main>
  `;
}
