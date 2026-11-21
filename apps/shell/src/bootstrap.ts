import { bootstrapApplication } from '@angular/platform-browser';
import {
  type FederationManifest,
  type NativeFederationResult,
} from '@angular-architects/native-federation';

import { App } from './app/app';
import { appConfig } from './app/app.config';

export const bootstrap = (nf: NativeFederationResult, manifest: FederationManifest) =>
  bootstrapApplication(App, appConfig(nf, manifest));
