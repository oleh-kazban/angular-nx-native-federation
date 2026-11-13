import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { type NativeFederationResult } from '@angular-architects/native-federation';

import { appRoutes } from './app.routes';

export const appConfig = (nf: NativeFederationResult): ApplicationConfig => ({
  providers: [provideRouter(appRoutes(nf))],
});
