import { Routes } from '@angular/router';
import { type NativeFederationResult } from '@angular-architects/native-federation';

import { HomePage } from './home-page';
import { RemoteUnavailableComponent } from './remote-unavailable';

export const appRoutes = (nf: Pick<NativeFederationResult, 'as'>): Routes => {
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
