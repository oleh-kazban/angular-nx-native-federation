import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withNavigationErrorHandler } from '@angular/router';
import {
  type FederationManifest,
  type NativeFederationResult,
} from '@angular-architects/native-federation';

import { appRoutes } from './app.routes';
import { redirectToRemoteUnavailable } from './remote-navigation-error';

export const appConfig = (
  nf: NativeFederationResult,
  manifest: FederationManifest,
): ApplicationConfig => ({
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes(nf, manifest), withNavigationErrorHandler(redirectToRemoteUnavailable)),
  ],
});
