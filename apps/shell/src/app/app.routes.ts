import { Routes } from '@angular/router';
import {
  type FederationManifest,
  type NativeFederationResult,
} from '@angular-architects/native-federation';

import { HomePage } from './home-page';
import { RemoteUnavailableComponent } from './remote-unavailable';

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
    },
    {
      path: 'dashboard',
      loadChildren: loadRemoteRoutes('dashboard'),
    },
    {
      path: 'reports',
      loadChildren: loadRemoteRoutes('reports'),
    },
    {
      path: 'remote-unavailable',
      component: RemoteUnavailableComponent,
    },
    {
      path: '**',
      redirectTo: 'dashboard',
    },
  ];
};
