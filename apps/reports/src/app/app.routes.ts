import { Routes } from '@angular/router';
import { NxWelcome } from './nx-welcome';
import { REMOTE_ROUTES } from './remote-entry/entry.routes';

export const appRoutes: Routes = [
  { path: '', component: NxWelcome, pathMatch: 'full' },
  { path: 'reports', children: REMOTE_ROUTES },
];
