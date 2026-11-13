import { initFederation, type NativeFederationResult } from '@angular-architects/native-federation';

initFederation('federation.manifest.json', {
  hostRemoteEntry: {
    url: './remoteEntry.json',
  },
})
  .then((nf: NativeFederationResult) =>
    import('./bootstrap').then(({ bootstrap }) => bootstrap(nf)),
  )
  .catch((error) => {
    console.error('Native Federation initialization failed:', error);
  });
