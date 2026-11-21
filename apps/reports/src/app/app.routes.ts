import { Routes } from '@angular/router';
import { REMOTE_ROUTES } from './remote-entry/entry.routes';

// Standalone, the remote serves its feature under the same path the shell uses.
export const appRoutes: Routes = [
  { path: '', redirectTo: 'reports', pathMatch: 'full' },
  { path: 'reports', children: REMOTE_ROUTES },
];
