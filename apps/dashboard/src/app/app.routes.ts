import { Routes } from '@angular/router';
import { REMOTE_ROUTES } from './remote-entry/entry.routes';

// Standalone, the remote serves its feature under the same path the shell uses.
export const appRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', children: REMOTE_ROUTES },
];
