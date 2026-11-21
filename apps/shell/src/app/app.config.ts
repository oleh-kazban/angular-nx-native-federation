import { ApplicationConfig } from '@angular/core';
import { provideRouter, withNavigationErrorHandler } from '@angular/router';
import { type NativeFederationResult } from '@angular-architects/native-federation';

import { appRoutes } from './app.routes';
import { redirectToRemoteUnavailable } from './remote-navigation-error';

export const appConfig = (nf: NativeFederationResult): ApplicationConfig => ({
  providers: [
    provideRouter(appRoutes(nf), withNavigationErrorHandler(redirectToRemoteUnavailable)),
  ],
});
