import {
  withNativeFederation,
  fromPackageJson,
  mappingsFromWorkspace,
} from '@angular-architects/native-federation/config';

export default withNativeFederation({
  name: 'dashboard',

  exposes: {
    './Routes': './apps/dashboard/src/app/remote-entry/entry.routes.ts',
  },
  //shareScope: autoShareScope({level: 'minor'}),

  shared: fromPackageJson({
    singleton: true,
    strictVersion: true,
    requiredVersion: 'auto',
  })
    .skip(['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'])
    .patch(['@angular/*'], {
      includeSecondaries: {
        keepAll: true,
      },
    }),
  //sharedMappings: mappingsFromWorkspace({ singleton: true }).filter(['@my-org/*']).get(),
  sharedMappings: mappingsFromWorkspace({
    singleton: true,
    strictVersion: true,
  }).only(['@client-portal/shared/demo-contracts']),

  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'],

  // Please read our docs about configuring native federation:
  // https://native-federation.com/docs/v4/angular-adapter/configuration/

  features: {
    denseChunking: true,
    denseExternals: true,
    strictImports: false,
  },
});
