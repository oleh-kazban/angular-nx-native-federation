import {
  withNativeFederation,
  fromPackageJson,
  mappingsFromWorkspace,
} from '@angular-architects/native-federation/config';

export default withNativeFederation({
  name: 'shell',

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

  sharedMappings: mappingsFromWorkspace({
    singleton: true,
    strictVersion: true,
  }).only(['@client-portal/shared/demo-contracts', '@client-portal/shared/ui']),

  // Please read our docs about configuring native federation:
  // https://native-federation.com/docs/v4/angular-adapter/configuration/

  features: {
    denseChunking: true,
    denseExternals: true,
    strictImports: false,
  },
});
