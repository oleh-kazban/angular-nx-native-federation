import { Routes } from '@angular/router';
import { type NativeFederationResult } from '@angular-architects/native-federation';

import { HomePage } from './home-page';
import { RemoteUnavailableComponent } from './remote-unavailable';

interface RemoteRoutesModule {
  REMOTE_ROUTES: Routes;
}

export const appRoutes = (nf: Pick<NativeFederationResult, 'as'>): Routes => {
  const remoteLoader = nf.as<RemoteRoutesModule>();

  // A rejected load is deliberately not caught here: the router only caches
  // successful lazy loads, so letting it fail means the next navigation retries
  // the remote. The navigation error handler shows the fallback page instead.
  const loadRemoteRoutes = (remoteName: string) => () =>
    remoteLoader.loadRemoteModule(remoteName, './Routes').then((remote) => remote.REMOTE_ROUTES);

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
